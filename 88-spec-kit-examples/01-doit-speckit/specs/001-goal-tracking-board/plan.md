# Implementation Plan: Goal Tracking Board

**Branch**: `001-goal-tracking-board` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-goal-tracking-board/spec.md`

## Summary

Build "Doit", a single-page goal tracker: a two-column board (current goals on the left, completed
goals on the right) with an "Add goal" modal, a checkbox that offers "Move to completed" /
"Delete permanently" (with confirmation), highlighting of goals due within 3 days, and persistence
in the browser. The technical approach, as directed by the user:

- **Theme**: Tailwind CSS v4 `@theme` block in `app/globals.css` defines a soft pastel light palette
  as design tokens; shadcn/ui semantic tokens (`--primary`, `--card`, ...) map onto those tokens.
- **Storage**: goals live in `localStorage`, exposed through a small store consumed with
  `useSyncExternalStore` (no hydration mismatch, no extra state library).
- **UI components**: shadcn/ui (Button, Input, Label, Checkbox, Dialog, AlertDialog) copied into
  `components/ui/`.
- **Dates**: `date-fns` for all date math and formatting (days left, ordering, display).
- **No automated tests of any kind** (constitution Principle V); verification is a manual
  walkthrough plus `npm run lint` and `npm run build`.

## Technical Context

**Language/Version**: TypeScript ^5 (strict), React 19.3.0, Next.js 16.4.5 (App Router)

**Primary Dependencies**: Tailwind CSS ^4 (existing); new, justified in Complexity Tracking: `date-fns` (v4),
shadcn/ui runtime support (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`lucide-react`, `tw-animate-css`)

**Storage**: Browser `localStorage`, one key (`doit:goals:v1`) holding a JSON array of goals; see
[contracts/storage.md](contracts/storage.md)

**Testing**: None, by constitution Principle V. Manual walkthrough in [quickstart.md](quickstart.md)

**Target Platform**: Modern evergreen browsers, phone to desktop (360 px to 1920 px wide)

**Project Type**: Single-page web application (no backend, no API)

**Performance Goals**: Interactions feel instant (< 100 ms) for up to a few hundred goals; no loading spinner needed

**Constraints**: Light theme only (no dark mode); no horizontal scroll; keyboard accessible; works offline once loaded;
Next.js, React and Tailwind versions in `package.json` MUST NOT change

**Scale/Scope**: One user, one device, one screen (the board), up to a few hundred goals

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code | PASS | Small modules: pure date/goal helpers in `lib/goals.ts`, storage in `lib/goal-store.ts`, one component per concern. Strict TypeScript, lint must pass. |
| II. Simple UX | PASS | One primary action ("Add goal"), two plain columns, confirmation only where data is destroyed. |
| III. Responsive Design | PASS | Mobile-first: columns stack on small screens and sit side by side from the `md` breakpoint. |
| IV. Minimal Dependencies | VIOLATION (justified) | shadcn/ui and `date-fns` were explicitly requested. See Complexity Tracking. |
| V. No Testing | PASS | No test tasks, frameworks, or coverage targets. Manual quickstart only. |
| Technology Stack | PASS (constitution v1.1.0) | shadcn/ui and `date-fns` are now approved in Technology Stack; theme colors use a Tailwind `@theme` block as required. Framework versions are untouched. |

**Post-design re-check (after Phase 1)**: the design adds no further dependencies. The Technology Stack
conflict was resolved by amending the constitution to v1.1.0.

## Project Structure

### Documentation (this feature)

```text
specs/001-goal-tracking-board/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── storage.md       # Phase 1 output: localStorage contract
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── globals.css            # Tailwind import, @theme pastel tokens, shadcn token mapping
├── layout.tsx             # Metadata (title "Doit"), fonts, light theme only
└── page.tsx               # Server Component that renders <GoalBoard />

components/
├── goal-board.tsx         # Client Component: header, "Add goal" button, two columns, selection state
├── goal-column.tsx        # Column title, count, list, empty state
├── goal-card.tsx          # Current goal: checkbox, title, days left, due-soon highlight, actions
├── completed-goal-card.tsx# Completed goal: title and completion date
├── add-goal-dialog.tsx    # Modal form: title and end date, validation
├── delete-goal-dialog.tsx # Confirmation before permanent delete
└── ui/                    # shadcn/ui components (button, input, label, checkbox, dialog, alert-dialog)

lib/
├── goals.ts               # Goal type, validation, daysLeft, isDueSoon, sorting, labels (date-fns)
├── goal-store.ts          # localStorage-backed store + useGoals() hook (useSyncExternalStore)
└── utils.ts               # cn() helper required by shadcn/ui

components.json            # shadcn/ui configuration
```

**Structure Decision**: Single Next.js App Router project at the repository root (no `src/` directory), using
the existing `@/*` path alias. There is no backend; all logic is client-side. No `tests/` directory is created
(Principle V).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `date-fns` runtime dependency (Principle IV) | Explicitly requested by the user. Provides DST-safe `differenceInCalendarDays`, `parseISO`, `format`, `startOfDay`. | Native `Date` math is error-prone around DST and midnight; the user chose `date-fns`. It is tree-shakeable, so only the imported functions ship. |
| shadcn/ui and its runtime packages (`radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`) (Principle IV) | Explicitly requested by the user. Gives accessible Dialog, AlertDialog and Checkbox (focus trap, Escape, ARIA) that FR-007 and FR-011 need. | Hand-built modals and checkboxes would need more custom code and would likely miss accessibility details. |
| shadcn/ui vs. former Technology Stack rule "no additional ... UI component libraries" | Same user request. shadcn/ui source is copied into `components/ui/` and styled with Tailwind utilities, but it relies on Radix UI primitives. | **Resolved**: the constitution was amended to v1.1.0 and now approves shadcn/ui and `date-fns`. |
