# SPEC 08 — Save Asteroids scores to Supabase

> **Status:** Implemented
> **Depends on:** SPEC 04, SPEC 05, SPEC 06
> **Date:** 2026-10-19
> **Objective:** Let the player save a finished Asteroids game's score from the browser into the Supabase `scores` table under the typed name or `GUEST`, with Asteroids as the only game left in the catalog, in the `games` table and in the local scores, and the invented seed scores deleted.

---

## Why this spec exists

SPEC 06 made `/hall-of-fame` read the global top scores from Supabase, but left the table read-only and filled it with invented players. Nothing a player does reaches the database: `game-player.tsx` saves to localStorage only, so the Hall of Fame never shows a real game.

This spec connects the two for one game. The player finishes Asteroids, types a name (or leaves it empty to play as `GUEST`), and the score goes to `scores`. The invented seed rows are removed, so from here on the Hall of Fame holds only real scores.

By user decision the catalog also shrinks to Asteroids for now: the other eight games leave the `games` table, the static catalog `lib/games.ts` and the local scores, so the front shows only Asteroids. This also fixes which game the foreign key accepts: a score for any other game id can no longer be inserted.

There is still no real authentication (`lib/session.ts` is a localStorage stand-in), so the browser writes with the public key. The protection is a narrow RLS `insert` policy and column-level grants. That keeps abuse bounded but does not make the ranking tamper-proof. Real identity (`user_id`, `auth.uid()`) is left to the auth spec, as decided in SPEC 04 and SPEC 06.

---

## Scope

**In:**

- A migration `supabase/migrations/<timestamp>_save_scores.sql` that:
  - deletes every row of `public.scores` (all of them are the SPEC 06 seed),
  - deletes the other eight rows of `public.games`, so only `asteroids` stays,
  - limits what `anon` and `authenticated` can insert, with column grants,
  - adds an `insert` policy on `public.scores` with value checks.
- A second migration `supabase/migrations/<timestamp>_least_privilege_grants.sql` that revokes every privilege of `anon` and `authenticated` on `games` and `scores` and grants back only what the app uses: `select` on both tables, and `insert` on `game_id`, `player` and `score` of `scores`.
- Apply both migrations to the Supabase project with `apply_migration`.
- `lib/games.ts`: `GAMES` keeps only the `asteroids` entry.
- `lib/games-archive.ts` (new): `ARCHIVED_GAMES` keeps the eight removed entries as data, unchanged, so a game can come back later. Nothing imports it.
- `purgeRemovedGameScores` in `lib/scores.ts`: removes the localStorage keys `arcade-vault:scores:<id>` of every id that is not in `GAMES`. It runs once per page load from `components/ui/navbar.tsx`.
- The landing games rail (`app/_home/games-rail.tsx`) stops showing `+0 more in the vault` when there is nothing more to show.
- A CSS rule in `app/globals.css` so the big tile of the landing rail fills the row when it is the only game. Found in step 8: without it the tile collapsed to a 14 px strip, because the square tiles that gave the grid its height are gone.
- `submitScore` in `lib/leaderboard.ts`: inserts one score into `scores` from the browser and never throws.
- `toScoreRow` in `lib/leaderboard.ts`: pure function that normalizes the input before the insert.
- `app/game/[id]/play/game-player.tsx` calls `submitScore` after the existing local `saveScore`, with saving, success and failure states.
- Tests: `toScoreRow`, the `submitScore` failure path, `purgeRemovedGameScores`, and the update of the seed-versus-`GAMES` test in `lib/leaderboard.test.ts`.
- Update `CLAUDE.md` (one game, the Hall of Fame is no longer read-only, the new policy, the seed is gone).

**Out of scope (for future specs):**

- Supabase Auth, `profiles`, `user_id` on `scores`, `auth.uid()` in policies and `proxy.ts`. The name is still free text.
- Making the ranking tamper-proof: a person who calls the REST API directly can still send an invented score within the allowed limits.
- Rate limiting, captchas, per-game score caps and duplicate detection.
- A Route Handler, the service role key or Edge Functions for writing.
- `update` and `delete` on `scores`, editing or removing a submitted score.
- Retrying a failed submission, an offline queue, or showing a "pending" score.
- Moving `/library`, `/game/[id]` and the landing to global scores. They keep reading the local `useScores`.
- Bringing back the other eight games. When one returns, it needs its catalog entry and a migration that inserts its `games` row.
- Deleting the files of the removed games: `public/games/<id>/` (for `brick-buster`, `drop` and `rocks`), their `readers` in `public/games/bridge.js` and their `av-cover-<id>` rules. They stay on disk, unreachable, so a game can come back without redoing it.
- Changes to the bridge protocol, `CATEGORIES`, `lib/credits.ts`, `lib/session.ts` and the static marketing copy of the landing (`app/_home/stats.tsx`).
- Bringing back any fake or demo data.

---

## Data model

No new tables or columns. `public.scores` stays as SPEC 06 created it:

```sql
-- id uuid pk default gen_random_uuid(), game_id text fk games(id) on delete cascade, player text 1..20 chars,
-- score integer >= 0, created_at timestamptz default now()
```

Migration contents (described, not final SQL):

```sql
-- 1. The seed is invented data: remove every score.
delete from public.scores;

-- 2. Only Asteroids stays in the catalog table. The other rows go (their scores are already gone).
delete from public.games where id <> 'asteroids';

-- 3. The browser may set only these three columns. id and created_at always come from the defaults,
--    so a client cannot choose its own date or id.
revoke insert on public.scores from anon, authenticated;
grant  insert (game_id, player, score) on public.scores to anon, authenticated;

-- 4. Insert policy with value checks. Still no update or delete policy.
create policy "anyone can submit a score" on public.scores
  for insert to anon, authenticated
  with check (
    char_length(btrim(player)) between 1 and 20
    and score between 0 and 9999999
  );
```

The existing table constraints (`char_length(player) between 1 and 20`, `score >= 0`, the FK on `game_id`) keep running as well. The FK means only `asteroids` can receive a score, because it is the only row left in `games`. The policy adds the upper bound on `score` and rejects a name made only of spaces.

Least-privilege grants (second migration, `<timestamp>_least_privilege_grants.sql`). Supabase gives `anon` and `authenticated` every privilege on new public tables and leaves RLS as the only limit, which is fragile: `TRUNCATE`, for example, ignores RLS. The migration revokes everything and grants back only what the app uses:

```sql
revoke all on public.games from anon, authenticated;
grant select on public.games to anon, authenticated;

revoke all on public.scores from anon, authenticated;
grant select on public.scores to anon, authenticated;
grant insert (game_id, player, score) on public.scores to anon, authenticated;
```

The `revoke insert` and the column `grant` of the first migration are kept as they were (it is already applied and committed); this one makes the final state explicit. After it, `update`, `delete`, `truncate`, `references` and `trigger` are not granted to the public roles at all, so a call to the REST API fails with `permission denied` (401) instead of relying on RLS to hide rows.

Catalog (`lib/games.ts`): `GAMES` is reduced to the existing `asteroids` entry, unchanged. The other eight entries move, unchanged, to `ARCHIVED_GAMES` in `lib/games-archive.ts` (`Game[]`, same type). That module is imported by nobody except its test, so the archived games are not listed, not playable, not in `CATEGORIES` and not in the `games` table. To bring one back: move its entry to `GAMES`, add a migration that inserts its `games` row, and, if it is playable, check its folder, its `readers` entry and its `av-cover-<id>` rule. `getGame` keeps working, so `/game/<other-id>` and `/game/<other-id>/play` now show the not-found screen like any unknown id.

Local scores (`lib/scores.ts`):

```ts
/** Removes the localStorage score lists of games that are not in GAMES anymore. Safe when storage is blocked. */
export function purgeRemovedGameScores(): void;
```

It looks at every key that starts with `arcade-vault:scores:`, and removes it when the part after the prefix is not an id in `GAMES`. The key of `asteroids`, the session and the credits are never touched. It never throws.

Client contract (`lib/leaderboard.ts`):

```ts
export interface ScoreInput {
  gameId: string;
  player: string;
  score: number;
}

/** What goes into the insert, or null when the input cannot be a valid score. Pure, unit tested. */
export function toScoreRow(
  input: ScoreInput,
): { game_id: string; player: string; score: number } | null;

/** Inserts one score. Never throws: resolves true when saved, false on any failure. */
export async function submitScore(input: ScoreInput): Promise<boolean>;
```

`toScoreRow` rules: trim `player` and cut it to 20 characters; return `null` when the trimmed name is empty, or when `score` is not a finite integer between 0 and 9,999,999. `submitScore` calls `createClient()` from `lib/supabase/client.ts` and runs `from("scores").insert(row)` with no `.select()`, so it needs only the insert policy and does not read rows back. It logs failures with `console.error` and returns `false`.

Flow in `game-player.tsx` (`submit`):

1. Build `playerName` as today (signed-in name, or typed name uppercased and cut to 12, or `GUEST`).
2. Save locally with `saveScore`, as today. This always runs first, so a score is never lost.
3. Call `submitScore({ gameId: game.id, player: playerName, score: finalScore })`.
4. Show the result.

States after pressing save:

| State  | What the user sees                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------- |
| Saving | The save button shows `SAVING…` and is disabled, so a second click cannot send a duplicate.                       |
| Saved  | The existing `SCORE SAVED` message, with the line that the score is on the global leaderboard.                    |
| Failed | An `[ERR]` line: `Saved on this device only. The global leaderboard could not be reached.` No retry in this spec. |

The existing local `volatile` warning (localStorage blocked) is kept as is and can appear next to the global result.

Test of the seed (`lib/leaderboard.test.ts`): the SPEC 06 migration still inserts nine `games` rows. The test now applies the `delete from public.games where id <> '<id>'` statement of the later migration, so it compares `GAMES` with the rows that remain. It fails when a `GAMES` id is missing from the table, or when the table keeps a game that is not in `GAMES`.

Conventions:

- `NEXT_PUBLIC_*` variables only. No service role key.
- The local `saveScore` stays the first step and its signature is unchanged.
- The migration is applied with the Supabase MCP, and the same SQL is committed. The file name uses the version that Supabase assigns (check `list_migrations`), as in SPEC 06. The SPEC 06 migration is not edited.
- Test rows created while verifying the policy are deleted right away, so the table ends the spec with only real scores.

File layout:

```
supabase/migrations/<timestamp>_save_scores.sql       delete seed scores and the other games, column grants, insert policy (new)
supabase/migrations/<timestamp>_least_privilege_grants.sql   revoke all and grant back select and the three insert columns (new)
lib/games.ts                                           GAMES keeps only asteroids
lib/games-archive.ts                                   ARCHIVED_GAMES: the eight removed entries, unused (new)
lib/games.test.ts                                      tests for ARCHIVED_GAMES
lib/scores.ts                                          adds purgeRemovedGameScores
lib/scores.test.ts                                     test for purgeRemovedGameScores
lib/leaderboard.ts                                     adds toScoreRow, submitScore
lib/leaderboard.test.ts                                tests for toScoreRow and submitScore, updated seed test
components/ui/navbar.tsx                               calls purgeRemovedGameScores once on load
app/_home/games-rail.tsx                               hides "+N more" when N is 0
app/globals.css                                         the big landing tile fills the row when it is alone
app/game/[id]/play/game-player.tsx                     calls submitScore after saveScore, adds states
CLAUDE.md                                              documents the above
```

---

## Implementation plan

1. **Inspect before deleting.** With `execute_sql`, count the rows of `scores` and `games`, list the distinct players of `scores`, and read the grants and policies on `scores`. Manual test: `scores` has 40 rows, every player name is one of the SPEC 06 seed names, and `games` has the nine rows. If anything else is there, stop and report instead of deleting.
2. **Migration.** Create `supabase/migrations/<timestamp>_save_scores.sql` with the four parts from the data model, and apply it with `apply_migration`. Then rename the file to the version that `list_migrations` reports. Manual test: `scores` has 0 rows, `games` has exactly one row (`asteroids`), and `get_advisors` (security) shows no new warning about `games` or `scores`. Then create `supabase/migrations/<timestamp>_least_privilege_grants.sql`, apply it the same way and rename it too. Manual test (second migration): `anon` and `authenticated` have only `SELECT` on `games`, and `SELECT` plus `INSERT` on `game_id`, `player` and `score` of `scores`; reading with the public key still answers 200.
3. **Verify the policy with the public key.** With `curl` against `…/rest/v1/scores`. Manual test: a valid insert for `asteroids` answers 201; each of these is rejected (401, 403 or 400): a valid insert for `drop` (FK), empty name, name of only spaces, 21-character name, negative score, score above 9,999,999, unknown `game_id`, a body that sets `created_at` or `id`; `PATCH` and `DELETE` change no row. Delete the valid test row with `execute_sql` afterwards and check the table is empty.
4. **Shrink the catalog.** Move the other eight entries from `GAMES` to `ARCHIVED_GAMES` in the new `lib/games-archive.ts`, so `GAMES` in `lib/games.ts` keeps only `asteroids`, and hide `+N more in the vault` in `app/_home/games-rail.tsx` when N is 0. Manual test: `/library` lists only Asteroids, `/game/drop` shows the not-found screen, and `/game/asteroids` and `/game/asteroids/play` work. `npm test` fails only in the seed test, which step 5 updates.
5. **Local purge and tests.** Add `purgeRemovedGameScores` to `lib/scores.ts` with its test, call it once from `components/ui/navbar.tsx`, and update the seed test in `lib/leaderboard.test.ts` as described. Manual test: with `arcade-vault:scores:drop` set by hand in the browser, a page load removes it and keeps `arcade-vault:scores:asteroids`, the session and the credits. `npm test` passes.
6. **Client functions with tests.** Add `toScoreRow` and `submitScore` to `lib/leaderboard.ts`, and tests to `lib/leaderboard.test.ts`. Cases: trimming, cutting to 20 characters, empty name, non-integer, negative, too large and `NaN` scores; `submitScore` resolves `false` (does not throw) when the client throws. Manual test: `npm test` passes.
7. **Wire the player.** Update `submit` in `game-player.tsx` with the three states. Read `node_modules/next/dist/docs/` for anything Next-specific first, as `AGENTS.md` requires. Manual test: play Asteroids until game over, type a name and save; `SAVING…` shows and then the saved message.
8. **End-to-end check.** Manual test: the saved score is in `scores` (check with `execute_sql`), `/hall-of-fame` shows it under Asteroids, and saving with an empty name stores `GUEST`. With the network blocked, the local score still saves and the `[ERR]` line shows. Check `/`, `/library`, `/game/asteroids`, `/hall-of-fame`, `/about` and `/login` for layout problems and console errors with a one-game catalog. Delete the test rows from `scores` afterwards.
9. **Docs.** Update `CLAUDE.md`: one game in the catalog, the Hall of Fame is global and fed by `submitScore`, the insert policy and the column grants, the seed removal, the local purge, and the removed games' files that stay on disk.

---

## Acceptance criteria

- [x] `npm run lint`, `npm test` and `npm run build` finish without errors, also with the Supabase variables unset.
- [x] `supabase/migrations/` has the two new migrations for this spec (`save_scores` and `least_privilege_grants`), and `list_migrations` shows the same names as applied.
- [x] `anon` and `authenticated` have only `SELECT` on `games`, and only `SELECT` plus `INSERT` on `game_id`, `player` and `score` of `scores`: no `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` or `TRIGGER`.
- [x] After the migration `public.scores` had 0 rows, and `public.games` has exactly one row, with `id = 'asteroids'`.
- [x] No invented seed score is left in `scores` at the end of the spec: every row comes from a real game played in the app.
- [x] `GAMES` has exactly one entry, `asteroids`, unchanged.
- [x] `ARCHIVED_GAMES` in `lib/games-archive.ts` has the eight removed entries with their original data, none of its ids is in `GAMES`, and the playable ones (`brick-buster`, `drop`, `rocks`) still have their files under `public/games/`. Nothing imports it except its test.
- [x] `/library` lists only Asteroids, and the category filter and the search still work without errors.
- [x] `/game/brick-buster`, `/game/drop`, `/game/rocks`, `/game/serpent` and their `/play` routes show the not-found screen. `/game/asteroids` and `/game/asteroids/play` work as before.
- [x] `/hall-of-fame` shows a single tab, `Asteroids`, with its podium and list from Supabase.
- [x] The landing renders with one game, shows no `+0 more in the vault`, and has no layout or console errors.
- [x] After loading any page, the localStorage keys `arcade-vault:scores:<id>` of the removed games are gone, and `arcade-vault:scores:asteroids`, `arcade-vault:session` and `arcade-vault:credits` are untouched.
- [x] With the publishable key, an insert for `asteroids` with `game_id`, `player` and `score` within the limits answers 201.
- [x] With the publishable key, an insert is rejected for: a game other than `asteroids`, an empty name, a name of only spaces, a 21-character name, a negative score, a score above 9,999,999 and an unknown `game_id`.
- [x] With the publishable key, an insert that sets `created_at` or `id` is rejected.
- [x] With the publishable key, `PATCH` and `DELETE` on `scores` and `games`, and `POST` on `games`, are rejected with `permission denied` (401).
- [x] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [x] After a game over, saving with a typed name stores that name (uppercased and cut to 12) in `scores` with `game_id = 'asteroids'` and the right score.
- [x] After a game over, saving with an empty name stores `GUEST`.
- [x] The save button shows `SAVING…`, is disabled while the request runs, and one press creates exactly one row.
- [x] The saved score appears in `/hall-of-fame` under Asteroids, in the right position.
- [x] The local score is still saved in `arcade-vault:scores:asteroids` and still appears in `/library`, `/game/asteroids` and the landing.
- [x] With the network blocked, the local score is saved, the `[ERR]` line shows and the page does not break.
- [x] `toScoreRow` returns `null` for an empty name, a non-integer, a negative, a too large and a `NaN` score, and `submitScore` resolves `false` instead of throwing.
- [x] `lib/leaderboard.test.ts` compares `GAMES` with the rows left in `games` after the migrations, and fails when they differ.
- [x] The SPEC 06 migration file is unchanged, and the files under `public/games/` are unchanged (`git diff` is empty for them).
- [x] `lib/credits.ts`, `lib/session.ts` and `app/hall-of-fame/` have no edits (`git diff` is empty for them).
- [x] No service role key and no `SUPABASE_DB_PASSWORD` value appears in the client bundle or in any file tracked by git.
- [x] `CLAUDE.md` documents the one-game catalog, `submitScore`, the insert policy, the local purge and that the seed was removed.

---

## Decisions

- **Yes:** the browser inserts directly into `scores` with the public key and a narrow RLS policy (user decision). **No:** waiting for real auth, because it does not give the user what they asked for now. **No:** a Route Handler with the service role key, which SPEC 04 kept out and which would still not give identity.
- **Yes:** save every submission, with the typed name or `GUEST` (user decision). **No:** only "accounts", because the session is a localStorage stand-in and the server cannot tell an account from a guest.
- **Yes:** write both to localStorage and to Supabase (user decision). The local copy keeps `/library`, `/game/asteroids` and the landing working untouched, and a failed request never loses the score. **No:** Supabase only, which would empty those pages unless they were migrated, and that is its own spec.
- **Yes:** delete every row of `scores` in a versioned migration (user decision). All 40 rows are the SPEC 06 seed and nothing else could write to the table. Step 1 checks that before deleting. **No:** deleting by name, which is fragile and only useful if real scores were mixed in.
- **Yes:** only Asteroids stays, in the `games` table and in the front (user decision). The user wants the product to show one game for now. The foreign key then also keeps scores for other games out. **No:** keeping the other eight in `games` and hiding them in the UI, which leaves rows that nothing uses.
- **Yes:** shrink `lib/games.ts` as well as the table, so the catalog and the table cannot disagree. The test keeps them in sync. **No:** a hidden flag on each game, which adds a concept for something temporary. The removed entries are not lost: they are kept in `lib/games-archive.ts` (user decision: "no borres esa información, manténlos en el código").
- **Yes:** keep the removed games as typed data in `lib/games-archive.ts`, with the steps to bring one back written in the file. It costs one unused file and a test, and restoring a game becomes a move plus a migration. **No:** relying on git history only, which is harder to find. **No:** a flag such as `hidden: true` inside `GAMES`, because `GAMES` feeds the library, the landing, `CATEGORIES`, the Hall of Fame tabs and the local score reads, and every one would need a filter.
- **Yes:** fix the landing rail with a CSS rule scoped to the lone-tile case (`.av-home-tile-big:first-child:nth-last-child(2)`: the big tile is the first child and only the "view all" tile follows). With five or more games nothing changes. It was found while verifying step 8, and the acceptance criterion "no layout errors" needs it. **No:** changing the rail component or its markup, and **No:** redesigning the landing for one game, which is a later decision.
- **Yes:** the files of the removed games stay on disk (`public/games/<id>/`, bridge readers, `av-cover-<id>` CSS). They are unreachable, harmless, and a game can come back by restoring its entry and adding a migration. **No:** deleting them now, because it was not asked and it makes bringing a game back much more work.
- **Yes:** purge the local scores of removed games with a function that runs on load (user decision: "borra del local storage"). A repo change cannot reach every visitor's browser any other way. It only removes keys of ids that are not in `GAMES`. **No:** deleting the whole `arcade-vault:` namespace, which would also drop the session, the credits and the Asteroids scores.
- **Yes:** the SPEC 06 migration is not edited. It is already applied and committed, and history stays true. The new migration deletes the rows. The seed test applies that delete when it compares the table with `GAMES`.
- **Yes:** column-level `grant insert (game_id, player, score)` instead of letting the client set every column. A client then cannot choose `created_at` or `id`, which would let it forge dates. **No:** a plain insert policy, which would allow forged dates.
- **Yes:** least privilege (user decision, "aplica sobre el revoke la mejor práctica"): revoke every privilege of the public roles and grant back only `select` on `games` and `scores`, and `insert` on three columns of `scores`. RLS alone is a single layer, and `TRUNCATE` is not covered by it. **No:** editing the already applied `save_scores` migration: a second migration keeps history true and the applied state matches the files. **No:** also revoking from `service_role` or `postgres`, which the app does not use and the platform needs.
- **Yes:** an upper bound of 9,999,999 on `score`, generous on purpose. It stops absurd values (such as `2147483647`) without knowing the real range. It is not an anti-cheat measure. **No:** per-game caps, which need real play data that does not exist yet.
- **Yes:** `toScoreRow` and `submitScore` live in `lib/leaderboard.ts`, next to the global read. **No:** `lib/scores.ts`, which is the localStorage module and carries the `BACKEND:` swap comments with stable signatures. The purge is the exception, because it manages localStorage keys.
- **Yes:** `submitScore` never throws and returns a boolean, like `fetchTopScores` returns a result. The player only needs to know whether to show the error line.
- **Yes:** on failure show a message and keep the local score; no retry in this spec (proposed default, easy to change in review). A retry would also need to avoid saving the local copy twice. **No:** an offline queue.
- **Yes:** the save button is disabled while saving, so a double click cannot insert two rows.
- **Yes:** this spec accepts that the ranking is forgeable until the auth spec lands. Any score a person can send is bounded by the policy.

---

## Risks

| Risk                                                                                               | Mitigation                                                                                                               |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Anyone can call the REST API and insert an invented score, or fill the ranking with spam.          | Accepted until the auth spec. The policy and column grants bound each row. Rate limiting is out of scope.                |
| The migration deletes data and cannot be undone.                                                   | Step 1 checks the 40 rows are exactly the seed and that `games` is the known catalog. Both can be recreated from git.    |
| The purge removes a visitor's local scores for the removed games for good.                         | It is what the user asked for. It only touches keys of ids not in `GAMES`, never Asteroids, the session or the credits.  |
| The landing, the About page and the library look empty or odd with a single game.                  | Step 8 checks every page with one game. The `+0 more` line is fixed in this spec. Static marketing copy is out of scope. |
| `CATEGORIES` shrinks with the catalog: it is built from `GAMES`, so it is now `All` and `Shooter`. | Accepted and better than an empty filter. The categories come back by themselves when games return.                      |
| A policy or grant typo leaves `scores` writable too widely, or not writable at all.                | Step 3 and the acceptance criteria test every accepted and rejected case with the public key, and `get_advisors`.        |
| The seed test and the migration drift apart when a game returns.                                   | The test compares `GAMES` with the table after all migrations, so a missing insert migration fails the test.             |
| The request is slow and the player thinks the save did nothing.                                    | `SAVING…` shows while it runs and the button is disabled.                                                                |
| The score is saved locally but not globally, so the two sources differ for that player.            | The `[ERR]` line says it was saved on this device only. A retry belongs to a later spec.                                 |
| A signed-in name from the local session is longer than 20 characters.                              | `toScoreRow` cuts it to 20 before the insert, so the table constraint is not hit.                                        |
| Test rows created while verifying stay in the table.                                               | Steps 3 and 8 delete them, and an acceptance criterion checks the table only has real scores at the end.                 |

---

## What is **not** in this spec

- Authentication, `user_id` or a tamper-proof ranking.
- Rate limiting, caps per game or duplicate detection.
- A Route Handler, the service role key or Edge Functions.
- Update or delete of scores, retries or an offline queue.
- Moving `/library`, `/game/[id]` or the landing to global scores.
- Bringing back the other eight games, or deleting their files on disk.
- Changes to the bridge, `CATEGORIES`, credits, session or the marketing copy of the landing.

Each one of those, if it lands, goes in its own spec.
