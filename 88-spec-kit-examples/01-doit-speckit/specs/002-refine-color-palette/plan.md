# Implementation Plan: Refined Color Palette

**Branch**: `002-refine-color-palette` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-refine-color-palette/spec.md`

## Summary

Replace Doit's current pastel theme (lavender page, sky and mint columns, peach cards, scale-based
`--color-mint-*` / `--color-sky-*` tokens) with a "refined pastel" palette made of **named color roles**:
warm cream page, white raised columns with soft borders, one vivid-violet accent, peach for due-soon,
soft green for completed, a distinct danger color, and near-black ink. This is a styling-only change:
no layout, copy, behavior, dependency, or version change.

- **Tokens**: `app/globals.css` defines the roles once in a Tailwind `@theme` block (replacing the old
  color scales) and maps the shadcn/ui semantic variables (`--primary`, `--destructive`, `--input`,
  `--ring`, ...) onto them. Components use role utilities only (`bg-urgent`, `text-done-foreground`, ...).
- **Status treatment**: due-soon = peach surface + thick border + icon + label; completed = green
  surface; normal = cream card inside a white column. Color is never the only cue.
- **Accessibility**: every text pair is at least 4.5:1 and every control boundary or focus indicator is
  at least 3:1 on the surfaces it sits on (measured, see [research.md](research.md)). shadcn's translucent
  focus halo (`ring-ring/50`) is replaced by a full-strength offset ring so focus stays at least 3:1.
- **Light only**: `color-scheme: light` is set so native controls (date picker, scrollbars) never follow
  the OS dark mode.
- **No automated tests** (constitution Principle V); verification is the manual walkthrough in
  [quickstart.md](quickstart.md) plus `npm run lint` and `npm run build`.

## Technical Context

**Language/Version**: TypeScript ^5 (strict), React 19.3.0, Next.js 16.4.5 (App Router)

**Primary Dependencies**: Tailwind CSS ^4 and the shadcn/ui set already installed; no new packages

**Storage**: N/A (no data or storage change; the `doit:goals:v1` contract is untouched)

**Testing**: None, by constitution Principle V. Manual walkthrough in [quickstart.md](quickstart.md)

**Target Platform**: Modern evergreen browsers, 360 px to 1920 px wide

**Project Type**: Single-page web application (no backend)

**Performance Goals**: No change; colors are CSS custom properties resolved at build time

**Constraints**: Light theme only; Next.js, React and Tailwind versions MUST NOT change; layout and
behavior MUST NOT change (FR-011); every color MUST come from a defined role (FR-009)

**Scale/Scope**: One stylesheet (`app/globals.css`), 4 feature components, 3 shadcn files with a focus-style tweak

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code | PASS | Fewer tokens than today (role names replace five 4-step scales); no dead color classes left behind. |
| II. Simple UX | PASS | One accent for actions, status readable at a glance, no new UI. Focus states stay visible. |
| III. Responsive Design | PASS | No layout change; touch targets and no-horizontal-scroll are preserved. |
| IV. Minimal Dependencies | PASS | No dependency added or removed. |
| V. No Testing | PASS | No test tasks, frameworks, or coverage targets. |
| Technology Stack | PASS | Colors stay in a Tailwind `@theme` block; framework versions untouched. |

**Post-design re-check (after Phase 1)**: unchanged, all PASS. The spec 001 palette task (T005) is superseded
by this feature for color values only; the semantic shadcn variable mapping it introduced is kept.

## Project Structure

### Documentation (this feature)

```text
specs/002-refine-color-palette/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: palette decisions and measured contrast
├── data-model.md        # Phase 1 output: color roles and status treatments
├── quickstart.md        # Phase 1 output: manual validation guide
├── contracts/
│   └── color-roles.md   # Phase 1 output: role -> token -> value -> usage contract
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
└── globals.css                 # MODIFY: replace scale tokens with role tokens, remap shadcn variables, color-scheme: light

components/
├── goal-board.tsx              # MODIFY: column classes (white surface), skeleton color
├── goal-column.tsx             # MODIFY: heading/count/empty-state text roles if needed
├── goal-card.tsx               # MODIFY: neutral / due-soon treatments, checkbox border
├── completed-goal-card.tsx     # MODIFY: completed (green) treatment
├── add-goal-dialog.tsx         # VERIFY: error text already uses the danger role via text-destructive
└── ui/
    ├── button.tsx              # MODIFY: focus ring full strength + offset; destructive variant uses danger-soft
    ├── checkbox.tsx            # MODIFY: unchecked border = control role, focus ring as above
    └── input.tsx               # MODIFY: border = control role, focus ring as above
```

**Structure Decision**: Single Next.js App Router project at the repository root, unchanged. Only styling
files are touched; no files are added to `app/`, `components/`, or `lib/`, and no `tests/` directory is created
(Principle V).

## Complexity Tracking

No constitution violations. Nothing to justify.
