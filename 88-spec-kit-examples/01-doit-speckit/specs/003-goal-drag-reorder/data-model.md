# Data Model: Goal Drag-and-Drop Reordering

## Goal (unchanged)

The `Goal` type in `lib/goals.ts` and the `doit:goals:v1` array are **not changed**. A goal's place in the
list is not stored on the goal.

## GoalOrder (new)

| Field | Type | Notes |
| --- | --- | --- |
| order | `string[] \| null` | Ids of current goals in the user's chosen order. `null` = the user has never reordered. |

Stored under `doit:goal-order:v1` (see [contracts/storage.md](contracts/storage.md)).

### Derived list: `orderCurrent(goals, order)`

1. Take the goals whose status is `current`.
2. If `order` is `null`, return them sorted by `sortCurrent` (end date, then created time). Unchanged behavior.
3. Otherwise, return the goals whose id appears in `order`, in that order, followed by the current goals
   whose id is not in `order`, sorted by created time (oldest first).
4. Ids in `order` that are not current goals (completed, deleted, unknown) are ignored.

### Rules

- **First drag** (spec FR-006): `reorderGoals(ids)` writes the full list of current ids as the new `order`.
  After this, `order` is never `null` again, so the list is never auto-sorted by end date.
- **New goal** (FR-007): not in `order`, so step 3 appends it at the bottom. Before the first drag (`order`
  is `null`) it is placed by end date as before.
- **Complete or delete** (FR-008): the goal leaves the current set, so step 4 drops its id. Remaining goals
  keep their relative order. `order` is not rewritten.
- **Drop on same position**: no write.
- **Invalid or corrupt stored value**: treated as `null` (fall back to end-date order).

### Move helper: `moveId(ids, from, to)`

Pure function returning a new array with the id at index `from` moved to index `to`. Used by both the
pointer path (indexes from SortableJS) and the keyboard path (one step up or down).
