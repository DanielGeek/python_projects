# Data Model: Goal Tracking Board

## Entity: Goal

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | yes | Unique identifier, generated with `crypto.randomUUID()` when the goal is created. |
| `title` | string | yes | What the user wants to achieve. Trimmed; 1 to 100 characters. |
| `endDate` | string `yyyy-MM-dd` | yes | Local calendar date by which the goal should be achieved. |
| `status` | `"current"` or `"completed"` | yes | Which column the goal appears in. |
| `createdAt` | string (ISO 8601 timestamp) | yes | Creation time; tie-breaker for ordering. |
| `completedAt` | string `yyyy-MM-dd` or `null` | yes | Local date the goal was moved to completed; `null` while current. |

Example (synthetic):

```json
{
  "id": "6f1c0d4e-1b2a-4c3d-8e5f-0a1b2c3d4e5f",
  "title": "Read one book",
  "endDate": "2026-11-20",
  "status": "current",
  "createdAt": "2026-11-08T10:15:00.000Z",
  "completedAt": null
}
```

## Derived values (never stored)

- **Days left** = calendar days from today to `endDate` (negative when overdue).
- **Due soon** = status is `current` and days left <= 3 (includes due today and overdue).
- **Label**: "N days left", "1 day left", "Due today", or "N days overdue".

## Validation rules (from the spec)

- `title`: required after trimming (FR-005, FR-006); maximum 100 characters.
- `endDate`: required (FR-005); MUST NOT be earlier than today when creating a goal (FR-006).
- Stored data that fails validation is ignored rather than shown.

## State transitions

```text
(new goal) --add--> current --move to completed--> completed
                       |
                       +--delete (after confirmation)--> removed
```

- Completed goals cannot be edited, restored, or deleted in this version (see spec Assumptions).
- Transient UI state, not persisted: which current goal is checked (selected), whether a dialog is open.

## Ordering

- Current column: `endDate` ascending, then `createdAt` ascending (FR-016).
- Completed column: `completedAt` descending, then `createdAt` descending.
