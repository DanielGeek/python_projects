# Implementation Plan: Goal Drag-and-Drop Reordering

**Branch**: `003-goal-drag-reorder` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-goal-drag-reorder/spec.md`

## Summary

Let users reorder the current goals by dragging a goal above or below another. The first drag freezes
the list in the user's own order; before that, goals keep the end-date order. The approach, as directed
by the user:

- **Sorting**: the `sortablejs` library (SortableJS) handles mouse and touch dragging, placeholder, and
  drop position. It is attached to the current goals list from a small client hook.
- **Keyboard**: SortableJS has no keyboard mode, so a small own hook adds it (focus the handle, Space or
  Enter to pick up, arrows to move, Space or Enter to drop, Escape to cancel) with a live-region message.
- **Styling**: Tailwind utilities and the existing `@theme` color roles only; no new CSS and no new tokens.
- **Persistence**: a second `localStorage` key holds the ordered list of current goal ids. `null` means
  "never reordered", so the end-date sort still applies. The existing `Goal` shape and key are unchanged.
- **No automated tests of any kind** (constitution Principle V). Verification is the manual walkthrough
  in [quickstart.md](quickstart.md) plus `npm run lint` and `npm run build`.

## Technical Context

**Language/Version**: TypeScript ^5 (strict), React 19.3.0, Next.js 16.4.5 (App Router, client components)

**Primary Dependencies**: Tailwind CSS ^4, date-fns, shadcn/ui (all existing). New, justified in
Complexity Tracking: `sortablejs` (runtime) and `@types/sortablejs` (dev, types only)

**Storage**: Browser `localStorage`. Existing `doit:goals:v1` is untouched. New key `doit:goal-order:v1`
holds a JSON array of goal ids or is absent; see [contracts/storage.md](contracts/storage.md)

**Testing**: None, by constitution Principle V. Manual walkthrough in [quickstart.md](quickstart.md)

**Target Platform**: Modern evergreen browsers, phone to desktop (360 px to 1920 px wide), mouse, touch, keyboard

**Project Type**: Single-page web application (no backend, no API)

**Performance Goals**: Drag follows the pointer with no visible lag for up to a few hundred goals

**Constraints**: No horizontal scroll while dragging; handle at least 44x44 px; keyboard accessible; light
theme only; Next.js, React and Tailwind versions MUST NOT change

**Scale/Scope**: One user, one device, one list (current goals), up to a few hundred goals

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Clean Code | Pass | One hook per concern (pointer sorting, keyboard moving); order logic is pure functions in `lib/goals.ts`; strict types; lint must pass. |
| II. Simple UX | Pass | One visible "Move" handle per goal with a plain-text label; no instructions needed; focus ring visible. |
| III. Responsive Design | Pass | Handle is at least 44x44 px; touch dragging starts from the handle only, so the column still scrolls normally. |
| IV. Minimal Dependencies | Pass with justification | One runtime dependency added; see Complexity Tracking. |
| V. No Testing | Pass | No tests, runners, mocks or test config planned or added. |
| Technology Stack | Pass | Versions unchanged; Tailwind `@theme` roles reused; SortableJS is a behavior library, not a CSS framework or UI component library. |

**Post-design re-check**: unchanged, still passes. No constitution amendment needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-goal-drag-reorder/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── storage.md
│   └── reorder-interaction.md
└── tasks.md             # created by /speckit-tasks, not by this command
```

### Source Code (repository root)

```text
app/
└── globals.css             # unchanged (no new tokens needed; drag states use existing color roles)
components/
├── goal-board.tsx          # use the ordered current goals; pass reorder handlers
├── goal-column.tsx         # accept an optional ref for the list element
├── goal-card.tsx           # add the "Move" handle and drag/keyboard state styles
└── sortable-goal-list.tsx  # NEW: <ul> wiring SortableJS plus the keyboard hook
lib/
├── goals.ts                # add orderCurrent(goals, order) and moveId(order, from, to)
├── goal-store.ts           # add order storage, useGoalOrder(), reorderGoals(ids)
├── use-sortable-list.ts    # NEW: mouse/touch sorting via SortableJS
└── use-keyboard-reorder.ts # NEW: keyboard pick up / move / drop / cancel + live message
package.json                # add sortablejs, @types/sortablejs
```

**Structure Decision**: Keep the existing flat Next.js layout (`app/`, `components/`, `lib/`). The
completed column and `CompletedGoalCard` are not touched. Persistence stays in `goal-store.ts` so there
is still one place that reads and writes `localStorage`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| New runtime dependency `sortablejs` (about 45 kB min, about 15 kB gzip) plus dev-only `@types/sortablejs` | Requested by the user. Pointer and touch drag with a live placeholder, auto-scroll near the list edge, and consistent behavior across browsers is a large amount of fiddly code to own (FR-001, FR-003, edge case on scrolling). | Native HTML5 drag and drop has no touch support on phones and a poor drop indicator, so it cannot meet FR-009 and SC-005 without hundreds of lines of own pointer code. |
