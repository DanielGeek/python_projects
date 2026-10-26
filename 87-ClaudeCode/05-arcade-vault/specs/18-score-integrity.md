# SPEC 18 — Score integrity: per-game maximum and insert rate limit

> **Status:** Approved
> **Depends on:** SPEC 06, SPEC 08, SPEC 15, SPEC 17
> **Date:** 2026-10-25
> **Objective:** Make the database reject scores above a per-game maximum and inserts that come too fast from one account or one guest IP, so a caller of the REST API can no longer flood or forge the Hall of Fame.

---

## Why this spec exists

A Claude Security scan of the authentication surface (2026-10-26, local report folder `CLAUDE-SECURITY-20261026-021307/`, git-ignored) found one issue that survived a three-lens verification panel, finding F1 (LOW, confidence medium). Scores are sent by the browser, and the Supabase publishable key is public by design. The insert policies on `public.scores` (SPEC 15) check only `user_id`, `player` and `score between 0 and 9999999`. Anyone can POST to `/rest/v1/scores` in a loop and fill the top 50 of every game with `9999999`. Nothing limits how many rows one caller inserts, so the table can also grow without bound.

SPEC 15 documents the guest case as accepted: `anon` can already save a `GUEST` score. This spec narrows that risk without changing the product. Guests keep scoring in the global Hall of Fame; they just do it inside limits.

The full fix is a server route that validates the run and inserts with a service role key. That needs a new secret and a different write path, so it is a later spec. This one stays inside the database and RLS, which SPEC 17 names as the real protection.

The scan's two rejected candidates are not part of this spec: the `Cache-Control` header dropped by `setAll` in `lib/supabase/proxy.ts` (0 of 3 votes) and the missing app-level throttle on password sign-in (known gap in `CLAUDE.md`, owned by Supabase).

---

## Scope

**In:**

- Migration `supabase/migrations/<version>_score_max_per_game.sql`: adds `games.max_score`, fills it for the five games in the catalog and makes it `not null`. It also replaces the two insert policies on `scores` so a score above the game's `max_score` is rejected.
- Migration `supabase/migrations/<version>_score_rate_limit.sql`: a private table `public.score_attempts` and a `before insert` trigger on `scores` that rejects an insert when the caller has sent too many scores in the last minute or the last hour.
- A one-time probe to find which request header carries the real client IP on this Supabase project, recorded in the migration's comments.
- A one-time check with `execute_sql` for existing rows above the new maximum. The result is reported, not deleted.
- Tests that read the migrations: the new table has RLS on (`lib/rls.test.ts` already does this), the `games` table the tests rebuild includes `max_score`, and the trigger and policies exist.
- `references/implemented-games.md`: a `Max score` column per game.
- Update `CLAUDE.md` (migrations paragraph and `leaderboard.ts` paragraph) and `references/security/security-audit.md`.

**Out of scope (for future specs):**

- A server route `POST /api/scores` or an Edge Function that validates the run, with a service role key and no direct insert from the browser. This is the planned next phase.
- Run tokens, replay validation or any proof that the score was really earned. A caller can still post a score below `max_score`.
- Showing guest scores apart from the global Hall of Fame.
- CAPTCHA, MFA or a rate limit on password sign-in.
- Moving the credit counter (`lib/credits.ts`) to the server.
- A distinct error message in the final-score modal for a rate-limited insert. The existing `[ERR]` line is enough.

---

## Data model

New column on `games`:

```sql
alter table public.games add column max_score integer not null check (max_score > 0);
```

`max_score` is the highest score a realistic run of that game can produce, with margin (rule in Decisions). It never exceeds 9,999,999, the bound that `scores.score` already has.

Policy change on `scores` (both insert policies keep their current checks and add one line):

```sql
and score <= (select max_score from public.games where id = game_id)
```

New private table that holds the recent inserts, one row per accepted score:

```sql
create table public.score_attempts (
  id         bigint generated always as identity primary key,
  subject    text not null,                       -- 'u:<user uuid>' for an account, 'ip:<address>' for a guest
  created_at timestamptz not null default now()
);
create index score_attempts_subject_idx on public.score_attempts (subject, created_at desc);
alter table public.score_attempts enable row level security;   -- no policies, no grants
revoke all on public.score_attempts from anon, authenticated;
```

Trigger function `public.limit_score_inserts()`, `security definer`, `set search_path = ''`:

```text
subject  = 'u:' || new.user_id            when new.user_id is not null
           'ip:' || <client ip>            otherwise ('ip:unknown' when no IP header is present)
steps    = take an advisory lock on the subject for the transaction
           delete rows older than 1 hour
           count rows of the subject in the last 60 seconds and in the last hour
           raise exception 'score rate limit exceeded' when 5 or more in 60 s, or 30 or more in 1 h
           insert the new attempt row, return new
```

Limits: 5 scores per 60 seconds and 30 per hour, for each subject. A rejected insert rolls back, so it does not count against the subject.

Client IP: `current_setting('request.headers', true)::json ->> '<header>'`. The header is chosen in step 1 (candidates: `cf-connecting-ip`, then the first address of `x-forwarded-for`).

`score_attempts` stores IP addresses, which are personal data. Rows live at most one hour, no role of the API can read them, and no other table links to them.

---

## Implementation plan

1. Find the client IP header. With `execute_sql`, create a throwaway function that returns `current_setting('request.headers', true)`, grant it to `anon`, call it through `/rest/v1/rpc/` with `curl` and the publishable key, read which header holds the real address, then drop the function. Nothing from this step is committed except the header name, noted for step 4.
2. Write `<version>_score_max_per_game.sql`. Read the scoring code in `public/games/<id>/game.js` for each of the five games, set `max_score` as the Decisions rule says, add the column as nullable, fill it, set `not null`, then replace the two insert policies. Apply with `apply_migration` and rename the file to the version Supabase assigns (check `list_migrations`). Manual test: a score saved from the browser in Asteroids still shows `SCORE SAVED`.
3. Update the test that rebuilds `games` from the migrations (`lib/leaderboard.test.ts`) so it understands the new column, and add `max_score` to `references/implemented-games.md`. `npm test` passes.
4. Write `<version>_score_rate_limit.sql` with the table, the index, the trigger function (with `revoke execute ... from public, anon, authenticated`, as SPEC 17 did for `rls_auto_enable`) and the trigger, using the header from step 1. Apply it the same way. Manual test: play three games in a row from the browser and all three save.
5. Add a test that reads the two new migrations and checks: `score_attempts` has `enable row level security`, the function is `security definer` with `set search_path = ''`, the policies mention `max_score`, and the trigger is `before insert on public.scores`. `npm test` passes.
6. Probe the live project with `curl` against `/rest/v1/scores`, as an anonymous caller and as a signed-in user: a score above `max_score`, six inserts within a minute, and a read of `/rest/v1/score_attempts`. Run `get_advisors` (security) and compare with the accepted warnings in `CLAUDE.md`. Run the `execute_sql` check for existing rows above the new maximum and report the count to the user.
7. Update `CLAUDE.md`, `references/security/security-audit.md` and, if the user wants to close the loop, re-run the Claude Security scan on the same scope.

---

## Acceptance criteria

- [ ] `select id, max_score from public.games` returns five rows and no `max_score` is null.
- [ ] No `max_score` is above 9,999,999 or below the highest score the game can produce in a normal run (documented per game in `references/implemented-games.md`).
- [ ] An anonymous `POST /rest/v1/scores` with `score = max_score + 1` for that game is rejected with a row-level security error.
- [ ] A signed-in `POST /rest/v1/scores` with `score = max_score + 1` is rejected the same way.
- [ ] A guest sending six valid scores in 60 seconds from one IP gets the first five accepted and the sixth rejected with `score rate limit exceeded`.
- [ ] A signed-in user sending six valid scores in 60 seconds gets the sixth rejected the same way, and a second user in the same minute is not affected.
- [ ] After 60 seconds, the same guest or user can insert again.
- [ ] A guest from another IP is not affected by the limit of the first one.
- [ ] `GET /rest/v1/score_attempts` with the publishable key returns an error and no rows.
- [ ] `select count(*) from public.score_attempts where created_at < now() - interval '1 hour'` returns 0 after an insert.
- [ ] `rls_auto_enable`-style check: `limit_score_inserts()` cannot be called as `/rest/v1/rpc/limit_score_inserts` (answers 401 or 404).
- [ ] Playing a game in the browser and saving its score still shows `SCORE SAVED`, for an account and for a guest.
- [ ] `get_advisors` (security) shows no warning other than the three accepted in `CLAUDE.md`.
- [ ] `npm test`, `npm run lint` and `npm run build` pass.
- [ ] The check for existing rows above the new `max_score` ran and its count was reported to the user.
- [ ] `CLAUDE.md` and `references/security/security-audit.md` mention SPEC 18.

---

## Decisions

- **Yes:** database only in this spec, server route later. SPEC 17 already says RLS is what protects data, and a server route needs a service role key that the project does not have. Phasing keeps this spec small and each step shippable.
- **No:** a server route in this spec. Stronger, but it needs a new secret, revoking the insert from `anon` and `authenticated`, and a change in `lib/leaderboard.ts` and the player. That is its own spec.
- **Yes:** limit by user for accounts and by IP for guests. It is fairer than a global guest quota, which one attacker could exhaust to block honest guests.
- **No:** a global cap for guests. It does not depend on the IP, but a single caller could use all of it.
- **Yes:** the IP comes from a request header read in the trigger. Step 1 picks the header by measuring it on this project, because a client can forge `x-forwarded-for` and the right header depends on what sits in front of the API.
- **Yes:** `games.max_score` as a `not null` column. A new game's migration cannot insert its row without it, so the rule cannot be forgotten. The value is the highest score a realistic run can produce, found by reading the game's scoring code, then multiplied by a margin of 2 and rounded up. It is a ceiling against absurd values, not an anti-cheat.
- **No:** one lower cap for every game. Too loose for the small-score games and too tight for the large ones.
- **No:** no per-game cap at all. The rate limit alone would let a caller post `9999999` five times a minute.
- **Yes:** guests stay in the global Hall of Fame, as SPEC 08 and SPEC 15 decided. Splitting them out changes `/hall-of-fame` and is not a security fix.
- **Yes:** two windows, 5 per 60 seconds and 30 per hour. A run takes longer than 12 seconds in every game, so honest players stay far below the first, and the second bounds table growth from one caller.
- **Yes:** a private table with no grants for the counters, deleted after one hour. A `client_ip` column on `scores` would be readable through the public `select` grant.
- **Yes:** an advisory lock per subject inside the trigger. Without it, parallel requests could pass the count together.
- **Yes:** check existing rows above the maximum and report them. **No:** delete them in this spec. Removing rows from a public leaderboard is the user's decision.

---

## Risks

| Risk                                                                                                 | Mitigation                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A forged score below `max_score` is still accepted, so the Hall of Fame can still be gamed.          | Documented as out of scope. The server-route spec with run validation is the real fix. This spec bounds the damage and the table growth.                |
| The IP header is missing or forgeable, so guests share one bucket (`ip:unknown`) or dodge the limit. | Step 1 measures the header on this project. With no IP the guest falls into one shared bucket, which can throttle honest guests but never opens a hole. |
| Guests behind one shared IP (school, café) hit the limit together.                                   | 5 per minute is far above what one player needs. The limit is two numbers in one migration if it must change.                                           |
| `max_score` is set too low and a real high score is refused.                                         | The 2x margin, and a per-game value recorded in `references/implemented-games.md`. A wrong value is fixed with one `update` migration.                  |
| IP addresses are personal data.                                                                      | One-hour retention, no API role can read the table, no link to any other table. The spec notes it for the privacy text of a future public release.      |
| The trigger adds a write to every insert.                                                            | One indexed insert and two indexed counts per score. A score is saved once per finished run, so the load is negligible.                                 |

---

## What is **not** in this spec

- A server route or Edge Function for scores, or a service role key (next phase, its own spec).
- Run tokens, replays or any proof that a score was earned.
- Removing guest scores from the global Hall of Fame.
- A rate limit or CAPTCHA on password sign-in, or the `Cache-Control` header in `lib/supabase/proxy.ts`.
- Deleting existing rows from `scores`.
- A new error message in the final-score modal.

Each of those, if it lands, goes in its own spec.
