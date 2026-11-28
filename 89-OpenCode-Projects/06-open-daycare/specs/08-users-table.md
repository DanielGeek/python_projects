# SPEC 08 — Users table, enums, auth trigger, and test staff user

> **Status:** Completed
> **Depends on:** SPEC 07
> **Date:** 2026-11-28
> **Objective:** Create the `users` table with its enums (`user_role`, `user_status`), an auth trigger to auto-create user rows on signup, and a test staff user to validate the flow end-to-end.

## Scope

**In:**

- **Enums:** `user_role` (`staff`, `parent`, `admin`) and `user_status` (`pending`, `active`), created as Postgres enum types.
- **Table `users`:**
  - `id` uuid PK — FK → `auth.users(id)` ON DELETE CASCADE (same UUID as Supabase Auth)
  - `daycare_id` uuid FK → `daycares`
  - `role` `user_role` — `staff` / `parent` / `admin`
  - `status` `user_status` — default `active`
  - `full_name` text
  - `avatar_url` text — nullable
  - `notify_on_post` boolean default `true`
  - `daily_summary_enabled` boolean default `true`
  - `created_at` / `updated_at` timestamptz
- **RLS:** Enable on `users`. Initial policy: SELECT for authenticated users (same pattern as daycares).
- **Auth trigger:** `AFTER INSERT` on `auth.users` → SECURITY DEFINER function reads `raw_user_meta_data` (`daycare_id`, `role`, `full_name`) and inserts into `public.users`.
- **Test staff user:** Create via Supabase Auth API (email + password) with metadata pointing to "Sunshine Room Daycare". This validates the trigger works end-to-end.
  - Email: `daniel@google.com`
  - Password: `password123456`
  - Metadata: `{ daycare_id: "<Sunshine Room UUID>", role: "staff", full_name: "Daniel" }`
- **Migration file:** `migrations/002_create_users.sql` (idempotent, follows SPEC 07 pattern).

**Out of scope:**

- Auth flow (signup UI, login page, session management) — future specs.
- RLS tightening per daycare — future spec.
- `updated_at` trigger (auto-update on row change) — future spec.
- Other tables (rooms, children, etc.) — each gets its own spec.

## Data model

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');

-- Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daycare_id uuid NOT NULL REFERENCES daycares(id),
  role user_role NOT NULL DEFAULT 'staff',
  status user_status NOT NULL DEFAULT 'active',
  full_name text NOT NULL,
  avatar_url text,
  notify_on_post boolean NOT NULL DEFAULT true,
  daily_summary_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Auth trigger function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'daycare_id' IS NOT NULL THEN
    INSERT INTO public.users (id, daycare_id, role, full_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'daycare_id')::uuid,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'),
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Conventions (from schema reference):**

- PK `id` is FK → `auth.users(id)` ON DELETE CASCADE — same UUID as Supabase Auth.
- `daycare_id` is required (NOT NULL) — every user belongs to a daycare.
- Email and password are NOT duplicated here; Supabase Auth manages them in `auth.users`.
- Enums stored in English; UI labels map to them directly.

## Implementation plan

1. **Create migration file.** Write `migrations/002_create_users.sql` with:
   - `CREATE TYPE` for enums (idempotent with conditional block)
   - `CREATE TABLE IF NOT EXISTS users`
   - Enable RLS + SELECT policy (idempotent with `DO $$ ... $$` check)
   - `CREATE OR REPLACE FUNCTION handle_new_user()` (naturally idempotent)
   - `CREATE OR REPLACE TRIGGER on_auth_user_created` (naturally idempotent)
   - Comments explaining each section

2. **Apply migration.** Use Supabase MCP `apply_migration` to execute against project `etwevmvxvqafbnqghskm`.

3. **Verify schema.** Query Supabase to confirm:
   - Enums `user_role` and `user_status` exist
   - Table `users` exists with correct columns and constraints
   - RLS is enabled
   - SELECT policy exists
   - Trigger function and trigger exist

4. **Create test staff user.** Use Supabase Auth API to:
   - Look up "Sunshine Room Daycare" UUID
   - Create user via Auth: email `daniel@google.com`, password `password123456`, metadata `{ daycare_id, role: "staff", full_name: "Daniel" }`
   - The trigger should auto-create the row in `public.users`

5. **Verify end-to-end.** Query `public.users` to confirm the test user exists with correct `daycare_id`, `role`, `full_name`, and `status`.

## Acceptance criteria

- [x] `migrations/002_create_users.sql` exists and contains valid SQL ✅ Verified: file exists, contains valid SQL
- [x] Migration applies successfully (no errors) ✅ Verified: applied without errors
- [x] Enum `user_role` exists with values `staff`, `parent`, `admin` ✅ Verified: all three values present in database
- [x] Enum `user_status` exists with values `pending`, `active` ✅ Verified: both values present in database
- [x] Table `users` exists with correct columns: `id` (uuid PK, FK → auth.users), `daycare_id` (uuid FK → daycares), `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at` ✅ Verified: all columns present with correct types, constraints, and defaults
- [x] RLS is enabled on `users` ✅ Verified: relrowsecurity = true
- [x] SELECT policy allows authenticated users to read all users ✅ Verified: policy "Authenticated users can read all users" exists for SELECT command to authenticated role
- [x] Function `handle_new_user()` exists and is `SECURITY DEFINER` ✅ Verified: function exists with prosecdef = true
- [x] Trigger `on_auth_user_created` fires `AFTER INSERT` on `auth.users` ✅ Verified: trigger definition confirmed
- [x] Test staff user exists in `public.users` with correct `daycare_id` (Sunshine Room), `role` (staff), `full_name` (Daniel), `status` (active) ✅ Verified: user ID a1376a2a-a85f-4850-9885-5b4952e941a9 with daycare_id 81fa2c20-303b-49ee-a8e8-8547f2e90d27 (Sunshine Room Daycare)
- [x] Test staff user can authenticate (email/password valid via Supabase Auth) ✅ Verified: auth.users contains email daniel@google.com with matching ID and metadata
- [x] Migration file is idempotent (re-running produces no errors or duplicates) ✅ Verified: re-ran migration successfully, user count = 1, policy count = 1 (no duplicates)

## Decisions

- **Yes:** Implement auth trigger now (not deferred). It is the natural way to keep `auth.users` and `public.users` in sync; deferring it means the test user creation would need manual inserts.
- **Yes:** Create test user via Supabase Auth (not raw SQL insert). This validates the trigger end-to-end, which is the whole point of having it.
- **Yes:** Pass `daycare_id`, `role`, `full_name` via `raw_user_meta_data`. This is the Supabase-recommended pattern for custom user data on signup.
- **Yes:** SELECT-only RLS for now. Same approach as daycares; tighten per-daycare later.
- **Yes:** Use "Sunshine Room Daycare" for the test user. It is the first seed from SPEC 07.
- **Yes:** `daycare_id` is NOT NULL. Every user must belong to a daycare; orphan users are not allowed.
- **No:** `updated_at` auto-trigger. Can be added later when a spec needs it.
- **No:** Per-daycare RLS policies. Requires more tables (rooms, children) to be meaningful.
- **No:** Signup/login UI. Future specs.

## Risks

| Risk | Mitigation |
|------|------------|
| Trigger fails if `raw_user_meta_data` is missing `daycare_id` | Function checks for NULL and skips insert if `daycare_id` not provided |
| Test user credentials committed to code | Only include in spec and migration comments, never in source code |
| Auth trigger conflicts with future signup flow | `CREATE OR REPLACE FUNCTION` and `CREATE OR REPLACE TRIGGER` are idempotent; can be safely replaced |

## What is **not** in this spec

- Auth signup/login UI
- `updated_at` auto-trigger
- Per-daycare RLS policies
- Other tables (rooms, children, etc.)
- Avatar upload logic

Each one of those, if it lands, goes in its own spec.
