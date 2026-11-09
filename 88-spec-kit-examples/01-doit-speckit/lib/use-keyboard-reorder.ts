import {
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { moveId } from "@/lib/goals";

type Picked = { id: string; originalIds: string[] };

/**
 * Keyboard reordering for the "Move" handles: Space or Enter picks a goal up
 * and drops it, ArrowUp and ArrowDown move it one place, Escape cancels.
 * While a goal is picked up, `orderedIds` is the live order to render.
 */
export function useKeyboardReorder(
  ids: string[],
  onReorder: (ids: string[]) => void,
) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [workingIds, setWorkingIds] = useState<string[]>(ids);
  const [message, setMessage] = useState("");
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const isMovingRef = useRef(false);

  // Moving a node in the DOM can drop focus; put it back on the same handle.
  useLayoutEffect(() => {
    if (isMovingRef.current) {
      handleRef.current?.focus();
      isMovingRef.current = false;
    }
  }, [workingIds]);

  const orderedIds = picked === null ? ids : workingIds;

  function position(list: string[], id: string): string {
    return `position ${list.indexOf(id) + 1} of ${list.length}`;
  }

  function drop(id: string) {
    const changed = workingIds.some((workingId, i) => workingId !== ids[i]);
    if (changed) onReorder(workingIds);
    setMessage(`Dropped at ${position(workingIds, id)}`);
    setPicked(null);
  }

  function move(id: string, step: -1 | 1) {
    const from = workingIds.indexOf(id);
    const to = from + step;
    if (to < 0 || to >= workingIds.length) {
      setMessage(`Already at the ${step < 0 ? "top" : "bottom"}`);
      return;
    }
    const next = moveId(workingIds, from, to);
    isMovingRef.current = true;
    setWorkingIds(next);
    setMessage(`Moved to ${position(next, id)}`);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    id: string,
    title: string,
  ) {
    handleRef.current = event.currentTarget;
    const isActive = picked?.id === id;

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (isActive) {
        drop(id);
      } else {
        setPicked({ id, originalIds: ids });
        setWorkingIds(ids);
        setMessage(`Picked up ${title}, ${position(ids, id)}`);
      }
      return;
    }
    if (!isActive) return;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      move(id, event.key === "ArrowUp" ? -1 : 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setWorkingIds(picked.originalIds);
      setPicked(null);
      setMessage("Reorder cancelled");
    }
  }

  function handleBlur(id: string) {
    if (picked?.id === id && !isMovingRef.current) drop(id);
  }

  function getHandleProps(
    id: string,
    title: string,
  ): ButtonHTMLAttributes<HTMLButtonElement> {
    return {
      onKeyDown: (event) => handleKeyDown(event, id, title),
      onBlur: () => handleBlur(id),
      "aria-pressed": picked?.id === id,
    };
  }

  return { orderedIds, pickedId: picked?.id ?? null, message, getHandleProps };
}
