# SPEC 07 — Create daycares table

> **Status:** Implemented
> **Depends on:** None (first database spec)
> **Date:** 2026-11-28
> **Objective:** Create the `daycares` table as the root entity of the data model, with a versioned migration pattern for Supabase, including seed data with 4 example daycares.

## Scope

**In:**

- **Migration pattern:** Create `migrations/` folder with sequentially numbered SQL files (e.g., `001_create_daycares.sql`). Each file is a complete, idempotent migration.
- **Table structure:** `daycares` with fields from schema reference:
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `name` (text, NOT NULL)
  - `created_at` (timestamptz, default `now()`)
- **RLS (Row Level Security):** Enable RLS on the table. Initial policies:
  - SELECT: Authenticated users can read all daycares (public for now; tighten later when multi-tenancy is needed)
  - INSERT/UPDATE/DELETE: No policies yet (admin-only via Supabase dashboard for now)
- **Seed data:** Insert 4 example daycares for development/testing:
  - "Sunshine Room Daycare" (mentioned in schema reference)
  - "Rainbow Kids Daycare"
  - "Little Stars Daycare"
  - "Happy Hearts Daycare"
- **Documentation:** README in `migrations/` explaining how to apply migrations (via Supabase SQL Editor or MCP tools).

**Out of scope:**

- Other tables (users, rooms, children, etc.) — each gets its own spec.
- Triggers (e.g., auto-create daycare on signup) — future spec.
- TypeScript types or DAL functions — will be added when features need them.

## Data model

```sql
-- Create table
CREATE TABLE IF NOT EXISTS daycares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

-- Policies (initial: read for authenticated users)
CREATE POLICY "Authenticated users can read all daycares"
  ON daycares
  FOR SELECT
  TO authenticated
  USING (true);

-- Seed data (4 example daycares)
INSERT INTO daycares (name) VALUES
  ('Sunshine Room Daycare'),
  ('Rainbow Kids Daycare'),
  ('Little Stars Daycare'),
  ('Happy Hearts Daycare')
ON CONFLICT DO NOTHING;
```

**Conventions (from schema reference):**

- PK `id` type `uuid` with default `gen_random_uuid()`.
- Timestamps use `timestamptz` (timezone-aware).
- Everything persisted is in English.

## Implementation plan

1. **Create migrations folder.** Create `migrations/` directory with a `README.md` explaining:
   - Naming convention: `NNN_description.sql` (e.g., `001_create_daycares.sql`)
   - How to apply: Copy-paste into Supabase SQL Editor, or use Supabase MCP `apply_migration` tool
   - Order matters: run migrations sequentially

2. **Write migration file.** Create `migrations/001_create_daycares.sql` with:
   - `CREATE TABLE IF NOT EXISTS daycares` (idempotent)
   - Enable RLS
   - SELECT policy for authenticated users
   - INSERT seed data for 4 daycares (idempotent with `ON CONFLICT DO NOTHING`)
   - Comments explaining each section

3. **Apply migration.** Use Supabase MCP tool `apply_migration` to execute the SQL against project `etwevmvxvqafbnqghskm`. Verify table exists and seed data inserted.

4. **Verify.** Check via Supabase MCP or dashboard that:
   - Table `daycares` exists with correct columns
   - RLS is enabled
   - SELECT policy is active
   - 4 seed records exist

## Acceptance criteria

- [x] `migrations/` folder exists with `README.md`
- [x] `migrations/001_create_daycares.sql` contains valid SQL
- [x] Migration applies successfully to Supabase project
- [x] Table `daycares` exists with columns: `id` (uuid, PK), `name` (text), `created_at` (timestamptz)
- [x] RLS is enabled on `daycares` table
- [x] SELECT policy allows authenticated users to read all daycares
- [x] No INSERT/UPDATE/DELETE policies exist yet (admin-only)
- [x] 4 seed daycares exist: Sunshine Room Daycare, Rainbow Kids Daycare, Little Stars Daycare, Happy Hearts Daycare
- [x] Migration file is idempotent (can be re-run without error or duplicate data)

## Decisions

- **Yes:** Simple `migrations/` folder with numbered SQL files. Replicable pattern for all future tables.
- **Yes:** RLS enabled from day one. Best practice: start secure, relax later if needed.
- **Yes:** SELECT policy for authenticated users. Daycares are public for now; multi-tenancy policies come when `users` table exists.
- **Yes:** Seed data with 4 daycares. Provides test data for development. Idempotent insert prevents duplicates on re-run.
- **No:** Complex migration tooling (Supabase CLI, version tracking tables). Keep it simple; upgrade when the project grows.
- **No:** TypeScript types or DAL. Will be added when features query daycares.
- **No:** Triggers or auto-creation logic. Future spec when auth/users are built.

## Risks

| Risk | Mitigation |
|------|------------|
| Migration applied twice could cause errors | Use `IF NOT EXISTS` in CREATE TABLE and `ON CONFLICT DO NOTHING` in INSERT |
| RLS policies too permissive | SELECT-only for now; tighten when multi-tenancy is needed |
| No version tracking of applied migrations | README documents manual process; upgrade to tracking table if needed |

## What is **not** in this spec

- Other tables (users, rooms, children, etc.)
- Triggers or auto-creation logic
- TypeScript types or DAL functions
- Multi-tenancy RLS policies

Each one of those, if it lands, goes in its own spec.
