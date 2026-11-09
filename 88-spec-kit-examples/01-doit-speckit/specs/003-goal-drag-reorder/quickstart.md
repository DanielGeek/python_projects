# Quickstart: Manual Validation

No automated tests exist or will be added (constitution Principle V). Validate by hand.

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
```

Clear `localStorage` for the site, then add 4 goals with different end dates (for example +1, +5, +9, +20 days).

## Walkthrough

1. **Default order**: before any drag, goals are sorted nearest end date first.
2. **Drag down/up (spec US1)**: drag the first goal below the third; drag the last goal to the top. The
   placeholder shows the landing spot and the result matches it.
3. **Cancel**: drag a goal and release outside the list; the order is unchanged. Drag and press Escape, then
   release; the order is unchanged.
4. **Controls do not drag**: click a checkbox and the action buttons; no reorder happens.
5. **Persistence (US2)**: reload the page; the custom order is kept. Check `doit:goal-order:v1` in devtools.
6. **Frozen order**: add a goal with the nearest date; it appears at the bottom, not the top. Complete one goal
   and delete another; the remaining goals keep their relative order.
7. **Keyboard (US3)**: Tab to a "Move" handle, press Space, ArrowDown twice, Space. The order changes, focus
   stays on the handle, and the announcement is read. Repeat with Escape to cancel.
8. **Touch (US3)**: in devtools device mode, drag from the handle; the page does not scroll while dragging.
9. **Edge cases**: a 100-character title; a highlighted (due-soon) goal stays highlighted while dragged; the
   Completed column has no handle; a single goal shows no handle; 360 px width has no horizontal scroll.
10. **Existing user**: remove only `doit:goal-order:v1`; the list returns to end-date order.

## Quality gates

```bash
npm run lint
npm run build
```

Both must pass.
