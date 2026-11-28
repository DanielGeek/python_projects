# Database Migrations

SQL migrations for Supabase, executed in order.

## Naming convention

Files follow the pattern `NNN_description.sql`:

- `001_create_daycares.sql`
- `002_create_users.sql`
- `003_create_rooms.sql`

## How to apply

**Option 1: Supabase SQL Editor** (manual)

1. Open Supabase Dashboard → SQL Editor
2. Copy-paste the migration file content
3. Run the query

**Option 2: Supabase MCP tool** (automated)

Use the `apply_migration` tool from the Supabase MCP server:

```
apply_migration({
  name: "001_create_daycares",
  query: "<contents of the SQL file>"
})
```

## Order matters

Run migrations sequentially. Each migration may depend on previous ones.

## Idempotency

Migrations use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` where applicable, so they can be re-run safely.

## Current migrations

| #   | File                        | Description                  |
| --- | --------------------------- | ---------------------------- |
| 001 | `001_create_daycares.sql`   | Creates `daycares` table + seed data |
