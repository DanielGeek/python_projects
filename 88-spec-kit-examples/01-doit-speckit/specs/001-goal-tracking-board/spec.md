# Feature Specification: Goal Tracking Board

**Feature Branch**: `001-goal-tracking-board`

**Created**: 2026-11-08

**Status**: Draft

**Input**: User description: "Initial page setup. This application should be a goal tracking web app called Doit. There should be two columns: a left one where current goals are shown, along with how many days left the user has to achieve the goal, and a right one where completed goals are. Each goal can be checked using a checkbox and then either moved to the completed goals or permanently deleted. To add new goals, a user can click on a button to open a new goal form in a modal. Title and end date fields. Goals reaching their end date within 3 days are highlighted. Uses a modern light theme with soft pastel colors."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a goal and see it on the board (Priority: P1)

A user opens Doit and sees a board with two columns: current goals on the left and completed
goals on the right. They click an "Add goal" button, a modal form opens, and they enter a
title and an end date. After saving, the goal appears in the current goals column with the
number of days left until its end date.

**Why this priority**: Without the ability to create goals and see them, the app has no value.
This is the smallest slice that delivers a usable goal tracker.

**Manual Check**: Open the app, add one goal with a future end date, and confirm it shows in the
left column with the correct days-left count.

**Acceptance Scenarios**:

1. **Given** the board is empty, **When** the user opens the app, **Then** both columns are visible
   with a friendly empty state and an "Add goal" button.
2. **Given** the user clicks "Add goal", **When** the modal opens, **Then** it shows a title field
   and an end date field.
3. **Given** the modal is open with a valid title and a future end date, **When** the user submits,
   **Then** the modal closes and the goal appears in the current goals column with its days left.
4. **Given** the modal is open, **When** the user cancels or dismisses it, **Then** no goal is created.

---

### User Story 2 - Complete a goal (Priority: P1)

A user checks the checkbox on a current goal. The goal is then offered two choices: move it
to the completed goals column, or delete it permanently.

**Why this priority**: Completing goals is the core purpose of a goal tracker and populates the
second column.

**Manual Check**: Check a goal's checkbox, choose "Move to completed", and confirm it leaves the
left column and appears in the right column.

**Acceptance Scenarios**:

1. **Given** a current goal, **When** the user checks its checkbox, **Then** the user is offered
   "Move to completed" and "Delete permanently" actions for that goal.
2. **Given** the checkbox is checked, **When** the user chooses "Move to completed", **Then** the goal
   disappears from the left column and appears in the right column.
3. **Given** the checkbox is checked, **When** the user chooses "Delete permanently", **Then** the
   goal is removed from the board and does not appear in either column.
4. **Given** the checkbox is checked, **When** the user unchecks it, **Then** the goal returns to
   its normal state and no action is taken.

---

### User Story 3 - Spot goals that are due soon (Priority: P2)

A user glances at the current goals column and immediately sees which goals are close to
their deadline. Goals whose end date is within 3 days are visually highlighted.

**Why this priority**: Deadline awareness is the key value of showing days left, but the board
is still usable without highlighting.

**Manual Check**: Add one goal ending in 2 days and one ending in 10 days; confirm only the first is
highlighted.

**Acceptance Scenarios**:

1. **Given** a current goal with 3 or fewer days left, **When** the board is shown, **Then** the goal
   is visually highlighted.
2. **Given** a current goal with more than 3 days left, **When** the board is shown, **Then** the goal
   is not highlighted.
3. **Given** a current goal whose end date is today, **When** the board is shown, **Then** it is
   highlighted and shows that it is due today.
4. **Given** a current goal whose end date has passed, **When** the board is shown, **Then** it is
   highlighted and shows that it is overdue.

---

### User Story 4 - Keep goals between visits (Priority: P2)

A user closes the app and returns later on the same device. Their current and completed
goals are still there.

**Why this priority**: A goal tracker that forgets goals is not useful, but the board can be
demonstrated without it.

**Manual Check**: Add a goal, move another to completed, reload the page, and confirm both columns are
unchanged.

**Acceptance Scenarios**:

1. **Given** the user has current and completed goals, **When** they reload or revisit the app on the
   same device, **Then** all goals appear in the same columns.
2. **Given** the user permanently deleted a goal, **When** they revisit the app, **Then** the goal
   is still gone.

---

### Edge Cases

- The user submits the form with an empty or whitespace-only title: submission is blocked with a clear message.
- The user submits the form without an end date: submission is blocked with a clear message.
- The user picks an end date in the past: the form asks them to choose today or a later date.
- A very long title: it wraps or truncates gracefully without breaking the column layout.
- Many goals in one column: the column remains usable and scrolls without breaking the page layout.
- The user opens the modal and presses Escape or clicks outside it: the modal closes without saving.
- The days-left count changes at midnight: it reflects the current date whenever the board is shown.
- Narrow screens: the two columns remain readable (see FR-013).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST be named "Doit" and show that name on the page.
- **FR-002**: The page MUST show two columns: current goals on the left and completed goals on the right.
- **FR-003**: Each current goal MUST show its title and the number of days left until its end date.
- **FR-004**: Users MUST be able to open a new-goal form in a modal by clicking an "Add goal" button.
- **FR-005**: The form MUST have a title field and an end date field, and both MUST be required.
- **FR-006**: The system MUST reject an empty title and an end date earlier than today, with a clear message.
- **FR-007**: Each current goal MUST have a checkbox; checking it MUST offer the actions "Move to completed" and "Delete permanently".
- **FR-008**: "Move to completed" MUST remove the goal from the left column and show it in the right column.
- **FR-009**: "Delete permanently" MUST remove the goal from the board entirely.
- **FR-010**: Current goals with 3 or fewer days left (including due today and overdue) MUST be visually highlighted.
- **FR-011**: The modal MUST be dismissible via a cancel control, the Escape key, or a click outside it.
- **FR-012**: The app MUST persist goals on the user's device so they remain after reload or revisit.
- **FR-013**: The layout MUST remain usable from phone to desktop widths, with no horizontal page scroll.
- **FR-014**: The interface MUST use a modern light theme with soft pastel colors, keeping text readable against backgrounds.
- **FR-015**: Each column MUST show a friendly empty state when it has no goals.

### Key Entities

- **Goal**: Something the user wants to achieve. Has a title, an end date, and a status of either current or completed. Days left is derived from the end date and today's date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a new goal in under 20 seconds from opening the app.
- **SC-002**: A user can complete a goal (check it and move it to completed) in under 5 seconds.
- **SC-003**: 100% of goals due within 3 days are highlighted, and 0% of goals due later are highlighted.
- **SC-004**: After reloading the app, 100% of previously saved goals appear in the correct column.
- **SC-005**: On screens from 360 px to 1920 px wide, all goals and actions are reachable without horizontal scrolling.
- **SC-006**: A first-time user completes the add-then-complete flow without any instructions.

## Assumptions

- Single user, no accounts or sign-in; goals are stored on the user's own device and are not shared across devices.
- "Within 3 days" means 3 or fewer full days left, and also includes goals due today or overdue.
- Days left is counted in calendar days from today's date to the end date.
- Overdue goals stay in the current column, highlighted, until the user completes or deletes them.
- "Permanently deleted" means no undo or trash; a confirmation step before deleting is acceptable.
- Completed goals are shown in the right column without days-left information and cannot be edited or restored in this version.
- Editing an existing goal's title or end date is out of scope for this version.
- The phrase "Lex uses a modern light theme" in the request is read as "uses a modern light theme".
- Project principles (clean code, simple UX, responsive design, minimal dependencies, no automated testing) apply, as defined in the constitution.
