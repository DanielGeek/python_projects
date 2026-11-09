# Contract: Local Storage

| Key | Owner | Value | Change in this feature |
| --- | --- | --- | --- |
| `doit:goals:v1` | `lib/goal-store.ts` | JSON array of `Goal` | None |
| `doit:goal-order:v1` | `lib/goal-store.ts` | JSON array of goal id strings, or key absent | New |

## `doit:goal-order:v1`

- **Present** and a JSON array of strings: the user's manual order of current goals.
- **Absent**, unparsable, or not an array of strings: treated as "never reordered".
- Only `lib/goal-store.ts` reads or writes it. Writes go through `reorderGoals(ids)`.
- A `storage` event on this key (another tab) refreshes the in-memory order, as already done for goals.
- If writing fails (storage full or blocked), the in-memory order is kept so the page stays usable,
  same as goals today.
- No migration is needed. Existing users have no key, so they see the end-date order until they drag.
