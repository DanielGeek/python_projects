# Contract: Browser Storage

The app has no backend or public API. Its only external interface is the browser `localStorage`
entry that holds the user's goals.

## Key

`doit:goals:v1`

## Value

A JSON array of `Goal` objects (see [data-model.md](../data-model.md)). An empty board is `[]` or a missing key.

```json
[
  {
    "id": "6f1c0d4e-1b2a-4c3d-8e5f-0a1b2c3d4e5f",
    "title": "Read one book",
    "endDate": "2026-11-20",
    "status": "current",
    "createdAt": "2026-11-08T10:15:00.000Z",
    "completedAt": null
  },
  {
    "id": "0b9a8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d",
    "title": "Ship the first version",
    "endDate": "2026-11-05",
    "status": "completed",
    "createdAt": "2026-10-20T08:00:00.000Z",
    "completedAt": "2026-11-04"
  }
]
```

## Behavior

- **Read**: parse the JSON; if the key is missing, the JSON is invalid, or the value is not an array, treat it as `[]`.
  Entries that do not match the Goal shape are dropped.
- **Write**: after every add, move-to-completed, or delete, the full array is written back.
- **Failure**: if writing throws (storage full or unavailable), keep the in-memory state and keep the page usable.
- **Cross-tab**: a `storage` event for this key refreshes the board in other tabs.
- **Versioning**: the `v1` suffix lets a future incompatible schema use a new key without corrupting old data.

## Out of scope

No server sync, no accounts, no export/import in this version.
