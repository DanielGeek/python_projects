# Contract: Reorder Interaction (UI)

Applies to the **Current goals** list only. The Completed goals list has no handle and no sorting.

## Handle

- Each current goal card shows a "Move" handle: grip icon plus the visible text "Move". It is a `<button>`
  with `aria-label="Move goal: <title>"`, at least 44x44 px, with a visible focus ring.
- Only the handle starts a drag. The checkbox, "Move to completed", and "Delete permanently" never do (FR-010).
- With a single goal in the list the handle is not shown (nothing to reorder).

## Pointer and touch

| Action | Result |
| --- | --- |
| Press and drag the handle | Card lifts (distinct style); a placeholder shows where it will land (FR-003). |
| Drag near the list's top or bottom edge | The list scrolls so out-of-view goals can be reached. |
| Release inside the list | Goal lands at the placeholder; order saved. |
| Release outside the list | Order unchanged (FR-004). |
| Press Escape, then release | Order unchanged (FR-004). |
| Drop at the original position | No change, no write. |

## Keyboard

| Key (handle focused) | Result |
| --- | --- |
| Space or Enter | Pick up the goal (ring + live message). Pressed again: drop. |
| ArrowUp / ArrowDown (picked up) | Move one place; focus stays on the handle. At the ends, stays put and announces it. |
| Escape (picked up) | Cancel and restore the original position. |
| Tab or blur (picked up) | Drop at the current position. |

Live region (`aria-live="polite"`): "Picked up <title>, position N of M", "Moved to position N of M",
"Dropped at position N of M", "Reorder cancelled".

## Persistence trigger

The order is saved once per completed drop or keyboard drop, not on every intermediate move.
