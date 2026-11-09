---

description: "Task list for the Goal Drag-and-Drop Reordering feature"
---

# Tasks: Goal Drag-and-Drop Reordering

**Input**: Design documents from `/specs/003-goal-drag-reorder/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage.md, contracts/reorder-interaction.md, quickstart.md

**Tests**: NONE. Constitution Principle V forbids unit, integration, and end-to-end tests, so this list has no test
tasks. Each story ends with a manual check taken from [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story the task belongs to (US1 to US3)
- Paths are relative to the repository root (Next.js App Router, no `src/` directory, alias `@/*` = `./*`)
- The new library is `sortablejs` (SortableJS) used directly, not a React wrapper (research.md Decision 1)
- Use only existing color roles from `app/globals.css`; do not add tokens or CSS files (research.md Decision 7)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the one new dependency and read the framework guidance required by `AGENTS.md`.

- [ ] T001 Install the dependency: run `npm install sortablejs` and then `npm install -D @types/sortablejs`, updating `package.json` and `package-lock.json`; do not change the Next.js, React, or Tailwind versions (constitution Technology Stack)
- [ ] T002 Skim the Client Components guidance under `node_modules/next/dist/docs/01-app/` (as `AGENTS.md` requires before writing framework code) and note anything that affects a `"use client"` component using `useEffect` and refs; no file is changed by this task

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure ordering logic that every story uses.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Edit `lib/goals.ts`: add three exported pure functions and keep `sortCurrent` unchanged. (a) `isIdList(value: unknown): value is string[]` returns true only for an array whose items are all strings. (b) `moveId(ids: string[], from: number, to: number): string[]` returns a new array with the id at index `from` moved to index `to`, and returns `ids` unchanged when `from === to` or either index is out of range. (c) `orderCurrent(goals: Goal[], order: string[] | null): Goal[]` per [data-model.md](data-model.md): keep only goals with `status === "current"`; if `order` is `null` return `sortCurrent(goals)`; otherwise return the current goals whose id is in `order` in that order, followed by current goals not in `order` sorted by `createdAt` oldest first. Quote from data-model.md: "Ids in `order` that are not current goals (completed, deleted, unknown) are ignored." Strict types, no `any`

**Checkpoint**: Ordering logic ready; the user stories can now begin.

---

## Phase 3: User Story 1 - Reorder current goals by dragging (Priority: P1) 🎯 MVP

**Goal**: A user drags a goal by its "Move" handle above or below another goal and it stays there (spec FR-001 to FR-004, FR-010 to FR-013).

**Manual check**: [quickstart.md](quickstart.md) steps 1 to 4 and 9.

### Implementation for User Story 1

- [ ] T004 [US1] Edit `lib/goal-store.ts`: add the order state next to the goals state, following the same pattern. Add `const ORDER_STORAGE_KEY = "doit:goal-order:v1"`; an in-memory `order: string[] | null | undefined` (`undefined` = not read yet); `readOrderFromStorage()` that returns the parsed value only when it passes `isIdList` and otherwise `null` (absent, unparsable, or not an array of strings = "never reordered", see [contracts/storage.md](contracts/storage.md)); `getOrderSnapshot()` that reads once and then returns the same cached reference (required by `useSyncExternalStore`); `export function useGoalOrder(): string[] | null` using `useSyncExternalStore(subscribe, getOrderSnapshot, () => null)`; and `export function reorderGoals(ids: string[]): void` that sets the in-memory order, writes it to `localStorage` inside try/catch (on failure keep the in-memory value), and calls `notify()`. Do not change the `Goal` type, `STORAGE_KEY`, `addGoal`, `completeGoal`, or `deleteGoal` (data-model.md: order is not rewritten on complete or delete)
- [ ] T005 [P] [US1] Create `lib/use-sortable-list.ts` (`"use client"` not needed in a hook file imported by client components): `useSortableList(listRef: RefObject<HTMLUListElement | null>, options: { onReorder: (from: number, to: number) => void })`. In a `useEffect`, create `Sortable.create(listRef.current, ...)` with `handle: ".goal-handle"`, `animation: 150`, `ghostClass`, `chosenClass`, `dragClass` set to Tailwind-friendly class names (`sortable-ghost`, `sortable-chosen`, `sortable-drag`), and destroy the instance in the cleanup. Keep the latest `onReorder` in a ref so the effect does not recreate the instance on every render. In `onStart` attach a `keydown` listener for Escape that sets a `cancelled` flag; in `onEnd` remove it. In `onEnd`: first put `evt.item` back at its original index in `evt.from` (remove it and `insertBefore` the child currently at `oldIndex`, or `appendChild` if none) so React keeps ownership of the DOM (research.md Decision 2); then treat the drop as cancelled if the Escape flag is set or the pointer's end point (from `evt.originalEvent`, using `clientX`/`clientY` of the mouse event or the last touch) is outside `listRef.current.getBoundingClientRect()`; if not cancelled and `oldIndex !== newIndex`, call `onReorder(oldIndex, newIndex)`. Reset the flag every drag (FR-004)
- [ ] T006 [P] [US1] Edit `components/goal-card.tsx`: add props `showHandle: boolean` and `handleProps?: ButtonHTMLAttributes<HTMLButtonElement>`; add `data-goal-id={goal.id}` to the `<li>`; when `showHandle` is true render, as the first control in the card header row, a `<button type="button">` with class `goal-handle`, `aria-label={`Move goal: ${goal.title}`}`, visible text "Move" next to `GripVerticalIcon` from `lucide-react` (icon `aria-hidden`), classes `inline-flex min-h-11 min-w-11 touch-none cursor-grab items-center justify-center gap-1 rounded-lg text-sm text-ink-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:cursor-grabbing` and spread `handleProps` on it (the 44x44 px minimum is FR-012; plain-text label, no icon-only control). Do not change the existing checkbox, due-soon styling, or action buttons. Keep the file free of `any`
- [ ] T007 [P] [US1] Edit `components/goal-column.tsx`: add an optional prop `listRef?: Ref<HTMLUListElement>` and pass it as `ref={listRef}` to the existing `<ul>`; behavior for the Completed column (which passes no ref) must not change
- [ ] T008 [US1] Create `components/sortable-goal-list.tsx` (`"use client"`), exporting `SortableGoalColumn` (depends on T005, T006, T007): props are the ordered `goals: Goal[]`, `today: string`, `checkedIds: ReadonlySet<string>`, `onCheckedChange(id, checked)`, `onComplete(goal)`, `onDelete(id)`, `onReorder(ids: string[])`. It creates a `useRef<HTMLUListElement>(null)`, renders `GoalColumn` (title "Current goals", the existing `emptyMessage` and `className="border-line bg-surface"` from `goal-board.tsx`) with `listRef`, and maps `goals` to `GoalCard` with `showHandle={goals.length > 1}`. It calls `useSortableList(listRef, { onReorder: (from, to) => onReorder(moveId(goals.map((g) => g.id), from, to)) })`. Add Tailwind arbitrary-variant classes on the list through `className` for drag states using existing roles, for example `[&_.sortable-ghost]:opacity-40 [&_.sortable-chosen]:shadow-md` (FR-003). Do not re-create the goal highlight logic; `GoalCard` keeps it (a dragged due-soon goal stays highlighted)
- [ ] T009 [US1] Edit `components/goal-board.tsx` (depends on T003, T004, T008): call `useGoalOrder()` next to `useGoals()` before the early `return <BoardPlaceholder />` (hooks must stay above it); replace `sortCurrent(goals)` with `orderCurrent(goals, order)`; replace the inline Current goals `GoalColumn` block with `<SortableGoalColumn ... onReorder={reorderGoals} />`, moving the existing `onComplete` (`completeGoal` then `setChecked(id, false)`) and `onDelete` (`setPendingDeleteId`) handlers across unchanged; leave the Completed column and dialogs untouched; remove imports that become unused (`GoalCard`, `sortCurrent`)
- [ ] T010 [US1] Manual check for User Story 1: run `npm run dev` and follow [quickstart.md](quickstart.md) steps 1 to 4: default end-date order; drag a goal down and another to the top, with a visible placeholder; release outside the list and Escape-then-release leave the order unchanged; the checkbox and action buttons never start a drag; a single goal shows no handle; the Completed column has no handle

**Checkpoint**: User Story 1 works on its own; goals can be reordered with a mouse and the order is saved for the session and across reloads.

---

## Phase 4: User Story 2 - Keep the custom order between visits (Priority: P1)

**Goal**: The custom order survives reloads and other tabs, new goals go to the bottom, and completing or deleting a goal does not disturb the rest (spec FR-005 to FR-008).

**Manual check**: [quickstart.md](quickstart.md) steps 5, 6, and 10.

### Implementation for User Story 2

- [ ] T011 [US2] Edit `lib/goal-store.ts` (depends on T004): extend the existing `handleStorageEvent` and the `subscribe` listener so a `storage` event for `ORDER_STORAGE_KEY` (or `event.key === null`) re-reads the order with `readOrderFromStorage()` and calls `notify()`; keep the existing goals behavior. Confirm that a corrupt value (for example `{"a":1}` or `["a", 2]`) yields `null`, i.e. the end-date order, and that nothing in `addGoal`, `completeGoal`, or `deleteGoal` writes the order key (data-model.md: "`order` is not rewritten" on complete or delete)
- [ ] T012 [US2] Manual check for User Story 2: follow [quickstart.md](quickstart.md) steps 5, 6, and 10: reload keeps the custom order and `doit:goal-order:v1` is present in devtools; a goal added after reordering appears at the bottom; a goal added before any drag is placed by end date; completing one goal and deleting another keeps the remaining relative order; removing only `doit:goal-order:v1` returns the list to end-date order

**Checkpoint**: User Stories 1 and 2 both work; the order is durable.

---

## Phase 5: User Story 3 - Reorder without a mouse (Priority: P2)

**Goal**: Touch and keyboard users can reorder goals too (spec FR-009, FR-012, FR-013).

**Manual check**: [quickstart.md](quickstart.md) steps 7 to 9.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Create `lib/use-keyboard-reorder.ts`: `useKeyboardReorder(ids: string[], onReorder: (ids: string[]) => void)` returning `{ pickedId: string | null, message: string, getHandleProps(id: string, title: string) }`. Behavior per [contracts/reorder-interaction.md](contracts/reorder-interaction.md): on the handle, Space or Enter picks up (and, when already picked up, drops and calls `onReorder` once with the final ids); ArrowUp and ArrowDown move the picked id one place in a local working copy built with `moveId` (at the ends it stays and announces it) and call `event.preventDefault()` so the page does not scroll; Escape restores the original order and announces "Reorder cancelled"; blur while picked up drops at the current position. `getHandleProps` returns `onKeyDown`, `onBlur`, `aria-pressed` for the handle. Keep the working order in state so the list renders the live position while moving; `message` holds the live-region text: "Picked up <title>, position N of M", "Moved to position N of M", "Dropped at position N of M", "Reorder cancelled". Do not save on every intermediate move, only on drop
- [ ] T014 [US3] Edit `components/sortable-goal-list.tsx` (depends on T013): call `useKeyboardReorder(goals.map((g) => g.id), onReorder)`; render the goals in the hook's working order while a goal is picked up; pass `getHandleProps(goal.id, goal.title)` to each `GoalCard` as `handleProps`; add a visually hidden live region `<p role="status" aria-live="polite" className="sr-only">{message}</p>` inside the column wrapper. Pointer dragging from T005 must keep working while no goal is picked up
- [ ] T015 [US3] Edit `components/goal-card.tsx` (depends on T014): add an optional prop `picked?: boolean` and, when true, add `ring-2 ring-ring ring-offset-2 ring-offset-background` to the `<li>` so the picked-up goal is clearly marked, and set `aria-pressed` styling on the handle (for example `aria-pressed:bg-line`). The goal keeps its due-soon highlight while picked up
- [ ] T016 [US3] Manual check for User Story 3: follow [quickstart.md](quickstart.md) steps 7 to 9: Tab to a "Move" handle, Space, ArrowDown twice, Space reorders the list with focus staying on the handle and the announcements appearing; Escape while picked up restores the order; in devtools device mode, dragging from the handle works and the page does not scroll while dragging; at 360 px there is no horizontal scroll; the handle is at least 44x44 px

**Checkpoint**: All user stories work with mouse, touch, and keyboard.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates from the constitution.

- [ ] T017 Run `npm run lint` and fix every error and warning in the files touched by this feature (constitution Principle I; `any` must be justified in a comment)
- [ ] T018 Run `npm run build` and confirm it succeeds
- [ ] T019 Run the full [quickstart.md](quickstart.md) walkthrough once end to end, including the edge cases in step 9 (100-character title, due-soon goal stays highlighted while dragged, long list scrolls while dragging near the edge)
- [ ] T020 Confirm Principle V is respected: `git status` shows no test files, test runners, mocks, or test configuration, and `package.json` gained only `sortablejs` and `@types/sortablejs`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 and T002 can run in either order.
- **Foundational (Phase 2)**: T003 depends on nothing in Phase 1 except that the project builds; it blocks T009 and T013 (which uses `moveId`).
- **User Story 1 (Phase 3)**: Depends on T001 and T003. T005, T006, T007 are independent files and can run in parallel after T001; T004 follows T003; T008 needs T005 to T007; T009 needs T004 and T008.
- **User Story 2 (Phase 4)**: Depends on T004 (it extends the same store file), so it comes after User Story 1 starts delivering; its manual check needs T009.
- **User Story 3 (Phase 5)**: Depends on User Story 1 (T008 for the list, T006 for the card). T013 is independent and can start after T003.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Within Each User Story

- Pure logic (`lib/goals.ts`) before store, store before components, components before the board wiring
- Manual check last in each story

### Parallel Opportunities

- After T001: T005, T006, T007 in parallel (different files)
- T013 in parallel with any User Story 1 task (different file) once T003 is done
- User Stories 2 and 3 can proceed in parallel after User Story 1

---

## Parallel Example: User Story 1

```bash
# After T001 and T003, launch these together (different files):
Task: "Create lib/use-sortable-list.ts"
Task: "Edit components/goal-card.tsx to add the Move handle"
Task: "Edit components/goal-column.tsx to accept a listRef"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: manual check T010 (the order is already saved by T004)

### Incremental Delivery

1. Setup + Foundational, then User Story 1: mouse reordering works (MVP)
2. Add User Story 2: durability across tabs and edge cases of the stored order
3. Add User Story 3: keyboard and touch polish
4. Polish: lint, build, full walkthrough

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps the task to a user story for traceability
- No test tasks anywhere (constitution Principle V)
- Tick each task and the matching spec requirement as soon as it is done, not at the end
- Commit after each task or logical group
