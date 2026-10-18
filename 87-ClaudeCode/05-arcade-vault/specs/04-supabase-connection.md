# SPEC 04 — Supabase connection

> **Status:** Implemented
> **Depends on:** SPEC 03
> **Date:** 2026-10-18
> **Objective:** Connect the Next.js app to the existing Supabase project through browser and server clients configured from environment variables, with a health endpoint that proves the connection.

---

## Why this spec exists

`lib/session.ts`, `lib/scores.ts` and `lib/credits.ts` carry `BACKEND:` comments marking where a real backend should replace localStorage. The Supabase project already exists (`sxwaixbuvhubktrkktnx`) and is empty: it has no tables. Replacing those modules in one go touches auth, scores, credits, the database schema and security rules, which is too much for one spec.

This spec only lays the foundation: the packages, the two clients, the environment variables and a way to check that the app can reach Supabase. Nothing in the UI changes. The decisions already taken for the next specs are recorded in **Decisions** so they are not lost.

---

## Scope

**In:**

- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Browser client in `lib/supabase/client.ts` and server client in `lib/supabase/server.ts`.
- Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, read through one helper that fails with a clear message when they are missing.
- Fix the typo `SUPASE_DB_PASSWORD` to `SUPABASE_DB_PASSWORD` in `.env.template`. It stays server only and no code reads it in this spec.
- Route Handler `GET /api/health/supabase` that checks the connection and answers 200 or 500 without exposing keys or error details.
- A unit test for the environment helper.
- Update `CLAUDE.md` with the new files, route and environment variables.

**Out of scope (for future specs):**

- Supabase Auth: email + password sign in and sign up, `profiles` table with `username`, email confirmation (`/auth/confirm`), `proxy.ts` to refresh the session cookie, and replacing `lib/session.ts`. Guests stay local.
- Moving scores to a `scores` table with RLS, and replacing `lib/scores.ts`.
- Moving credits to Supabase.
- Realtime subscriptions and Edge Functions.
- Any table, migration or `supabase/migrations/` folder. There is no schema to version yet.
- Google and GitHub OAuth. The buttons on `/login` keep their current notice.
- Generated TypeScript types (`supabase gen types`). They only matter once tables exist.
- Any change to the existing pages, nav or `/login`.

---

## Data model

This feature persists no data and creates no tables. It adds two public environment variables, one server-only variable name, two client factories and one API contract.

Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=              # https://<project-ref>.supabase.co, public by design
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # publishable (anon) key, public by design, security comes from RLS
SUPABASE_DB_PASSWORD=                  # server only, reserved for the Supabase CLI. No code reads it in this spec.
```

Environment helper (pure, no browser or server APIs, so it can be unit tested):

```ts
// lib/supabase/env.ts
export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

/** Reads and validates the two public variables. Throws an Error naming the missing variable. */
export function getSupabaseEnv(source?: Record<string, string | undefined>): SupabaseEnv;
```

Client factories:

```ts
// lib/supabase/client.ts — "use client" safe, for Client Components
export function createClient(): SupabaseClient;

// lib/supabase/server.ts — for Server Components and Route Handlers, reads cookies()
export async function createClient(): Promise<SupabaseClient>;
```

API contract of `GET /api/health/supabase`:

```ts
// 200 { ok: true }
// 500 { ok: false; error: string }   variables missing, Supabase unreachable, or Supabase rejected the key
// Any other method answers 405 (default Route Handler behavior).
```

Conventions:

- `getSupabaseEnv` accepts an optional `source` so tests do not touch `process.env`. In production code it defaults to the `NEXT_PUBLIC_*` variables, referenced literally (`process.env.NEXT_PUBLIC_SUPABASE_URL`) so Next can inline them in the browser bundle.
- Clients are created inside the factory function, never at module load, so a missing variable does not break `npm run build` or the render of unrelated pages.
- The health check calls the Auth health endpoint of the project (`<url>/auth/v1/health`) with the publishable key in the `apikey` header. The database has no tables yet, so a table query is not possible. A 200 proves that the URL is right and the key is accepted.
- Real error details are logged with `console.error` on the server. The response carries a generic message.
- The route runs on Node.js, is never cached and takes no input. It sets no `runtime` or `dynamic` export: with `cacheComponents` enabled, Next rejects both, a `GET` handler is dynamic by default and Node.js is the default runtime. The `fetch` uses `cache: "no-store"`.
- The server client follows the `@supabase/ssr` cookie pattern (`getAll` / `setAll` with `cookies()` from `next/headers`). The `setAll` call is wrapped in `try/catch` because Server Components cannot write cookies. This is inert until the auth spec adds `proxy.ts`.
- The publishable key is never used for privileged work. No service role key is introduced.

Route map after this spec:

| Route                      | Content                |
| -------------------------- | ---------------------- |
| `GET /api/health/supabase` | Connection check (new) |
| all other routes           | Unchanged              |

File layout:

```
lib/supabase/env.ts          getSupabaseEnv, shared by both clients and the health route
lib/supabase/env.test.ts     Vitest tests for getSupabaseEnv
lib/supabase/client.ts       browser client (createBrowserClient)
lib/supabase/server.ts       server client (createServerClient with cookies)
app/api/health/supabase/route.ts   GET handler
.env.template                adds the two public variables, renames SUPASE_DB_PASSWORD
```

---

## Implementation plan

1. **Dependencies and env.** `npm install @supabase/supabase-js @supabase/ssr`. Add the two public variables to `.env.template` and rename `SUPASE_DB_PASSWORD` to `SUPABASE_DB_PASSWORD`. Fill the real values in the local `.env` (URL from the MCP `get_project_url`, key from `get_publishable_keys`). Manual test: `npm run build` still passes and `.env` stays untracked.
2. **Env helper with tests.** Create `lib/supabase/env.ts` and `lib/supabase/env.test.ts`. Cases: both variables present, URL missing, key missing, empty string, URL that is not `http(s)`. Manual test: `npm test` passes.
3. **Browser client.** Create `lib/supabase/client.ts` with `createClient()` using `createBrowserClient` and `getSupabaseEnv()`. Manual test: `npm run lint` and `npm run build` pass; no page imports it yet.
4. **Server client.** Read the Next 16 docs for `cookies()` in `node_modules/next/dist/docs/` first, as `AGENTS.md` requires. Create `lib/supabase/server.ts` with `createClient()` using `createServerClient` and the `getAll` / `setAll` cookie adapter. Manual test: `npm run build` passes.
5. **Health route.** Create `app/api/health/supabase/route.ts` with `GET`: read the env, call `<url>/auth/v1/health` with the `apikey` header, answer `{ ok: true }` or the 500 response. Manual test with `curl`: 200 with valid variables; 500 after removing one variable and restarting `npm run dev`; 500 with a wrong key.
6. **Docs.** Update `CLAUDE.md`: `lib/supabase/`, `GET /api/health/supabase`, the new environment variables, and replace the `BACKEND:` hint that mentions Supabase Auth with a pointer to this foundation.

---

## Acceptance criteria

- [x] `npm run lint`, `npm test` and `npm run build` finish without errors, also with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` unset.
- [x] `package.json` lists `@supabase/supabase-js` and `@supabase/ssr` as dependencies.
- [x] `getSupabaseEnv` returns `{ url, publishableKey }` when both variables are set.
- [x] `getSupabaseEnv` throws an error whose message names the missing variable when either one is missing or empty.
- [x] `GET /api/health/supabase` answers `200 { "ok": true }` with the real variables in `.env`.
- [x] `GET /api/health/supabase` answers 500 with `{ "ok": false, "error": <generic text> }` when a variable is missing, and when the key is wrong.
- [x] The 500 response body contains neither the URL, the key nor a stack trace.
- [x] `POST /api/health/supabase` answers 405.
- [x] `lib/supabase/client.ts` and `lib/supabase/server.ts` each export a `createClient` function and create the client inside it, not at module load.
- [x] `SUPABASE_DB_PASSWORD` appears in `.env.template`; `SUPASE_DB_PASSWORD` appears nowhere in the repo.
- [x] `.env.template` lists the two public variables with no real values, and `.env` is not tracked by git.
- [x] No service role key and no `SUPABASE_DB_PASSWORD` value appears in the client bundle or in any file tracked by git.
- [x] No page, component or `lib/` module other than the new ones imports from `lib/supabase/`.
- [x] The existing pages (`/`, `/library`, `/game/drop`, `/login`, `/about`, `/hall-of-fame`) render without new console errors, and `/login` still signs in with the local session.
- [x] `CLAUDE.md` documents `lib/supabase/`, the health route and the variables.

---

## Decisions

- **Yes:** this spec is only the connection: packages, clients, env vars and a health check. This was an explicit user decision ("only the Supabase integration, connect to the database, read the environment variables, nothing more"). It narrows the earlier "Auth + Scores" idea.
- **Yes:** `@supabase/supabase-js` plus `@supabase/ssr`, with a browser and a server client. The server needs to read the user from cookies later, and the same pattern serves Server Components, Route Handlers and Edge Functions. **No:** a single `createClient` from `supabase-js` with localStorage sessions, because the server would not see the user and it would need a rewrite when auth arrives.
- **Yes:** no `proxy.ts` in this spec. Its job is refreshing the auth cookie, and there is no auth yet. Adding it now would run on every request for no benefit.
- **Yes:** `GET /api/health/supabase` as the verification. It gives a boolean, `curl`-testable criterion. **No:** a script with no route, because the check should also prove the deployed app can reach Supabase. **No:** no verification, because "it connects" would not be verifiable.
- **Yes:** the health check uses the Auth health endpoint because the database has no tables yet. Once the first table exists, a later spec can switch it to a real query. **No:** creating a throwaway table only to test the connection.
- **Yes:** publishable key and URL as `NEXT_PUBLIC_*`. They are public by design and RLS gives the security. **No:** the service role key, which bypasses RLS and is not needed here.
- **Yes:** rename `SUPASE_DB_PASSWORD` to `SUPABASE_DB_PASSWORD` and keep it server only, reserved for the Supabase CLI. **No:** reading it in code, since `supabase-js` talks to the API, not to Postgres directly.
- **Yes:** factories create the client at call time, like SPEC 03 reads `RESEND_API_KEY` inside `POST`. A missing variable then does not break the build.
- **Deferred, already decided for the next specs (not part of this one):**
  - Auth: email + password. Sign in uses email; the username lives in a `profiles` table and is the display name. Email confirmation is on from the start (`/auth/confirm` callback). Google and GitHub buttons keep their notice. The session is read with `@supabase/ssr` cookies and `proxy.ts`, and `useSession()` stays as the client hook. Old non-guest local sessions are discarded; local scores are kept.
  - Guests: `GUEST` stays local in localStorage, including its scores. Only accounts write to Supabase.
  - Scores: direct insert from the client protected by RLS (`user_id = auth.uid()` plus range checks). A validating Route Handler was considered and discarded for now.
  - Migrations: SQL files in `supabase/migrations/`, versioned in git and applied with the Supabase MCP.
  - Realtime and Edge Functions: wanted later, each in its own spec.

---

## Risks

| Risk                                                                                 | Mitigation                                                                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| The health check only proves the Auth service and the key, not the Postgres database | Accepted while there are no tables. The first schema spec should swap it for a real query.                      |
| Anyone can call the public health endpoint, which makes a request to Supabase        | It takes no input, returns a fixed body and leaks nothing. Rate limiting is out of scope.                       |
| `NEXT_PUBLIC_*` values are inlined at build time, so editing `.env` needs a restart  | Documented in `CLAUDE.md`: restart `npm run dev` after editing `.env`, rebuild for production.                  |
| Next 16 `cookies()` is async and differs from older `@supabase/ssr` examples         | Step 4 reads `node_modules/next/dist/docs/` first and uses `await cookies()`.                                   |
| The publishable key is committed by mistake because it "looks harmless"              | `.env` is git-ignored and only `.env.template` with empty values is tracked. An acceptance criterion checks it. |
| A client is created but never used, so the code looks dead                           | Intended. The auth and scores specs consume it. The health route is its only user for now.                      |
| Package versions change the `@supabase/ssr` cookie API                               | Step 1 pins the installed versions in `package-lock.json`; step 4 follows the docs for those versions.          |

---

## What is **not** in this spec

- Auth, profiles, email confirmation or `proxy.ts`.
- Scores or credits in the database.
- Tables, migrations or generated types.
- Realtime or Edge Functions.
- Google and GitHub OAuth.
- Any visible change to the app.

Each one of those, if it lands, goes in its own spec.
