# Data Model: Refined Color Palette

This feature stores no data and changes no stored data. The only "entities" are the two design concepts
named in the spec. The `Goal` entity and the `doit:goals:v1` storage contract from feature 001 are unchanged.

## Entity: Color role

A named purpose a color serves. Every color in the interface is one of these.

| Field | Description |
|-------|-------------|
| `name` | Role name, for example `brand` or `urgent`. |
| `value` | Hex color. Values are tuned only to satisfy the contrast rules. |
| `foreground` (optional) | Paired text or border color that is guaranteed readable on `value`. |
| `usage` | Where the role may appear (see [contracts/color-roles.md](contracts/color-roles.md)). |

Rules:

- A role is defined once, in the theme block of `app/globals.css`; components reference the role, never a hex value (FR-009).
- Every `value`/`foreground` pair meets 4.5:1 for text; every role used as a control boundary or focus indicator meets 3:1 on the surfaces it sits on (FR-006, FR-007).
- Exactly one role (`brand`) is the accent (FR-003); `danger` is visually distinct from it (FR-008).

## Entity: Goal status treatment

How a goal card looks for each state. Derived from the goal's status and days left (see feature 001 data model); never stored.

| State | When | Surface | Border | Text | Non-color cue |
|-------|------|---------|--------|------|---------------|
| Normal | current, more than 3 days left | `cream` | 1 px `line` | `ink` / `ink-soft` | none needed |
| Due soon | current, 3 days or fewer left (includes today and overdue) | `urgent` | 2 px `urgent-foreground` | `ink` title, `urgent-foreground` label | thick border, alarm icon, label text |
| Completed | status completed | `done` | 1 px `line` | `ink` title, `ink-soft` date | "Completed <date>" text, separate column |

Selected (checkbox checked) is orthogonal to the three states: the checkbox fills with `brand` and the action
buttons appear, on any surface.
