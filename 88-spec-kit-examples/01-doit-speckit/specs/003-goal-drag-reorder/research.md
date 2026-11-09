# Research: Goal Drag-and-Drop Reordering

No `NEEDS CLARIFICATION` items remain. These are the decisions that shape the design.

## 1. Which "sortable" library

- **Decision**: `sortablejs` (SortableJS) used directly, with `@types/sortablejs` for types.
- **Rationale**: The user asked for "the sortable library" for sorting list items. SortableJS is the library
  named Sortable, is small, framework-agnostic, and supports mouse, touch, a handle, a drop placeholder, and
  auto-scroll. Using it directly avoids a React wrapper.
- **Alternatives considered**: `react-sortablejs` (a wrapper that is thin and lags behind React 19, so not worth
  the risk); `@dnd-kit/sortable` (built-in keyboard support, but heavier, more packages, and not the library the
  user named); native HTML5 drag and drop (no touch support).
- **Open point**: "sortable" could also mean `@dnd-kit/sortable`. If so, say so before `/speckit-tasks`; the
  data model, storage contract, and UI contract below do not change, only the two hooks.

## 2. Using SortableJS with React 19

- **Decision**: Create the instance in a `useEffect` on the list element and destroy it on cleanup. On the
  `onEnd` event, put the dragged DOM node back at its original index, then update the stored order so React
  re-renders the list in the new order.
- **Rationale**: SortableJS moves DOM nodes itself. If React is not told, its virtual tree and the real DOM
  disagree on the next render. Reverting the node and letting React own the DOM is the standard safe pattern.
- **Alternatives considered**: letting SortableJS own the DOM (breaks on the next React render); keying the list
  to force a remount (loses focus and scroll position).

## 3. Starting a drag only from a handle

- **Decision**: Use the `handle` option so only the "Move" handle starts a drag. Give the handle
  `touch-action: none` (Tailwind `touch-none`) so touch dragging does not fight page scrolling.
- **Rationale**: Satisfies FR-010 (checkbox and buttons never start a drag), FR-012 (discoverable, at least
  44x44 px), and keeps column scrolling working on phones. A long-press delay is not needed with a handle.
- **Alternatives considered**: whole card as the drag target with `filter` for buttons (accidental drags while
  scrolling on touch, and the checkbox area is easy to mis-tap).

## 4. Keyboard reordering

- **Decision**: Own hook `use-keyboard-reorder`. The handle is a real `<button>`. Space or Enter picks up the
  goal, ArrowUp and ArrowDown move it one place, Space or Enter drops it, Escape cancels and restores the
  original position. A visually hidden `aria-live="polite"` region announces "Picked up X, position 2 of 5",
  "Moved to position 1 of 5", "Dropped at position 1 of 5", and "Cancelled".
- **Rationale**: SortableJS has no keyboard support, and FR-009 requires it. This is the common pattern for
  accessible sortable lists and needs about 60 lines.
- **Alternatives considered**: separate up/down buttons on every card (more clutter, violates Simple UX);
  switching to a library with keyboard support (contradicts the user's choice of library).

## 5. Cancelling a mouse or touch drag

- **Decision**: SortableJS has no cancel gesture. In `onEnd`, treat the drag as cancelled when the drop point is
  outside the list element's bounding box, or when Escape was pressed during the drag (a `keydown` listener is
  attached in `onStart` and removed in `onEnd`). A cancelled drag reverts the node and does not change the order.
- **Rationale**: Meets FR-004 (release outside the list or press Escape). Known limit: after Escape, the
  placeholder stays under the pointer until the user releases; the order then stays unchanged on release.
- **Alternatives considered**: aborting the drag immediately on Escape by dispatching a synthetic pointer-up
  (fragile across browsers).

## 6. Where the order is stored

- **Decision**: A separate `localStorage` key `doit:goal-order:v1` holding the ordered ids of current goals, or
  absent. `null` means "never reordered, sort by end date". The `Goal` type and `doit:goals:v1` do not change.
- **Rationale**: Gives the "first drag freezes the list" rule (spec FR-006) a clear on/off state without a
  schema migration. Goals missing from the order (added later) are appended in creation order, which gives
  "new goals go to the bottom" (FR-007) for free. Ids of completed or deleted goals are ignored when reading
  (FR-008), so no cleanup writes are needed.
- **Alternatives considered**: a `position` field on each `Goal` (needs a migration and rewrites many goals on
  every drag; also cannot express "never reordered" without a sentinel).

## 7. Visual feedback

- **Decision**: Use SortableJS class options (`ghostClass`, `chosenClass`, `dragClass`) mapped to Tailwind
  utilities through arbitrary variants on the list (for example `[&_.sortable-ghost]:opacity-40`), using only
  existing color roles from `app/globals.css`. The keyboard "picked up" state uses a ring on the card.
- **Rationale**: Meets FR-003 (dragged goal is distinct, landing spot is clear) with no new CSS file and no
  new color tokens. The existing due-soon highlight stays on the card while it is dragged.
- **Alternatives considered**: custom CSS in `globals.css` (extra surface for no benefit).
