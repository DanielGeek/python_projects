# Feature Specification: Refined Color Palette

**Feature Branch**: `002-refine-color-palette`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "I want the colors of the application to look better, something much better than the current one."

## Clarifications

### Session 2026-11-08

- Q: Which color direction should Doit take? → A: Refined pastel: keep the soft pastel feel, but with a warm cream background, white columns with soft borders, one strong vivid-violet accent, clear status colors, and near-black text
- Q: Should this change include a dark mode? → A: No. Light theme only, as in the Goal Tracking Board spec

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A board that looks cohesive and pleasant (Priority: P1)

A user opens Doit and sees a calm, harmonious screen. The page has a warm, light background, the two
columns are clearly separated from it without competing colors, and a single accent color marks the
things the user can act on (the "Add goal" button, the selected checkbox, the focus ring). Nothing looks
harsh, washed out, or randomly colored.

**Why this priority**: The request is about overall look and feel. The palette of the whole board is what
the user notices first, so this story delivers most of the value on its own.

**Independent Test**: Open the app with a mix of goals and compare it with the previous look. The page,
columns, cards, and buttons should read as one consistent color family with a single accent color.

**Acceptance Scenarios**:

1. **Given** the board is open, **When** the user looks at the whole screen, **Then** the page background,
   column surfaces, cards, borders, and text each use their own defined color role and look consistent.
2. **Given** the board is open, **When** the user looks for what can be clicked, **Then** the primary action
   ("Add goal") and selected controls share one accent color that no other element uses for decoration.
3. **Given** the board is empty, **When** the user opens the app, **Then** the empty states are legible
   and use the same palette as the filled board.

---

### User Story 2 - Goal status is readable at a glance (Priority: P1)

A user scans the board and immediately tells apart goals that are due soon, goals that are on track, and
goals that are completed. Due-soon goals stand out with a warm color, completed goals look settled in a
soft green, and normal current goals stay calm so the urgent ones are not drowned out.

**Why this priority**: Highlighting goals due within 3 days is a core promise of the board, and better
colors only help if status stays obvious.

**Independent Test**: Add goals due in 10 days, 2 days, today, and overdue, and complete one. Confirm each
state has its own consistent color treatment and that a new user can name each state in a few seconds.

**Acceptance Scenarios**:

1. **Given** a goal is due within 3 days or overdue, **When** the board is shown, **Then** its card uses
   the due-soon color treatment and also carries a non-color cue (border weight, icon, or label text).
2. **Given** a goal is more than 3 days away, **When** the board is shown, **Then** its card uses the
   neutral card treatment and is clearly less prominent than due-soon cards.
3. **Given** a goal is completed, **When** the board is shown, **Then** its card uses the completed color
   treatment, distinct from both due-soon and neutral cards.
4. **Given** a due-soon goal is selected, **When** its actions appear, **Then** the card stays readable
   and the selected state is still visible.

---

### User Story 3 - Dialogs, forms, and messages match the palette (Priority: P2)

A user opens the add-goal dialog or the delete confirmation. Inputs, labels, error messages, buttons, and
focus indicators all use the same palette as the board. The destructive "Delete" action is clearly
different from the primary accent, so it is never mistaken for a safe action.

**Why this priority**: The dialogs are secondary surfaces, but a mismatched dialog would undermine the
polish of the board.

**Independent Test**: Open the add-goal dialog, trigger validation errors, tab through every control, then
open the delete confirmation. Everything should follow the palette and stay legible.

**Acceptance Scenarios**:

1. **Given** the add-goal dialog is open, **When** the user submits invalid data, **Then** error messages
   and invalid fields use the error color and remain readable on the dialog surface.
2. **Given** the user moves through the page with the keyboard, **When** any control receives focus,
   **Then** a clearly visible focus indicator in the accent color appears.
3. **Given** the delete confirmation is open, **When** the user looks at its buttons, **Then** "Delete" uses
   the destructive color and "Cancel" uses a neutral treatment.

---

### Edge Cases

- A goal with a very long title stays readable and keeps its color treatment without text overflowing.
- Many goals in a column: the list stays pleasant to scan and cards remain distinguishable from one another.
- A goal that is both overdue and selected keeps legible text and a visible selected state.
- Unchecked checkboxes and empty input borders are still easy to see on white and cream surfaces.
- Text on every colored surface (cards, buttons, error messages, empty states) stays readable.
- Users who cannot distinguish certain colors can still tell due-soon, normal, and completed goals apart.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST use a defined set of color roles: page background, surface (columns, cards, dialogs), border, primary text, secondary text, accent, due-soon, completed, destructive, and focus.
- **FR-002**: The page background MUST be a warm, light neutral, and column and dialog surfaces MUST be lighter than the page so they read as raised, separated by a soft border.
- **FR-003**: The app MUST use exactly one accent color, applied to the primary action, selected controls, and focus indicators, and MUST NOT use it for decoration.
- **FR-004**: Due-soon goals (3 days or fewer left, including due today and overdue) MUST have a distinct warm color treatment, and completed goals MUST have a distinct soft-green treatment; normal current goals MUST use a neutral treatment.
- **FR-005**: Goal status MUST NOT rely on color alone; due-soon goals MUST also show a non-color cue (for example a thicker border, an icon, or label text).
- **FR-006**: All text MUST have a contrast ratio of at least 4.5:1 against the surface it sits on, including text on due-soon and completed cards, buttons, and error messages.
- **FR-007**: Interactive component boundaries and indicators (checkbox outline, input borders, focus ring) MUST have a contrast ratio of at least 3:1 against the surface they sit on.
- **FR-008**: Destructive actions and error messages MUST use a destructive color clearly distinct from the accent color.
- **FR-009**: Every color shown in the interface MUST come from the defined color roles; one-off colors MUST NOT be used.
- **FR-010**: The app MUST remain light-theme only and MUST NOT change with the user's system dark-mode setting.
- **FR-011**: This change MUST NOT alter layout, behavior, or wording of any existing feature; only colors and the visual treatments that depend on them (borders, shadows, tints) may change.

### Key Entities

- **Color role**: A named purpose a color serves (for example "accent" or "due-soon"), shared by every element with that purpose so the palette stays consistent.
- **Goal status treatment**: The combination of color and non-color cue that marks a goal as due soon, normal, or completed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of text and background pairs on the board and in both dialogs reach at least 4.5:1 contrast.
- **SC-002**: 100% of checkbox outlines, input borders, and focus indicators reach at least 3:1 contrast.
- **SC-003**: A first-time user can correctly tell due-soon, normal, and completed goals apart within 3 seconds of seeing the board.
- **SC-004**: In a side-by-side comparison, at least 8 out of 10 reviewers prefer the new look to the previous one.
- **SC-005**: A review of the finished interface finds zero colors that do not belong to a defined color role.
- **SC-006**: The board stays free of horizontal scrolling and keeps every existing feature working exactly as before.

## Assumptions

- The reference direction is a warm cream page, white surfaces with soft borders, a vivid violet accent, warm peach for due-soon goals with dark orange text, soft green for completed goals with dark green text, and a near-black ink for body text. Exact values may be tuned to meet the contrast requirements.
- Light theme only; no dark mode is added, consistent with the Goal Tracking Board spec.
- The change affects colors only; spacing, layout, copy, and behavior stay as they are.
- No new libraries are added, and the colors continue to be defined in one place as shared theme tokens, per the project constitution.
- Typography, icons, and illustrations are out of scope.
