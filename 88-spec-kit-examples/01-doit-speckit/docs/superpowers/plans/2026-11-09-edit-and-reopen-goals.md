# Edit and Reopen Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users edit a current goal's title and end date, and reopen a completed goal back to Current.

**Architecture:** Client-only change. `lib/goals.ts` gains an optional "kept date" in validation; `lib/goal-store.ts` gains `updateGoal` and `reopenGoal`; the add dialog is generalized into one `GoalDialog` with add and edit modes; `GoalCard` and `CompletedGoalCard` get Edit and Reopen buttons wired in `GoalBoard`.

**Tech Stack:** Next.js 16.4.5, React 19.3.0, Tailwind 4, shadcn/ui, date-fns. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-09-edit-and-reopen-goals-design.md`

All paths below are relative to `88-spec-kit-examples/01-doit-speckit/`; run every command from that directory. Work on branch `004-edit-reopen-goals`.

## Global Constraints

- **No automated tests of any kind** (constitution Principle V): no test files, test frameworks, TDD steps, or coverage targets. Per-task verification is `npm run lint`, `npm run build`, and a manual browser check.
- No new runtime dependencies (Principle IV). Use shadcn `Button` (`variant="outline"`) already in `components/ui`.
- TypeScript strict; no `any`; no dead or commented-out code (Principle I).
- Touch targets at least 44x44 px: new buttons use `className="h-11"`. Mobile-first, no horizontal scroll (Principle III).
- Calendar dates are `yyyy-MM-dd` strings; compare them as strings, as `validateGoalInput` already does.
- Storage keys are `doit:goals:v1` (goals) and `doit:goal-order:v1` (manual order id list).
- Next.js 16 has breaking changes (`AGENTS.md`). This plan only touches client components and the client store, so no framework API is used beyond what the files already use. If a task needs one, read `node_modules/next/dist/docs/` first.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01Px4juZvt5MKmVjVPmFCxjC`

## Manual check setup (used by every task)

Run `npm run dev` and open `http://localhost:3000`. To seed goals in the browser console:

```js
localStorage.setItem("doit:goals:v1", JSON.stringify([
  { id: "a", title: "Overdue goal", endDate: "2020-01-01", status: "current", createdAt: "2026-01-01T00:00:00.000Z", completedAt: null },
  { id: "b", title: "Future goal", endDate: "2099-01-01", status: "current", createdAt: "2026-01-02T00:00:00.000Z", completedAt: null },
  { id: "c", title: "Done goal", endDate: "2020-02-01", status: "completed", createdAt: "2026-01-03T00:00:00.000Z", completedAt: "2026-01-10" },
]));
location.reload();
```

To seed a manual order: `localStorage.setItem("doit:goal-order:v1", JSON.stringify(["b","a"])); location.reload();`. To clear it: `localStorage.removeItem("doit:goal-order:v1"); location.reload();`.

## Review Focus

Most likely first. Each is pinned by a manual-check step in the owning task.

1. Editing an **overdue** goal's title with its past end date unchanged must save, not demand a new date (Task 2).
2. On that same overdue goal, picking a **different** past date must still show "Choose today or a later date." (Task 2).
3. A goal **deleted in another tab** while its edit dialog is open must close the dialog without crashing (Task 2).
4. A goal reopened while a **manual order** exists must appear last, and still be last after a page reload (Task 3).
5. Reopening with **no manual order** must not create the order key; Current stays sorted by end date (Task 3).

## File Structure

| File | Change |
|---|---|
| `lib/goals.ts` | `validateGoalInput` gains optional 4th param |
| `lib/goal-store.ts` | add `updateGoal`, `reopenGoal`; small persistence refactor |
| `components/add-goal-dialog.tsx` → `components/goal-dialog.tsx` | `git mv`; generalize to add/edit |
| `components/goal-card.tsx` | `onEdit` prop and Edit button |
| `components/sortable-goal-list.tsx` | forward `onEdit` to `GoalCard` |
| `components/completed-goal-card.tsx` | `onReopen` prop and Reopen button |
| `components/goal-board.tsx` | edit state, dialog wiring, reopen wiring |

---

### Task 1: Validation, store functions, and generalized dialog (add mode unchanged)

**Files:**
- Modify: `lib/goals.ts` (`validateGoalInput`)
- Modify: `lib/goal-store.ts`
- Rename + modify: `components/add-goal-dialog.tsx` → `components/goal-dialog.tsx`
- Modify: `components/goal-board.tsx` (import and props only)

**Interfaces:**
- Produces:
  - `validateGoalInput(title: string, endDate: string, today: string, keptEndDate?: string): GoalInputErrors`
  - `updateGoal(id: string, title: string, endDate: string): void` (exported from `lib/goal-store.ts`)
  - `reopenGoal(id: string): void` (exported from `lib/goal-store.ts`)
  - `GoalDialog` props: `{ open: boolean; onOpenChange: (open: boolean) => void; today: string; goal?: Goal; onSubmit: (title: string, endDate: string) => void }`

- [ ] **Step 1: Extend `validateGoalInput`** in `lib/goals.ts` with the optional fourth parameter `keptEndDate?: string`. The "Choose today or a later date." error applies only when `endDate < today && endDate !== keptEndDate`. All other rules and messages stay as they are.

- [ ] **Step 2: Add `updateGoal` and `reopenGoal`** in `lib/goal-store.ts`.
  - `updateGoal`: map over `getSnapshot()`; for the matching id, set `title` to `title.trim()` and `endDate`; leave every other field and the manual order alone; persist via `save`. An unknown id changes nothing.
  - `reopenGoal`: for the matching completed goal set `status: "current"` and `completedAt: null` (title and end date kept). If `getOrderSnapshot()` is not `null`, also set `order` to a copy without this id. Persist both keys and call `notify()` **once**. An unknown id changes nothing.
  - Persistence refactor to support this: extract a private `persist(key: string, value: unknown): void` (the existing try/catch around `localStorage.setItem(key, JSON.stringify(value))`, same swallow-and-keep-in-memory comment). Use it in `save`, `reorderGoals` and `reopenGoal`. Behavior of `save` and `reorderGoals` must not change.

- [ ] **Step 3: Rename the dialog.** Run `git mv components/add-goal-dialog.tsx components/goal-dialog.tsx`.

- [ ] **Step 4: Generalize the dialog** in `components/goal-dialog.tsx`: export `GoalDialog` (was `AddGoalDialog`) and rename `AddGoalForm` to `GoalForm`, with the props in the Interfaces block (`onAdd` becomes `onSubmit`). Behavior:
  - Add mode (`goal` undefined) is identical to today: heading "Add a goal", description "What do you want to achieve, and by when?", submit "Add goal", empty initial fields, date `min={today}`.
  - Edit mode (`goal` present): heading "Edit goal", description "Update the title or end date.", submit "Save changes", initial `title` and `endDate` state taken from `goal`, validation called as `validateGoalInput(title, endDate, today, goal.endDate)`, and the date input `min` set to the smaller of `today` and `goal.endDate` (string compare).
  - Keep the "mounted only while open" form so state resets on every open.

- [ ] **Step 5: Update `components/goal-board.tsx`**: import `GoalDialog` from `@/components/goal-dialog` and pass `onSubmit={addGoal}` instead of `onAdd={addGoal}`. No other board change in this task.

- [ ] **Step 6: Verify.**
  - Run: `npm run lint`. Expected: no errors or warnings.
  - Run: `npm run build`. Expected: build succeeds with no type errors.
  - Manual: in the browser, add a goal (Add goal → fill title and date → Add goal); it appears in Current. Submit empty and past-date forms: the same errors as before appear. `updateGoal` and `reopenGoal` are not wired to the UI yet; that is expected.

- [ ] **Step 7: Commit** `lib/goals.ts`, `lib/goal-store.ts`, `components/goal-dialog.tsx` and `components/goal-board.tsx` with message `feat: generalize goal dialog and add update and reopen store functions` plus the trailers. Run `git status` first and confirm `add-goal-dialog.tsx` shows as renamed to `goal-dialog.tsx`.

---

### Task 2: Edit a current goal

**Files:**
- Modify: `components/goal-card.tsx`
- Modify: `components/sortable-goal-list.tsx`
- Modify: `components/goal-board.tsx`

**Interfaces:**
- Consumes: `GoalDialog` (with `goal` and `onSubmit`) and `updateGoal` from Task 1.
- Produces:
  - `GoalCard` new prop `onEdit: () => void`
  - `SortableGoalColumn` new prop `onEdit: (id: string) => void`

- [ ] **Step 1: `GoalCard`**: add required prop `onEdit: () => void` and an **Edit** button in the checked-state action row, between "Move to completed" and "Delete permanently". Use `variant="outline"` and `className="h-11"`; its click calls `onEdit`.

- [ ] **Step 2: `SortableGoalColumn`**: add required prop `onEdit: (id: string) => void` and pass `onEdit={() => onEdit(goal.id)}` to each `GoalCard`.

- [ ] **Step 3: `GoalBoard`**:
  - Add state `editingId: string | null` (initially `null`) and derive `editingGoal = goals.find((goal) => goal.id === editingId)` next to `pendingDelete`.
  - Pass `onEdit={setEditingId}` to `SortableGoalColumn`.
  - Render a second dialog only while a goal is being edited: `{editingGoal && <GoalDialog key={editingGoal.id} open onOpenChange={(open) => { if (!open) setEditingId(null); }} today={today} goal={editingGoal} onSubmit={handleEditSubmit} />}`. Conditional rendering is deliberate: it avoids the dialog flipping to "Add a goal" copy while closing, and it makes a goal deleted elsewhere close the dialog (`editingGoal` becomes `undefined`).
  - `handleEditSubmit(title: string, endDate: string): void`: call `updateGoal(editingGoal.id, title, endDate)` and `setChecked(editingGoal.id, false)`. The dialog calls `onOpenChange(false)` after submit, which clears `editingId`, so `handleEditSubmit` does not need to.

- [ ] **Step 4: Verify.**
  - Run: `npm run lint`. Expected: no errors or warnings.
  - Run: `npm run build`. Expected: succeeds.
  - Manual (seed from setup; overdue goal "Overdue goal", future goal "Future goal"):
    1. Tick "Future goal": **Edit** appears beside the other two buttons. Click it: dialog "Edit goal" opens prefilled. Change the title and date, "Save changes": the card shows the new title and days left, and the checkbox selection is cleared.
    2. With no manual order, move a goal's date earlier than another's: the list re-sorts. With a manual order seeded, edit a date: position does not change.
    3. **(Review Focus 1)** Tick "Overdue goal", Edit, change only the title: saves, and the goal still reads "N days overdue".
    4. **(Review Focus 2)** Edit "Overdue goal" again and pick a different past date: "Choose today or a later date." appears and nothing is saved. Picking today saves.
    5. Clear the title: "Enter a title for your goal." appears. A whitespace-only title is rejected the same way. Cancel and Escape leave the goal unchanged.
    6. **(Review Focus 3)** Open the edit dialog in tab A. In tab B, delete that goal. Back in tab A the dialog closes and the board shows no error.
    7. Keyboard only: Tab to the checkbox, Space, Tab to Edit, Enter; Tab through the fields and submit with Enter. At a 375 px wide viewport the three buttons wrap with no horizontal scroll.

- [ ] **Step 5: Commit** with message `feat: edit a current goal's title and end date` plus the trailers.

---

### Task 3: Reopen a completed goal

**Files:**
- Modify: `components/completed-goal-card.tsx`
- Modify: `components/goal-board.tsx`

**Interfaces:**
- Consumes: `reopenGoal(id: string): void` from Task 1.
- Produces: `CompletedGoalCard` new prop `onReopen: () => void`.

- [ ] **Step 1: `CompletedGoalCard`**: add required prop `onReopen: () => void` and a **Reopen** button below the "Completed …" line (`variant="outline"`, `className="mt-3 h-11"`), with `aria-label={`Reopen goal: ${goal.title}`}`. Import `Button` from `@/components/ui/button`.

- [ ] **Step 2: `GoalBoard`**: import `reopenGoal` from `@/lib/goal-store` and pass `onReopen={() => reopenGoal(goal.id)}` to each `CompletedGoalCard`.

- [ ] **Step 3: Verify.**
  - Run: `npm run lint`. Expected: no errors or warnings.
  - Run: `npm run build`. Expected: succeeds.
  - Manual (seed from setup):
    1. **(Review Focus 5)** With the order key cleared (`localStorage.getItem("doit:goal-order:v1")` is `null`), click "Reopen" on "Done goal": it moves to Current, sorted by end date (it is the oldest, so it is first), and `localStorage.getItem("doit:goal-order:v1")` is **still `null`**.
    2. The reopened goal's end date is in the past, so it shows "N days overdue" with the urgent style; its checkbox, Edit and Move to completed work. Edit it to a future date.
    3. **(Review Focus 4)** Reset the seed. Tick "Future goal" and "Move to completed", reorder the remaining current goals by dragging (add one more goal if needed) so the order key exists, then reopen "Future goal". It appears **last** in Current, and still last after `location.reload()`. Confirm the stored order no longer contains its id.
    4. Complete → reopen → complete the same goal twice: no duplicate cards, and Completed shows the newest completion date.
    5. Keyboard: Tab to a Reopen button and press Enter. At 375 px width the button is at least 44 px tall and the card does not overflow.

- [ ] **Step 4: Commit** with message `feat: reopen a completed goal to Current` plus the trailers.

- [ ] **Step 5: Final branch check.** Run `npm run lint && npm run build` once more on the finished branch. Expected: both pass. Then run `git status --short`. Expected: clean.
