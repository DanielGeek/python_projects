# SPEC 06 — Global leaderboard and games table

> **Status:** Approved
> **Depends on:** SPEC 04, SPEC 05
> **Date:** 2026-10-19
> **Objective:** Create the `games` and `scores` tables in Supabase, seeded and read-only, and make `/hall-of-fame` show the global top scores per game from them.

---

## Why this spec exists

SPEC 04 connected the app to Supabase but left the database empty on purpose. `/hall-of-fame` still reads per-device scores from localStorage, so there is no real ranking between players.

This spec lays the first schema and the first real read. It stays small by leaving writes out: without auth there is no safe way to insert scores (`user_id = auth.uid()` needs a user), and an anonymous insert policy would let anyone forge the ranking. The table is filled by a seed migration, and the games keep saving to localStorage until the auth and scores spec connects the two.

The decisions already taken in SPEC 04 apply: migrations are SQL files in `supabase/migrations/`, versioned in git and applied with the Supabase MCP; no service role key; guests stay local.

---

## Scope

**In:**

- Migration `supabase/migrations/<timestamp>_games_and_scores.sql` that creates the tables `games` and `scores`, enables RLS on both, adds `select`-only policies and seeds both tables.
- Apply the migration to the Supabase project `sxwaixbuvhubktrkktnx` with the MCP tool `apply_migration`.
- `lib/leaderboard.ts`: a function that reads the top scores of one game from Supabase and returns them as `ScoreEntry[]`.
- `app/hall-of-fame/hall-of-fame.tsx` reads from `lib/leaderboard.ts` instead of `useScores`, with loading, error and empty states.
- Tests: `lib/leaderboard.test.ts` for the row mapping, and a catalog check that every `GAMES` id exists in the seed.
- Switch `GET /api/health/supabase` from the Auth health endpoint to a real query on `games`, as SPEC 04 anticipated. See Decisions.
- Update `CLAUDE.md` (`lib/leaderboard.ts`, `supabase/`, the Hall of Fame data source, the health route).

**Out of scope (for future specs):**

- Writing scores to Supabase. The player, `saveScore` and `lib/scores.ts` are unchanged; the games keep saving to localStorage.
- Supabase Auth, `profiles`, `user_id` on `scores`, `proxy.ts` and any insert, update or delete policy.
- Moving `/library`, `/game/[id]`, the landing (`activity`, `stats`) or the Nav to global scores. They keep `useScores`, `useAllScores` and `latestScores`.
- Making the database the source of the catalog. `lib/games.ts` stays the source for the UI (see Decisions).
- A global ranking across games, period filters (today / week / all time) and "my rank" beyond what `Leaderboard` already highlights.
- Realtime, Edge Functions, generated TypeScript types and the service role key.
- Pagination or "load more" beyond the top 50.

---

## Data model

New tables, created by one migration. Names are lowercase `snake_case`.

```sql
create table public.games (
  id         text primary key,                 -- same as lib/games.ts, e.g. 'brick-buster'
  title      text not null,
  category   text not null,                    -- Arcade | Puzzle | Shooter | Versus
  accent     text not null,                    -- cyan | magenta | yellow | green
  created_at timestamptz not null default now()
);

create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  game_id    text not null references public.games (id) on delete cascade,
  player     text not null check (char_length(player) between 1 and 20),
  score      integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index scores_game_score_idx on public.scores (game_id, score desc);

alter table public.games  enable row level security;
alter table public.scores enable row level security;

create policy "games are public"  on public.games  for select to anon, authenticated using (true);
create policy "scores are public" on public.scores for select to anon, authenticated using (true);
-- No insert, update or delete policy: with RLS on, those operations are denied for anon and authenticated.
```

Seed (same migration):

- `games`: one row for each of the nine entries of `GAMES`, with the same `id`, `title`, `category` and `accent`. Playable and not playable games are all listed, so the FK is valid when the auth spec lets non-playable games appear.
- `scores`: around 10 rows for each of the four playable games (`brick-buster`, `drop`, `rocks`, `asteroids`), with invented player names of at most 20 characters and scores in plausible ranges for each game. No rows for the five games with `src: null`; their tab shows the empty state. `created_at` is spread over the last weeks.

Client contract (`lib/leaderboard.ts`):

```ts
import type { ScoreEntry } from "./scores";

export type LeaderboardResult = { ok: true; entries: ScoreEntry[] } | { ok: false };

/** Top 50 scores of a game, best first. Never throws: failures come back as { ok: false }. */
export async function fetchTopScores(gameId: string): Promise<LeaderboardResult>;

/** Maps a `scores` row to the shape the Leaderboard and Podium already use. Pure, unit tested. */
export function rowToEntry(row: { player: string; score: number; created_at: string }): ScoreEntry;
```

`ScoreEntry` is reused as is (`{ player, score, date }`), with `date = created_at`. `Leaderboard` and `Podium` keep their props.

Query: `from("scores").select("player, score, created_at").eq("game_id", gameId).order("score", { ascending: false }).limit(50)`, using `createClient()` from `lib/supabase/client.ts`.

Health route after this spec: `GET /api/health/supabase` runs `select id from games limit 1` through `createClient()` from `lib/supabase/server.ts`. It still answers `200 { ok: true }` or a generic `500 { ok: false, error }` with no URL, key or stack, and still answers 405 for other methods. The 5 s timeout stays.

Hall of Fame states:

| State   | What the user sees                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| Loading | The podium and the list in a skeleton or `LOADING...` line, with no layout shift. Shown on first load and on tab change. |
| Error   | An `[ERR]` line in the style of the contact form and a `Retry` button that calls the fetch again. No local fallback.     |
| Empty   | The existing empty rendering of `Podium` and `Leaderboard`, unchanged.                                                   |
| Data    | Podium (top 3) and the list, as today. The signed-in non-guest player is still highlighted by name.                      |

Conventions:

- Only `app/hall-of-fame/hall-of-fame.tsx` changes in the UI. It keeps the `Tabs`, the `key` on `Podium` and `Leaderboard` that replays the entrance, and the "Back to the library" button.
- A request for a tab that is no longer selected must not overwrite the current one (ignore stale responses when the user switches tabs fast).
- `personalBest` is computed from the fetched entries, as today.
- Guests are shown nowhere new: since nothing writes to the tables, global data contains only seed players.
- The seed names are invented. None of them is `GUEST`.
- SQL lives only in `supabase/migrations/`. The file name uses the timestamp returned or chosen when applying, so the git file and the applied migration match (`list_migrations` is the check).

File layout:

```
supabase/migrations/<timestamp>_games_and_scores.sql   schema, RLS, seed (new)
lib/leaderboard.ts                                     fetchTopScores, rowToEntry (new)
lib/leaderboard.test.ts                                rowToEntry tests, seed vs GAMES check (new)
app/hall-of-fame/hall-of-fame.tsx                      reads from fetchTopScores, adds states
app/api/health/supabase/route.ts                       query on games instead of /auth/v1/health
CLAUDE.md                                              documents the above
```

---

## Implementation plan

1. **Inspect the project.** With the MCP `list_tables` and `list_migrations`, confirm the project is still empty, as SPEC 04 left it. Manual test: both lists are empty. If not, stop and report instead of overwriting.
2. **Write the migration.** Create `supabase/migrations/<timestamp>_games_and_scores.sql` with the tables, index, RLS, policies and seed from the data model. Manual test: the file is valid SQL when read top to bottom, and has nine `games` rows and about forty `scores` rows.
3. **Apply it.** Run `apply_migration` with the same SQL. Then run `get_advisors` (security). Manual test: `list_tables` shows both tables with RLS on; `select count(*)` returns nine and the expected score count; the advisors report no "RLS disabled" or "policy missing" warnings for these tables.
4. **Verify RLS from the client key.** With the publishable key, `curl` the REST endpoint `…/rest/v1/scores?select=*&limit=1` (read) and then a `POST` with a valid body (insert). Manual test: read returns 200 with rows, insert returns 401 or 403.
5. **Client module with tests.** Create `lib/leaderboard.ts` and `lib/leaderboard.test.ts`. Tests: `rowToEntry` maps the three fields and keeps `created_at` as `date`; every `id` in `GAMES` appears in the migration's `games` insert (read the SQL file from the project root, naming the missing id in the failure message). Manual test: `npm test` passes, and the second test fails when a `GAMES` id is renamed temporarily.
6. **Hall of Fame wiring.** Update `hall-of-fame.tsx` to call `fetchTopScores` on tab change, with the four states and the stale-response guard. Read `node_modules/next/dist/docs/` for any Next-specific part first, as `AGENTS.md` requires. Manual test: `/hall-of-fame` shows seed data for `brick-buster`, `drop`, `rocks` and `asteroids`, the empty state for `serpent`, and switching tabs quickly ends on the last selected game.
7. **Error state.** Manual test: with the network blocked (or a wrong `NEXT_PUBLIC_SUPABASE_URL` and a restarted dev server), the page shows the `[ERR]` line and `Retry`; after restoring the connection, `Retry` loads the data without a page reload.
8. **Health route.** Switch the check to `select id from games limit 1` through the server client. Manual test with `curl`: 200 with valid variables; 500 with a wrong key or a missing variable; `POST` answers 405.
9. **Docs.** Update `CLAUDE.md`: `lib/leaderboard.ts`, `supabase/migrations/`, the Hall of Fame data source (global, read-only) and the new health check. Fix the sentence that says no module uses `lib/supabase/` yet.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors, also with the Supabase variables unset.
- [ ] `supabase/migrations/` contains one migration for this spec and `list_migrations` shows the same name as applied.
- [ ] The Supabase project has the tables `public.games` and `public.scores`, both with RLS enabled.
- [ ] `games` has exactly nine rows whose `id`, `title`, `category` and `accent` match `GAMES` in `lib/games.ts`.
- [ ] `scores` has rows only for `brick-buster`, `drop`, `rocks` and `asteroids`, each with at least 8 rows and all names of 1 to 20 characters.
- [ ] A `POST` to `…/rest/v1/scores` with the publishable key is rejected (401 or 403), and so are `PATCH` and `DELETE`.
- [ ] A `GET` to `…/rest/v1/scores` with the publishable key returns rows.
- [ ] `get_advisors` (security) reports no warning about RLS for `games` or `scores`.
- [ ] `/hall-of-fame` shows the podium and list for `brick-buster`, `drop`, `rocks` and `asteroids` from Supabase, ordered by score descending and limited to 50.
- [ ] The Hall of Fame data is the same in two browsers or two profiles, and does not change after playing a game and saving a local score.
- [ ] `/hall-of-fame` shows the existing empty rendering for `serpent`, `muncher`, `invaders`, `froggy` and `pixel-duel`.
- [ ] While a tab loads, the page shows a loading state and the layout does not jump when data arrives.
- [ ] When Supabase is unreachable, `/hall-of-fame` shows an `[ERR]` line and `Retry`, shows no localStorage scores, and `Retry` recovers without reloading.
- [ ] Switching tabs quickly never leaves the list of a different game than the selected tab.
- [ ] `lib/scores.ts`, `lib/credits.ts`, `lib/session.ts`, `app/game/` and `components/ui/game.tsx` have no edits (`git diff` is empty for them).
- [ ] `/library`, `/game/[id]` and the landing still show the local scores and render without new console errors.
- [ ] `GET /api/health/supabase` answers 200 `{ "ok": true }` with the real variables, a generic 500 with a wrong key or a missing variable, and 405 for `POST`. No response contains the URL, the key or a stack trace.
- [ ] No service role key and no `SUPABASE_DB_PASSWORD` value appears in the client bundle or in any file tracked by git.
- [ ] `lib/leaderboard.test.ts` passes and fails when a `GAMES` id is missing from the seed.
- [ ] `CLAUDE.md` documents `lib/leaderboard.ts`, `supabase/migrations/` and the global read-only Hall of Fame.

---

## Decisions

- **Yes:** Supabase as the home of the global leaderboard (user decision). **No:** localStorage only, which is not a ranking between players; **No:** a localStorage fallback when Supabase fails, because mixing device scores with global scores without telling the player gives a false ranking.
- **Yes:** the `games` table (user decision) so `scores` has a real FK and the database can be queried on its own. **No:** making the database the source of the catalog: `lib/games.ts` keeps `src`, covers, descriptions and controls, which are UI data. Moving it touches library, detail, landing and player and would be its own spec.
- **Yes:** `games` stores only `id`, `title`, `category` and `accent`. **No:** `src`, `description`, `difficulty`, `plays` or `tags`, which would be a second copy to keep in sync. The test that compares the seed with `GAMES` keeps the duplicated fields honest.
- **Yes:** read-only in this spec (user decision). With no auth there is no `auth.uid()`, and an anonymous insert policy would let anyone forge the ranking. **No:** anonymous insert with range checks, a half-measure that is replaced later. **No:** a validating Route Handler with the service role key, which SPEC 04 kept out.
- **Yes:** the tables are filled by a seed in the migration, with invented players. This makes the Hall of Fame verifiable today. The seed is clearly fake and the auth and scores spec decides whether to remove it.
- **Yes:** the `scores` table has no `user_id`. The auth spec adds it together with the RLS policies that use it, so this spec does not guess its shape.
- **Yes:** the scope is the top per game only (user decision). **No:** a global ranking across games, a period filter or "my rank". Each one deserves its own spec once real scores exist.
- **Yes:** only `/hall-of-fame` moves to global data (user decision). Library, detail and landing keep the local `useScores`. The two sources then differ on purpose until the scores spec replaces `lib/scores.ts` as a whole.
- **Yes:** on failure, an `[ERR]` line with `Retry`, in the style of the contact form (user decision).
- **Yes:** authentication goes in a separate spec (user decision, recommended). Doing it here would touch `profiles`, email confirmation, `proxy.ts` and `session.ts`, which is more than one spec.
- **Yes:** the browser client fetches from the Client Component. The page already is a Client Component with tabs, and the data is public. **No:** a Route Handler between the browser and Supabase, which adds a hop with nothing to protect.
- **Yes:** the health route now queries `games`, as SPEC 04 anticipated ("once the first table exists, a later spec can switch it to a real query"). This proves the database, not only the Auth service.
- **No:** generated TypeScript types. The tables are two and the client reads three columns, so `rowToEntry` types the row by hand. Types move in once the schema grows.
- **Yes:** the migration is applied with the Supabase MCP and the same SQL is committed, as SPEC 04 decided.

---

## Risks

| Risk                                                                                         | Mitigation                                                                                                            |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The migration runs against the real project and cannot be undone casually.                   | Step 1 checks the project is empty. Step 3 verifies row counts. A later migration can drop the tables if needed.      |
| `games` drifts from `lib/games.ts` when a game is added.                                     | The seed-vs-`GAMES` test fails on a missing id. Adding a game then needs a new migration, to document in `CLAUDE.md`. |
| Two sources of scores (global in the Hall of Fame, local elsewhere) confuse players.         | Accepted and temporary. A player's own game scores do not appear in the Hall of Fame until the scores spec lands.     |
| Fake seed players look like real data.                                                       | Names are plainly invented and the seed is documented in the migration comments and in `CLAUDE.md`.                   |
| RLS misconfigured leaves the tables writable by the public key.                              | Step 4 and an acceptance criterion try to insert, update and delete with the publishable key, plus `get_advisors`.    |
| A slow or failing request leaves a stale list on screen when the user switches tabs.         | The stale-response guard and the loading state, both in the acceptance criteria.                                      |
| The health route now depends on the table existing, so it fails if the migration is missing. | Intended: it proves the schema. The 500 stays generic and the log has the detail.                                     |
| The anonymous key can read all scores and call the API without the app.                      | Accepted: the data is public by design, and the policies expose only `select`.                                        |

---

## What is **not** in this spec

- Saving scores to Supabase or any write path.
- Auth, profiles, `user_id` or `proxy.ts`.
- Global scores in `/library`, `/game/[id]`, the landing or the Nav.
- The catalog moving from `lib/games.ts` to the database.
- A cross-game ranking, period filters or pagination.
- Realtime, Edge Functions, generated types or a service role key.

Each one of those, if it lands, goes in its own spec.
