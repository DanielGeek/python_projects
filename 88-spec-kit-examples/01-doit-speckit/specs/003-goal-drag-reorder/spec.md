# Feature Specification: Goal Drag-and-Drop Reordering

**Feature Branch**: `003-goal-drag-reorder`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "drag and drop - Let's make it so that users can reorder goals by dragging and dropping them above or below other goals in the list."

## Clarifications

### Session 2026-11-09

- Q: Once a user has dragged any goal, should the list stop sorting by end date and keep only the user's manual order from then on? → A: Yes. The first drag freezes the whole list in the user's order; new goals go to the bottom and the list is never auto-sorted again.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reorder current goals by dragging (Priority: P1)

A user looks at their current goals and wants to put them in the order that matches their own
priorities. They press and hold a goal, drag it above or below another goal in the same
column, and release. The goal stays in its new position.

**Why this priority**: This is the whole feature. Without it, users cannot control the order of their goals.

**Manual Check**: Add three goals, drag the last one to the top, and confirm the list shows the new order.

**Acceptance Scenarios**:

1. **Given** a current goals column with at least two goals, **When** the user drags a goal and drops it above another goal, **Then** the dragged goal appears directly above that goal and the other goals keep their relative order.
2. **Given** a current goals column with at least two goals, **When** the user drags a goal and drops it below another goal, **Then** the dragged goal appears directly below that goal and the other goals keep their relative order.
3. **Given** the user is dragging a goal, **When** they move over the list, **Then** the dragged goal is visibly distinct and the spot where it will land is clearly indicated.
4. **Given** the user is dragging a goal, **When** they release it outside the list or press Escape, **Then** the goal returns to its original position and the order is unchanged.
5. **Given** a current goals column with only one goal, **When** the user views it, **Then** no reordering is possible and nothing looks broken.

---

### User Story 2 - Keep the custom order between visits (Priority: P1)

A user reorders their goals, closes the app, and returns later on the same device. The goals
are still in the order they arranged.

**Why this priority**: A custom order that resets on reload would be frustrating and would make the feature feel broken.

**Manual Check**: Reorder goals, reload the page, and confirm the order is unchanged.

**Acceptance Scenarios**:

1. **Given** the user has reordered their current goals, **When** they reload or revisit the app on the same device, **Then** the goals appear in the custom order.
2. **Given** the user has a custom order, **When** they add a new goal, **Then** the new goal appears at the bottom of the list and the existing order is unchanged.
3. **Given** the user has a custom order, **When** they complete or permanently delete a goal, **Then** the remaining goals keep their relative order.

---

### User Story 3 - Reorder without a mouse (Priority: P2)

A user on a touch screen or using only a keyboard can also reorder goals, so the feature is
not limited to mouse users.

**Why this priority**: The app must work from phones to desktops and be keyboard accessible, but the mouse flow already delivers the core value.

**Manual Check**: On a touch device (or touch emulation), drag a goal to a new position; with the keyboard, pick up a goal, move it, and drop it.

**Acceptance Scenarios**:

1. **Given** a touch screen, **When** the user presses and drags a goal to a new position and lifts their finger, **Then** the goal moves there, and the page does not scroll unexpectedly while dragging.
2. **Given** a goal has keyboard focus, **When** the user uses the keyboard to pick it up, move it up or down, and drop it, **Then** the order changes accordingly and the goal keeps visible focus.
3. **Given** a goal is being moved by keyboard, **When** the user cancels, **Then** the goal returns to its original position.

---

### Edge Cases

- The user clicks a goal's checkbox or action buttons: this must not start a drag or change the order.
- The user drops a goal on its own position: nothing changes.
- The list is long enough to scroll: dragging near the top or bottom edge lets the user reach goals that are out of view.
- A goal has a very long title: it can still be grabbed and dragged without breaking the layout.
- Highlighted goals (due within 3 days or overdue) are dragged: they stay highlighted in their new position.
- A goal is checked and showing its "Move to completed" / "Delete permanently" actions: it can still be reordered and keeps its checked state and actions.
- The completed goals column: it is not reorderable.
- Narrow screens: dragging works within the single-column or stacked layout without horizontal scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to drag any goal in the current goals column and drop it above or below any other goal in that column.
- **FR-002**: After a drop, the dragged goal MUST appear at the indicated position and all other goals MUST keep their relative order.
- **FR-003**: While dragging, the system MUST show which goal is being moved and where it will land if released.
- **FR-004**: Users MUST be able to cancel a drag (release outside the list or press Escape) and have the original order restored.
- **FR-005**: The custom order MUST persist on the user's device and survive reload or revisit.
- **FR-006**: Until the user first reorders a goal, the current goals column MUST keep the end-date ordering from the goal tracking board (001, FR-016). After the first drag, the list MUST keep exactly the user's manual order and MUST NOT be auto-sorted by end date again. This feature supersedes 001 FR-016 from that point on.
- **FR-007**: After the first drag, a newly added goal MUST appear at the bottom of the current goals column without changing the existing order. Before the first drag, new goals are placed by end date (FR-006).
- **FR-008**: Completing or permanently deleting a goal MUST NOT change the relative order of the remaining current goals.
- **FR-009**: Reordering MUST work with touch input and with the keyboard, not only with a mouse, and keyboard users MUST get clear focus and position feedback.
- **FR-010**: Interactive controls inside a goal (checkbox, action buttons) MUST keep working and MUST NOT trigger a drag.
- **FR-011**: The completed goals column MUST NOT be reorderable and MUST keep its most-recently-completed-first order.
- **FR-012**: The reorder interaction MUST be discoverable without instructions, for example through a visible grab handle or grab cursor, and any handle MUST be at least 44x44 px on touch screens.
- **FR-013**: The layout MUST remain usable from phone to desktop widths with no horizontal page scroll while dragging.

### Key Entities

- **Goal**: Gains a position in the current goals list. The position reflects the user's chosen order and is kept along with the rest of the goal's data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can move a goal to a new position in under 3 seconds.
- **SC-002**: 100% of drops place the goal exactly where the on-screen indicator showed it would land.
- **SC-003**: After reloading the app, 100% of reordered goals appear in the order the user left them.
- **SC-004**: A first-time user reorders a goal on their first attempt without instructions.
- **SC-005**: On screens from 360 px to 1920 px wide, reordering works with mouse, touch, and keyboard, without horizontal scrolling.
- **SC-006**: Using a checkbox or action button on a goal never causes an unintended reorder.

## Assumptions

- Reordering applies only to the current goals column; completed goals are not reorderable.
- Dragging happens within a single column; moving goals between columns by dragging is out of scope (completion still uses the checkbox flow).
- Before the first drag, goals stay in end-date order (nearest first). After the first drag, the whole list follows the user's manual order and is never auto-sorted again.
- Goals created before this feature keep their end-date order until the user first reorders them.
- Single user on a single device; the custom order is stored on the device and not shared.
- Project principles (clean code, simple UX, responsive design, minimal dependencies, no automated testing) apply, as defined in the constitution.
