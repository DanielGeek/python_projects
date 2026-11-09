import { useEffect, useRef, type RefObject } from "react";
import Sortable, { type SortableEvent } from "sortablejs";

const HANDLE_SELECTOR = ".goal-handle";

/** SortableJS sets `originalEvent` at runtime, but `@types/sortablejs` does not declare it on `SortableEvent`. */
type EndEvent = SortableEvent & { originalEvent?: Event };

type Point = { x: number; y: number };

function pointOf(event: Event | undefined): Point | null {
  if (event === undefined) return null;
  if ("changedTouches" in event) {
    const touch = (event as TouchEvent).changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  if ("clientX" in event) {
    const { clientX, clientY } = event as MouseEvent;
    return { x: clientX, y: clientY };
  }
  return null;
}

function isInside(rect: DOMRect, point: Point): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

/**
 * Lets the user drag list items (from their "Move" handle) to reorder them.
 * SortableJS moves DOM nodes itself, so each dragged node is put back and
 * `onReorder` is called instead; React then re-renders the list in the new order.
 */
export function useSortableList(
  listRef: RefObject<HTMLUListElement | null>,
  onReorder: (from: number, to: number) => void,
  /** False while the list element is not rendered (for example when it is empty). */
  active: boolean,
): void {
  const onReorderRef = useRef(onReorder);
  useEffect(() => {
    onReorderRef.current = onReorder;
  });

  useEffect(() => {
    const list = listRef.current;
    if (!active || list === null) return;

    let escapePressed = false;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") escapePressed = true;
    };

    const sortable = Sortable.create(list, {
      handle: HANDLE_SELECTOR,
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      onStart: () => {
        escapePressed = false;
        document.addEventListener("keydown", handleKeyDown);
      },
      onEnd: (event: EndEvent) => {
        document.removeEventListener("keydown", handleKeyDown);
        const { item, from, oldIndex, newIndex } = event;

        // Hand the DOM back to React: undo SortableJS's move.
        from.removeChild(item);
        from.insertBefore(item, from.children[oldIndex ?? 0] ?? null);

        const point = pointOf(event.originalEvent);
        const droppedOutside =
          point !== null && !isInside(list.getBoundingClientRect(), point);
        if (escapePressed || droppedOutside) return;
        if (oldIndex === undefined || newIndex === undefined) return;
        if (oldIndex !== newIndex) onReorderRef.current(oldIndex, newIndex);
      },
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      sortable.destroy();
    };
  }, [listRef, active]);
}
