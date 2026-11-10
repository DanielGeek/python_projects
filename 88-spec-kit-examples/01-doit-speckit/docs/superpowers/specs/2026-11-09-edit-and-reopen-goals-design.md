# Edit and Reopen Goals — Design

Date: 2026-11-09
Status: Approved design, pending implementation plan
Builds on: `specs/001-goal-tracking-board`, `specs/003-goal-drag-reorder`

## Purpose

Users can fix a typo or move the deadline on a **current** goal, and can bring a **completed** goal back to Current (marked done by mistake, or work continues). The app is local-first (localStorage), so this is a client-only change with no routing, server, or dependency impact.

## Constraints

- **Constitution Principle V:** no automated tests of any kind — no test files, no TDD steps, no test tasks in the plan. Verification is `npm run lint`, `npm run build`, and a manual walkthrough.
- **Principle IV:** no new dependencies.
- **Principles II / III:** one obvious action per control, plain-language labels and errors, touch targets at least 44x44 px (`h-11`), keyboard accessible.
- **AGENTS.md:** Next.js 16 has breaking changes; read the relevant guide in `node_modules/next/dist/docs/` before writing any framework code. This feature only touches client components and the client store.
- Reuse `validateGoalInput` and `TITLE_MAX_LENGTH` (`lib/goals.ts`), the `save` / `getSnapshot` pattern (`lib/goal-store.ts`), and the add dialog (generalized, not duplicated).

## Decisions

| Question | Decision |
|---|---|
| Editing an overdue goal: keep its past end date? | **Yes.** A past date is accepted only if it equals the goal's current end date. Any newly picked date must be today or later. |
| Where does a reopened goal go in the manual order? | **End of the Current list.** `reopenGoal` pins the displayed order and appends the goal's id. With no manual order, the end-date sort applies as usual. |
| Where does Edit live? | In the existing action row revealed by ticking a current goal's checkbox (next to "Move to completed" and "Delete permanently"). |
| Where does Reopen live? | A button directly on each completed card. |
| Dialog strategy | Generalize the add dialog into one dialog with add and edit modes. |

### Why reopen must touch the manual order

`completeGoal` never removes a goal's id from the stored manual order (`doit:goal-order:v1`). `orderCurrent` ignores ids that are not current, but keeps them in the list. If `reopenGoal` only flipped the status, the goal would jump back to its **old manual position**. Removing the id would not be enough either: goals added after the last drag are also "unplaced" and sorted by `createdAt`, so an older reopened goal would land above them. Instead `reopenGoal` writes the displayed order (`orderCurrent` on the goals before the status flip) plus the reopened id, so it is always last.

## Design

### `lib/goals.ts`

- `validateGoalInput(title, endDate, today, currentEndDate?)`: the "Choose today or a later date." error fires only when `endDate < today` **and** `endDate !== currentEndDate`. Add mode passes no fourth argument and behaves exactly as before.

### `lib/goal-store.ts`

- `updateGoal(id, title, endDate)`: maps over `getSnapshot()`, replaces `title` (trimmed) and `endDate` on the matching goal, then calls `save`. Status, `createdAt`, `completedAt` and manual order are untouched. No-op if the id is not found.
- `reopenGoal(id)`: sets `status: "current"` and `completedAt: null`, keeping title and end date, via `save`. If a manual order exists, it also pins the currently displayed order and appends this id (with no manual order none is created). No-op if the id is not found or the goal is not completed.
- Extract the order-persisting body of `reorderGoals` (set in-memory `order`, write localStorage in try/catch, `notify`) into a small shared helper used by both `reorderGoals` and `reopenGoal`. Avoid notifying twice for a single reopen if it can be done cleanly (update both module variables, persist both keys, notify once).

### `components/goal-dialog.tsx` (renamed from `add-goal-dialog.tsx` with `git mv`)

- Props: `open`, `onOpenChange`, `today`, optional `goal?: Goal`, and `onSubmit(title, endDate)` (replacing `onAdd`).
- The form is already mounted only while the dialog is open, so initial state is derived from `goal` (title and end date) or empty strings.
- Edit mode (`goal` present): heading "Edit goal", description "Update the title or end date.", submit button "Save changes", `validateGoalInput(..., goal.endDate)`, and the date input's `min` is the smaller of `today` and `goal.endDate` so the browser picker does not flag a kept past date.
- Add mode: unchanged copy and behavior ("Add a goal", "Add goal").
- Rename the form component and prop types accordingly (`GoalForm`).

### `components/goal-card.tsx`

- New `onEdit: () => void` prop. Add an **Edit** button (`variant="outline"`, `className="h-11"`) to the checked-state action row.

### `components/completed-goal-card.tsx`

- New `onReopen: () => void` prop. Add a **Reopen** button (`variant="outline"`, `className="h-11"`) below the "Completed …" line, with a `mt-3` gap. It needs an accessible name that includes the title (for example `aria-label={`Reopen goal: ${goal.title}`}`), matching how the other cards label controls.

### `components/goal-board.tsx`

- New state `editingId: string | null`; derive `editingGoal = goals.find(g => g.id === editingId)`.
- Render the goal dialog for both modes (one instance driven by `isAddOpen` / `editingGoal`, or two instances if the plan finds that clearer).
- Edit submit: `updateGoal(editingId, title, endDate)`, clear the checkbox selection for that id, close the dialog. This matches Complete and Delete.
- Pass `onEdit={() => setEditingId(goal.id)}` through `SortableGoalColumn` to `GoalCard`, and `onReopen={() => reopenGoal(goal.id)}` to `CompletedGoalCard`. `sortable-goal-list.tsx` only forwards props; check it for the exact prop plumbing.
- If the goal being edited disappears (for example deleted in another tab, so `editingGoal` is `undefined`), the dialog closes, as `DeleteGoalDialog` does.

### Ordering side effects

- No manual order: changing the end date re-sorts Current automatically by end date.
- Manual order set: an edited goal keeps its position.
- Reopened goal: last in Current in both cases (by end date when there is no manual order).

## Edge cases and errors

- Same inline field errors as add mode. Whitespace-only titles are rejected; titles over `TITLE_MAX_LENGTH` are rejected.
- An edit with no changes simply closes the dialog; no special handling.
- A reopened goal whose end date has passed shows "N days overdue" with the urgent style. That is accurate, and the user can then edit the date. Reopen does not prompt for a new date, to keep it one click.
- localStorage unavailable or full: the in-memory store still updates, as with existing actions.

## Out of scope

- Editing completed goals, bulk edit or bulk reopen, undo, edit history, and changing a goal's `createdAt` or `completedAt`.
- Any automated tests (Principle V).

## Verification

`npm run lint` and `npm run build` must pass. Manual walkthrough:

1. Edit a current goal's title; edit its end date; confirm the list re-sorts when there is no manual order and keeps position when there is one.
2. Edit an overdue goal: the title can change with the past date kept; picking a different past date shows "Choose today or a later date."
3. Empty and over-long titles show inline errors; Cancel and Escape leave the goal unchanged.
4. Reopen a completed goal with no manual order (sorted by end date) and with a manual order (appears last, not at its old position).
5. Reopen a goal that was overdue: it shows as overdue in Current.
6. Keyboard-only: tick, Edit, change fields, save; Tab to Reopen and activate it. Check at phone width: the buttons wrap with no horizontal scroll and are at least 44 px tall.
