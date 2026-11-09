---

description: "Task list for the Goal Tracking Board feature"
---

# Tasks: Goal Tracking Board

**Input**: Design documents from `/specs/001-goal-tracking-board/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage.md, quickstart.md

**Tests**: NONE. Constitution Principle V forbids unit, integration, and end-to-end tests, so this list has no test
tasks. Each story ends with a manual check taken from [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story the task belongs to (US1 to US4)
- Paths are relative to the repository root (Next.js App Router, no `src/` directory, alias `@/*` = `./*`)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the approved libraries (constitution v1.1.0: shadcn/ui and `date-fns`) without changing framework versions.

- [ ] T001 Install `date-fns` (v4) with `npm install date-fns` and confirm `package.json` lists it under `dependencies`
- [ ] T002 Initialize shadcn/ui with `npx shadcn@latest init` using defaults (Next.js, CSS variables), producing `components.json` and `lib/utils.ts` and updating `app/globals.css`
- [ ] T003 Add only the needed shadcn/ui components with `npx shadcn@latest add button input label checkbox dialog alert-dialog`, creating files in `components/ui/`
- [ ] T004 Check `package.json`: `next` MUST still be `16.4.5`, `react` and `react-dom` MUST still be `19.3.0`, `tailwindcss` MUST still be `^4`; revert any change made by the CLI, then run `npm install` and `npm run lint`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme, data helpers, storage, and shared hooks that every user story needs.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Edit `app/globals.css`: add a Tailwind `@theme` block with the soft pastel palette tokens (`--color-mint-*`, `--color-lavender-*`, `--color-peach-*`, `--color-rose-*`, `--color-sky-*`, `--color-ink`), map the shadcn/ui semantic variables (`--background`, `--foreground`, `--card`, `--primary`, `--accent`, `--destructive`, `--border`, `--ring`) onto those tokens, remove the `prefers-color-scheme: dark` block and the boilerplate `body` font override; light theme only, with `--color-ink` dark enough to keep text readable on pastel backgrounds (FR-014)
- [ ] T006 [P] Edit `app/layout.tsx`: set `metadata` title to "Doit" and a short description, keep the Geist font variables, and make `body` use the themed background and text colors
- [ ] T007 [P] Create `lib/goals.ts` with the `Goal` type (`id`, `title`, `endDate`, `status`, `createdAt`, `completedAt`) per data-model.md, constants `DUE_SOON_DAYS = 3` and `TITLE_MAX_LENGTH = 100`, and `date-fns` based helpers: `toDateKey(date)` (`format(date, "yyyy-MM-dd")`), `daysLeft(endDate, today)` (`differenceInCalendarDays(parseISO(endDate), parseISO(today))`), `isDueSoon(goal, today)` (status `current` and days left <= 3, including today and overdue), `daysLeftLabel` ("N days left", "1 day left", "Due today", "N days overdue"), `formatDisplayDate` (`"MMM d, yyyy"`), `sortCurrent` (`endDate` ascending then `createdAt` ascending) and `sortCompleted` (`completedAt` descending then `createdAt` descending), plus `validateGoalInput(title, endDate, today)` enforcing: title "Trimmed; 1 to 100 characters", `endDate` required and "MUST NOT be earlier than today when creating a goal", returning clear messages (FR-005, FR-006, FR-016)
- [ ] T008 Create `lib/goal-store.ts` (depends on T007; first read `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`, as required by the constitution's Technology Stack and AGENTS.md): a `localStorage` store for key `doit:goals:v1` holding a JSON array of goals (see contracts/storage.md), with a `useGoals()` hook built on `useSyncExternalStore`; the server snapshot and the loading state MUST be `null` (not an empty list) so the board can render a neutral state until the first client snapshot; cache the parsed array per raw string so `getSnapshot` returns a stable reference; export `addGoal(title, endDate)` (trims title, generates `id` with `crypto.randomUUID()`, sets `status: "current"`, `createdAt` ISO timestamp, `completedAt: null`), `completeGoal(id, today)` (sets `status: "completed"` and `completedAt` to `yyyy-MM-dd`) and `deleteGoal(id)`; each action writes the full array back and notifies subscribers
- [ ] T009 [P] Create `lib/use-today.ts`: a `useToday()` hook using `useSyncExternalStore` that returns today's local date as `yyyy-MM-dd` (primitive string, so the snapshot is stable) and re-reads it when the tab becomes visible (`visibilitychange`), so days left stays correct after midnight; server snapshot returns `null`

**Checkpoint**: Foundation ready. User story work can begin.

---

## Phase 3: User Story 1 - Add a goal and see it on the board (Priority: P1) 🎯 MVP

**Goal**: A user opens Doit, sees the two-column board, adds a goal through a modal, and sees it in the current column with its days left.

**Manual Check**: Open the app, add one goal with a future end date, and confirm it shows in the left column with the correct days-left count (quickstart steps 1 to 6).

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create `components/goal-card.tsx`: presentational card for a current goal showing its title (wrapping or truncating long titles without breaking the layout) and `daysLeftLabel`, styled with the pastel theme tokens (FR-003)
- [ ] T011 [P] [US1] Create `components/goal-column.tsx`: column with a heading, goal count, a list of children, and a friendly empty state message when there are no goals (FR-002, FR-015); the list scrolls inside the column without breaking the page layout
- [ ] T012 [P] [US1] Create `components/add-goal-dialog.tsx`: shadcn `Dialog` form with a required "Title" `Input` (`maxLength` 100) and a required "End date" date `Input` (`min` = today), validated with `validateGoalInput` showing inline messages for an empty title, a missing date, and a past date; set `noValidate` on the `<form>` so the browser's native validation (including the date input's `min`) never blocks submit before these inline messages appear; Cancel button, Escape, and outside click close the modal without saving; the form resets when closed; submit calls an `onAdd(title, endDate)` prop (FR-004, FR-005, FR-006, FR-011)
- [ ] T013 [US1] Create `components/goal-board.tsx` (depends on T008, T009, T010, T011, T012; first read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, as required by the constitution's Technology Stack and AGENTS.md): a Client Component (`"use client"`) with the "Doit" heading, an "Add goal" button that opens `AddGoalDialog`, and a layout of one column below `md` and two columns from `md` up; the left column ("Current goals") lists `sortCurrent` goals as `GoalCard`s; the right column ("Completed goals") shows only its empty state for now; render a neutral placeholder while `useGoals()` or `useToday()` is `null` (FR-001, FR-002, FR-013, FR-016)
- [ ] T014 [US1] Replace the boilerplate in `app/page.tsx` with a Server Component that renders `<GoalBoard />`
- [ ] T015 [US1] Run the app (`npm run dev`) and perform quickstart steps 1 to 4 and step 6 manually, and in step 5 check only the ordering (nearest end date first); the highlight part of step 5 belongs to US3 (T022)

**Checkpoint**: User Story 1 works on its own. This is the MVP.

---

## Phase 4: User Story 2 - Complete a goal (Priority: P1)

**Goal**: A user checks a goal's checkbox, then moves it to the completed column or deletes it after confirming.

**Manual Check**: Check a goal, choose "Move to completed", and confirm it leaves the left column and appears in the right column with its completion date (quickstart steps 7 to 10).

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create `components/completed-goal-card.tsx`: card showing the goal title and its completion date via `formatDisplayDate(completedAt)`, no days-left text (FR-008)
- [ ] T017 [P] [US2] Create `components/delete-goal-dialog.tsx`: shadcn `AlertDialog` asking for confirmation before a permanent delete, with "Cancel" (goal unchanged) and "Delete" (calls `onConfirm`) actions (FR-009)
- [ ] T018 [US2] Update `components/goal-card.tsx` (depends on T010): add a shadcn `Checkbox` with an accessible label including the goal title; when checked, show "Move to completed" and "Delete permanently" buttons; unchecking hides them and takes no action (FR-007)
- [ ] T019 [US2] Update `components/goal-board.tsx` (depends on T013, T016, T017, T018): keep the set of checked goal ids in component state (not persisted); wire "Move to completed" to `completeGoal(id, today)`; wire "Delete permanently" to open `DeleteGoalDialog` and call `deleteGoal(id)` only after confirmation; render `sortCompleted` goals as `CompletedGoalCard`s in the right column (FR-008, FR-009)
- [ ] T020 [US2] Run the app and perform quickstart steps 7 to 10 manually

**Checkpoint**: User Stories 1 and 2 both work.

---

## Phase 5: User Story 3 - Spot goals that are due soon (Priority: P2)

**Goal**: Goals whose end date is within 3 days are visually highlighted so the user sees urgent goals at a glance.

**Manual Check**: Add a goal ending in 2 days and one ending in 10 days; confirm only the first is highlighted (quickstart step 5, highlight part).

### Implementation for User Story 3

- [ ] T021 [US3] Update `components/goal-card.tsx` and `components/goal-board.tsx` (ordered after T019 only because it edits the same files; the highlight logic itself needs only T007 and T010): pass `today` to each card and, when `isDueSoon(goal, today)` is true, apply a highlight style using the theme's peach or rose tokens plus a non-color cue (a distinct border or icon and the label text) so color is not the only signal; goals due today show "Due today" and overdue goals show "N days overdue" (FR-010)
- [ ] T022 [US3] Run the app and verify highlighting with goals ending in 10, 4, 3, 0 and -1 days (add the past-dated goal by editing `doit:goals:v1` in DevTools Local Storage); only goals with 3 or fewer days left are highlighted

**Checkpoint**: User Stories 1 to 3 work.

---

## Phase 6: User Story 4 - Keep goals between visits (Priority: P2)

**Goal**: Goals survive reloads and revisits, and bad stored data never breaks the app.

**Manual Check**: Add a goal, move another to completed, reload, and confirm both columns are unchanged (quickstart steps 11 and 14).

### Implementation for User Story 4

- [ ] T023 [US4] Harden reading in `lib/goal-store.ts` (depends on T008): treat a missing key, invalid JSON, or a non-array value as `[]`, and drop entries that do not match the Goal shape (add an `isGoal` type guard in `lib/goals.ts`); per contracts/storage.md (FR-012)
- [ ] T024 [US4] Harden writing and syncing in `lib/goal-store.ts` (depends on T023): wrap `localStorage.setItem` in `try/catch` so a failed write (storage full or unavailable) keeps the in-memory state and does not crash the page, and listen to the `storage` event for key `doit:goals:v1` so other tabs refresh (FR-012)
- [ ] T025 [US4] Run the app and perform quickstart steps 11 and 14 manually, and confirm reloading never shows the empty state before saved goals appear

**Checkpoint**: All four user stories work independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple stories.

- [ ] T026 [P] Responsive and accessibility pass across `components/` and `app/globals.css`: no horizontal scroll from 360 px to 1920 px, touch targets at least 44x44 px, visible focus rings, correct focus handling in dialogs, readable contrast on pastel backgrounds (FR-013, FR-014, constitution Principles II and III)
- [ ] T027 [P] Clean up: delete unused create-next-app assets in `public/`, remove unused imports, dead code and unused dependencies, and make sure no `any` types remain without a justifying comment (constitution Principle I)
- [ ] T028 Run `npm run lint` and `npm run build` and fix every reported issue
- [ ] T029 Perform the full manual walkthrough in [quickstart.md](quickstart.md) (steps 1 to 15) and confirm every expected outcome, including the timing and first-use checks in step 15 (SC-001, SC-002, SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 to T004 run in order.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Stories (Phase 3 to 6)**: Depend on Foundational. Run them in priority order: US1, US2, US3, US4.
- **Polish (Phase 7)**: Depends on the stories you want to ship.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational. No dependency on other stories.
- **US2 (P1)**: Starts after US1, because it extends `goal-card.tsx` and `goal-board.tsx`.
- **US3 (P2)**: Starts after US2, because it edits the same two files.
- **US4 (P2)**: Edits only `lib/goal-store.ts` and `lib/goals.ts`, so it can run in parallel with US2 and US3 once Foundational is done.

### Within Each Story

- Presentational components first, then `goal-board.tsx` wiring, then the manual check.

### Parallel Opportunities

- Phase 2: T005, T006, T007, T009 can run together (T008 waits for T007).
- US1: T010, T011, T012 can run together.
- US2: T016, T017 can run together.
- US4 can run alongside US2 and US3 (different files).
- Polish: T026 and T027 can run together.

---

## Parallel Example: User Story 1

```text
# Launch the three presentational components together:
Task: "Create components/goal-card.tsx"
Task: "Create components/goal-column.tsx"
Task: "Create components/add-goal-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **Stop and check**: run the manual check for US1
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational, then US1 (MVP)
2. Add US2 (complete and delete), check it
3. Add US3 (highlighting), check it
4. Add US4 (storage hardening), check it
5. Finish with Polish

---

## Notes

- [P] tasks touch different files and have no unfinished dependency
- Do not add test files, test frameworks, or test configuration (constitution Principle V)
- Do not change the Next.js, React, or Tailwind versions (constitution Technology Stack)
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md)
- Commit after each task or logical group
