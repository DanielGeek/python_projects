---

description: "Task list for the Refined Color Palette feature"
---

# Tasks: Refined Color Palette

**Input**: Design documents from `/specs/002-refine-color-palette/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/color-roles.md, quickstart.md

**Tests**: NONE. Constitution Principle V forbids unit, integration, and end-to-end tests, so this list has no test
tasks. Each story ends with a manual check taken from [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story the task belongs to (US1 to US3)
- Paths are relative to the repository root (Next.js App Router, no `src/` directory, alias `@/*` = `./*`)
- Color token names and values are defined in [contracts/color-roles.md](contracts/color-roles.md); use only those tokens (FR-009)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Keep a "before" reference for the side-by-side comparison (SC-004). No dependency or version changes are needed in this feature.

- [ ] T001 Run `npm run dev`, seed the board with the script in [quickstart.md](quickstart.md) (Prerequisites), and save "before" screenshots at 1280 px and 360 px wide to a folder outside the repository (for example a temp directory); do not commit them and do not add files under `public/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the color roles once and make the shared shadcn/ui primitives follow them. Every user story depends on these tokens and primitives.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Edit `app/globals.css` (before editing, re-read [contracts/color-roles.md](contracts/color-roles.md)): in the Tailwind `@theme` block ADD the role tokens `--color-cream: #FAF8F5`, `--color-surface: #FFFFFF`, `--color-line: #E6E0D6`, `--color-control: #7C7690`, `--color-ink: #1F1B2E`, `--color-ink-soft: #5B566B`, `--color-brand: #6D4AFF`, `--color-brand-strong: #5B3AE6`, `--color-urgent: #FFE8D6`, `--color-urgent-foreground: #B4410C`, `--color-done: #E3F5EC`, `--color-done-foreground: #1F7A4D`, `--color-danger: #B01D36`, `--color-danger-soft: #FBE4E8`; remap the shadcn variables in `:root` exactly as in the contract's mapping table (`--background` and `--card` to cream, `--popover` to surface, `--primary` and `--ring` to brand, `--primary-foreground` to `#FFFFFF`, `--secondary`/`--muted`/`--accent` to line, `--muted-foreground` to ink-soft, `--destructive` to danger, `--border` to line, `--input` to control, all `*-foreground` text variables to ink); add `color-scheme: light` on `:root` (FR-010). KEEP the old `mint`/`lavender`/`peach`/`rose`/`sky` scales for now (they are removed in T014 so every checkpoint still looks right). Constraints to honor, quoted from data-model.md: "Every `value`/`foreground` pair meets 4.5:1 for text; every role used as a control boundary or focus indicator meets 3:1 on the surfaces it sits on" and "Exactly one role (`brand`) is the accent" (FR-003, FR-006, FR-007)
- [ ] T003 [P] Edit `components/ui/button.tsx` (depends on T002): in the base classes replace `focus-visible:ring-3 focus-visible:ring-ring/50` with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` (full-strength offset ring, research.md Decision 4); `default` variant hover `hover:bg-primary/80` becomes `hover:bg-brand-strong`; `outline` variant `border-border` becomes `border-input`; `destructive` variant becomes `bg-danger-soft text-danger hover:bg-danger hover:text-white focus-visible:ring-danger` and drop its `/10`, `/20`, `/30`, `/40` alpha classes; leave the `dark:` classes untouched (FR-003, FR-007, FR-008, FR-009)
- [ ] T004 [P] Edit `components/ui/checkbox.tsx` (depends on T002): replace `focus-visible:ring-3 focus-visible:ring-ring/50` with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`; keep `border-input` (now the control role, at least 3:1) and the checked fill `data-checked:bg-primary` (brand) (FR-003, FR-007)
- [ ] T005 [P] Edit `components/ui/input.tsx` (depends on T002): replace `focus-visible:ring-3 focus-visible:ring-ring/50` with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`; keep `border-input` (control role) and the invalid state `aria-invalid:border-destructive` (FR-007, FR-008)

**Checkpoint**: Role tokens exist and the primitives use them. The app still builds and looks coherent because the old scales are still present.

---

## Phase 3: User Story 1 - A board that looks cohesive and pleasant (Priority: P1) 🎯 MVP

**Goal**: Warm cream page, white raised columns with soft borders, neutral cream goal cards, and a single violet accent on the primary action.

**Manual Check**: Open the seeded board and the empty board, and confirm the page, columns, cards, and buttons read as one color family with a single accent (quickstart steps 1, 4, and 11).

### Implementation for User Story 1

- [ ] T006 [US1] Edit `components/goal-board.tsx` (depends on T002): change the "Current goals" column `className` from `border-sky-200 bg-sky-50` and the "Completed goals" column `className` from `border-mint-200 bg-mint-50` to the same `border-line bg-surface` (white raised columns with a soft border; status color lives on the cards, not the columns); change both `BoardPlaceholder` blocks from `bg-muted/50` to `bg-line`; do not change layout, copy, or behavior (FR-002, FR-009, FR-011). Normal goal cards in `components/goal-card.tsx` already use `border-border bg-card`, which the T002 mapping turns into the line border on a cream card, so no card edit is needed here
- [ ] T007 [US1] Run the app and perform quickstart steps 1, 4, and 11 manually

**Checkpoint**: User Story 1 works on its own. This is the MVP.

---

## Phase 4: User Story 2 - Goal status is readable at a glance (Priority: P1)

**Goal**: Due-soon goals use the urgent treatment, completed goals use the done treatment, and normal goals stay calm; status never depends on color alone.

**Manual Check**: With the seeded board, confirm due-soon, normal, and completed cards each look distinct, including in grayscale (quickstart steps 2, 3, and 5).

### Implementation for User Story 2

- [ ] T008 [P] [US2] Edit `components/goal-card.tsx` (depends on T002): in the due-soon branch change `border-2 border-peach-600 bg-peach-100` to `border-2 border-urgent-foreground bg-urgent`, and change the label color `text-peach-600` to `text-urgent-foreground`; keep the `border-2`, the `AlarmClockIcon`, and the `daysLeftLabel` text as the non-color cues (FR-004, FR-005, FR-009)
- [ ] T009 [P] [US2] Edit `components/completed-goal-card.tsx` (depends on T002): change the card surface `bg-card` to `bg-done` (keep `border border-border`), and make the "Completed <date>" line `text-done-foreground` instead of `text-muted-foreground`; keep the title in the default ink color (FR-004, FR-009)
- [ ] T010 [US2] Run the app and perform quickstart steps 2, 3, and 5 manually (includes the grayscale check from step 3)

**Checkpoint**: User Stories 1 and 2 both work.

---

## Phase 5: User Story 3 - Dialogs, forms, and messages match the palette (Priority: P2)

**Goal**: Inputs, error messages, focus rings, and the delete confirmation follow the palette; the destructive action is clearly different from the accent.

**Manual Check**: Open the add-goal dialog, trigger errors, tab through everything, and open the delete confirmation (quickstart steps 6, 7, and 8).

### Implementation for User Story 3

- [ ] T011 [US3] Edit `components/goal-card.tsx` (ordered after T008 because it edits the same file): remove the `border-ink-soft` override from the `Checkbox` `className` so the checkbox outline comes from the control role defined in T004 and stays at least 3:1 on cream, peach, and green surfaces (FR-007, FR-009)
- [ ] T012 [P] [US3] Verify `components/add-goal-dialog.tsx` and `components/delete-goal-dialog.tsx` against the contract: error messages use `text-destructive` (the danger role), invalid inputs show the danger border, "Cancel" is the outline variant (visible control border), and "Delete" is the destructive variant from T003; fix any class that uses a color outside the defined roles (FR-008, FR-009)
- [ ] T013 [US3] Run the app and perform quickstart steps 6, 7, and 8 manually

**Checkpoint**: All three user stories work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Remove the old palette and confirm the whole feature against the spec.

- [ ] T014 Edit `app/globals.css` (depends on T006, T008, T009, T011): delete the old `--color-mint-*`, `--color-lavender-*`, `--color-peach-*`, `--color-rose-*`, and `--color-sky-*` tokens and update the comment above the `@theme` block so it describes the role palette; the file must keep one palette only (FR-001, FR-009, constitution Principle I)
- [ ] T015 [P] Run quickstart steps 9 and 12: check the contrast pairs in [research.md](research.md) with the browser contrast inspector (text at least 4.5:1, checkbox outline, input border and focus ring at least 3:1) and run the `grep` from step 12 to confirm no hex literals or old hue classes remain in `components/` or `app/` outside the theme block (SC-001, SC-002, SC-005)
- [ ] T016 Run `npm run lint` and `npm run build` and fix every reported issue; confirm `next`, `react`, `react-dom`, and `tailwindcss` in `package.json` are unchanged and no dependency was added
- [ ] T017 Perform the full manual walkthrough in [quickstart.md](quickstart.md) (steps 1 to 13) and confirm every expected outcome, including the dark-mode check in step 10 and the side-by-side comparison against the T001 screenshots in step 13 (SC-003, SC-004, SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: T002 first; T003, T004, and T005 follow it and can run together. Blocks all user stories.
- **User Stories (Phase 3 to 5)**: Depend on Foundational. Run them in priority order: US1, US2, US3.
- **Polish (Phase 6)**: T014 depends on T006, T008, T009, and T011 (it removes the tokens those tasks stop using); T015 to T017 depend on T014.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational. No dependency on other stories.
- **US2 (P1)**: Starts after Foundational. Touches `goal-card.tsx` and `completed-goal-card.tsx`, which US1 does not edit, so it can run in parallel with US1.
- **US3 (P2)**: Starts after US2 only because T011 edits `goal-card.tsx` again; T012 can run any time after Foundational.

### Parallel Opportunities

- Phase 2: T003, T004, T005 (after T002).
- US2: T008 and T009 (different files); US1 (T006) can run alongside them.
- US3: T012 can run alongside T011.
- Polish: T015 can run alongside T016 once T014 is done.

---

## Parallel Example: Foundational primitives

```text
# After T002 is done, launch the three primitive edits together:
Task: "Edit components/ui/button.tsx"
Task: "Edit components/ui/checkbox.tsx"
Task: "Edit components/ui/input.tsx"
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

1. Setup + Foundational, then US1 (MVP: cohesive board)
2. Add US2 (status colors), check it
3. Add US3 (controls and dialogs), check it
4. Finish with Polish (remove the old palette, verify contrast, lint, build)

---

## Notes

- [P] tasks touch different files and have no unfinished dependency
- Do not add test files, test frameworks, or test configuration (constitution Principle V)
- Do not add dependencies or change the Next.js, React, or Tailwind versions (constitution Technology Stack)
- Styling only: no change to layout, copy, or behavior (FR-011)
- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (AGENTS.md); this feature edits only styles and class names
- Commit after each task or logical group
