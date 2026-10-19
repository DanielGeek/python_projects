# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a web platform for playing arcade games online and competing for the highest score. Built with spec-driven design (`/spec` and `/spec-impl` skills, installed via `npx skills@latest add Klerith/fernando-skills`). Specs and docs must be written in English. The UI copy and game data in `lib/games.ts` are in English.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm run format` — Prettier over the whole repo (config `.prettierrc.json`, ignores `.prettierignore`).
- `npm test` — Vitest, single run (`npm run test:watch` for watch mode). Tests sit next to the code as `*.test.ts` (e.g. `lib/contact.test.ts`); import `describe/it/expect` from `"vitest"`.
- Format hook: `.claude/hooks/format.sh` runs as a `PostToolUse` hook (`Write|Edit`, in `.claude/settings.json`). It runs Prettier on the written file, then `eslint --fix` for `.ts/.tsx/.js/.jsx/.mjs/.cjs`. Remaining ESLint errors exit 2 so Claude sees them. Skips `public/games/`, `references/`, `.claude/` and build output.

## Next.js version warning

Next 16.4.1 / React 19.3 / Tailwind 4 (`@tailwindcss/turbopack`). APIs differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`) before writing Next-specific code (see `AGENTS.md`). Path alias `@/*` maps to the project root.

## Architecture

- `app/` — App Router. Routes: `/` (landing), `/library` (game library), `/game/[id]` (detail), `/game/[id]/play` (player), `/about` (About + contact form), `/login`, `/hall-of-fame`, plus the API route `POST /api/contact`. Anything that means "back to the library" links to `/library`; the logo links to `/`.
- `app/_home/` — landing sections, one file each: `hero`, `features`, `games-rail`, `stats`, `activity`, `pricing`, `final-cta`, plus `silhouettes`, `section-head` and `reveal` (client wrapper that fades a section in once, using `IntersectionObserver`). `hero` and `pricing` read `useSession` to hide "Create account" and turn "Start free" into "Play now". `stats` and `pricing` are static marketing copy; `activity` shows real scores. The `_` prefix keeps the folder out of routing. Landing CSS is `av-home-*` in `app/globals.css`, ported from `references/templates/home-about/`. `games-rail` shows the first five games, hides the `+N more` line when there are none, and its big tile fills the row when it is the only game.
- `app/about/` — About page: `highlights`, `divider` and `contact-form` (client; `ContactSection` validates with `validateContact`, posts JSON to `/api/contact`, shows the `[ERR]` line on failure and the `VAULT-OS // TERMINAL` screen on success). It reuses `Reveal` from `app/_home/`. CSS is `av-about-*` in `app/globals.css`, ported from `references/templates/home-about/`.
- `app/api/contact/route.ts` — `POST` Route Handler that emails the contact form through Resend. Order: parse JSON (400), honeypot field `website` (200, no email), `validateContact` (400 with `fieldErrors`), env check (500), Resend send (502 on error). `from`, `to` and the key come only from env vars; `replyTo` is the visitor's email. Plain-text body. `GET` answers 405.
- `app/api/health/supabase/route.ts` — `GET` Route Handler that checks the Supabase connection by running `select id from games limit 1` through the server client (5 s timeout), so it proves the URL, the key and the `games_and_scores` schema. Answers `200 { ok: true }`, or a generic `500` with no URL, key or stack (details go to `console.error`). It uses `await connection()` and exports neither `runtime` nor `dynamic`, because `cacheComponents` rejects both. Other methods answer 405.
- `components/ui/` — shared UI primitives (`basics.tsx` has `cx` and base components; `interactive.tsx` has client components such as `Input` and `SearchBar`; `game.tsx` has `GameCard`, `CoverArt`, `HUD`, `CRTScreen`, `Podium`, `Leaderboard`). Per-game cover art is CSS only: `av-cover-<gameId>` in `app/globals.css`. They use `av-*` CSS class names defined in `app/globals.css`.
- `lib/` — client-side data layer, all stand-ins for a future backend:
  - `games.ts` — static `GAMES` catalog (only Asteroids for now, SPEC 08), `CATEGORIES` (built from `GAMES`, so it is `All` and `Shooter`), `getGame`. Accents: cyan, magenta, yellow, green. `difficulty`, `plays` and `tags` feed the detail stat strip (`plays` is mock data). `src: null` means a game is listed but not playable yet; no entry has it now.
  - `games-archive.ts` — `ARCHIVED_GAMES`: the eight games removed by SPEC 08 (brick-buster, drop, serpent, muncher, invaders, rocks, froggy, pixel-duel), kept as data and imported by nothing but its test. To bring one back, move its entry to `GAMES`, add a migration that inserts its `games` row and, for a playable one, check its folder in `public/games/`, its `readers` entry and its `av-cover-<id>` rule.
  - `session.ts` — fake auth in localStorage (`arcade-vault:session`), exposed via `useSession` (`useSyncExternalStore`). Guests are named `GUEST`.
  - `credits.ts` — per-device credit counter in localStorage (`arcade-vault:credits`, starts at 3), exposed via `useCredits`, `spendCredit`, `insertCoin`. The player spends one credit per game start (mount and "Play again"); at 0 it shows `INSERT COIN` instead of the game. The Nav shows the balance.
  - `scores.ts` — per-game leaderboards in localStorage (`arcade-vault:scores:<gameId>`, top 50). `useScores` subscribes to a custom `arcade-vault:scores` event plus `storage`. Cross-game helpers for the landing: `useAllScores`, `latestScores`, `topPlayersToday` (best score per player, local calendar day) and `timeAgo`. `purgeRemovedGameScores` removes the lists of games that are not in `GAMES` (SPEC 08); `components/ui/navbar.tsx` calls it once per page load. It only looks at `arcade-vault:scores:*` keys, never at the session or the credits.
  - `contact.ts` — `LIMITS` (name 80, email 254, message 2000) and `validateContact`. Pure functions shared by the contact form and `POST /api/contact`; the route is the authority.
  - These modules carry `BACKEND:` comments marking where the real API or Supabase calls should replace the localStorage code. Keep the exported function signatures stable when swapping. `lib/supabase/` is the foundation for that swap. Only `leaderboard.ts` and the health route use it so far (SPEC 06, SPEC 08); auth and credits are future specs, and the local `scores.ts` still feeds `/library`, `/game/[id]` and the landing.
  - `leaderboard.ts` — global scores in Supabase: read in SPEC 06, written in SPEC 08. `fetchTopScores(gameId)` returns the top 50 of `scores` as `{ ok: true, entries: ScoreEntry[] }` or `{ ok: false }` (never throws); `rowToEntry` maps a row to `ScoreEntry`. `/hall-of-fame` reads with `fetchTopScores`, with loading, `[ERR]` + `Retry` and empty states and no localStorage fallback. `submitScore({ gameId, player, score })` inserts one row from the browser with the publishable key and resolves `true` or `false` (never throws); `toScoreRow` trims the name and cuts it to 20 characters, and rejects an empty name and a score that is not an integer from 0 to 9,999,999. `game-player.tsx` calls it after the local `saveScore`, with `SAVING…`, `SCORE SAVED` and an `[ERR]` line when it fails (the local copy is kept). The name is free text because there is no real auth yet, so the ranking can be forged by calling the REST API directly. `/library`, `/game/[id]` and the landing still read the local `useScores`.
- `lib/supabase/` — Supabase connection only (SPEC 04). `env.ts` has `getSupabaseEnv`, which reads and validates the two public variables and throws an error naming the missing one. `client.ts` exports `createClient()` for Client Components (`createBrowserClient`). `server.ts` exports async `createClient()` for Server Components and Route Handlers (`createServerClient` with `await cookies()`). Both create the client inside the function, never at module load. There is no `proxy.ts` and no service role key yet.
- `supabase/migrations/` — SQL migrations, versioned in git and applied with the Supabase MCP (`apply_migration`). The file name carries the version that Supabase assigns (check `list_migrations`). Three so far. `20261019092211_games_and_scores.sql` (SPEC 06) creates `games` and `scores` with RLS on and `select` policies, and seeded them with invented data. `20261019103546_save_scores.sql` (SPEC 08) deleted that seed and every game except `asteroids`, and added the `insert` policy on `scores` (player 1 to 20 characters after trimming, score 0 to 9,999,999; the foreign key keeps scores to games that exist in `games`). `20261019103728_least_privilege_grants.sql` revokes every privilege of `anon` and `authenticated` on both tables and grants back only `select`, plus `insert` on `game_id`, `player` and `score` of `scores`, so `update`, `delete` and `truncate` are not granted at all and the browser cannot set `id` or `created_at`. `scores` now holds only scores that players saved. Adding a game to `GAMES` needs a new migration that inserts its `games` row; `lib/leaderboard.test.ts` rebuilds `games` from the migrations and fails when it differs from `GAMES`. Known and not ours: `public.rls_auto_enable()` is a `SECURITY DEFINER` function that `anon` and `authenticated` can execute (advisor warning), pending its own spec.
- `public/games/<id>/` — playable games are static HTML/canvas copies of sibling projects, embedded in the host page via iframe. They are not part of the React build. `asteroids` is the only one in the catalog; the folders of `brick-buster`, `drop` and `rocks` stay on disk, unlisted, until those games return from `lib/games-archive.ts`.

## Environment variables

Copy `.env.template` to `.env` (git-ignored). Server only, never prefix with `NEXT_PUBLIC_`:

- `RESEND_API_KEY` — Resend API key.
- `CONTACT_TO_EMAIL` — inbox that receives contact messages.
- `CONTACT_FROM_EMAIL` — sender, e.g. `Arcade Vault <onboarding@resend.dev>`. The Resend sandbox sender only delivers to the email that owns the Resend account.
- `SUPABASE_DB_PASSWORD` — database password, reserved for the Supabase CLI. No code reads it.

If any of the first three is missing, `POST /api/contact` answers 500.

Public by design (the `NEXT_PUBLIC_` prefix is intended here; security comes from RLS, not from hiding them):

- `NEXT_PUBLIC_SUPABASE_URL` — project URL, `https://<project-ref>.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable (anon) key. Never put the service role key in a `NEXT_PUBLIC_` variable.

If either is missing or the URL is not `http(s)`, `getSupabaseEnv` throws and `GET /api/health/supabase` answers 500. `NEXT_PUBLIC_*` values are inlined at build time: restart `npm run dev` after editing `.env`, and rebuild for production.

## Skills

Use **/frontend-design** to scaffold and manage frontend components and architecture.

Use **/add-game** to add a playable game with its global leaderboard. It takes a folder of `references/started-games/` or a new game idea, asks the game-specific questions and writes `specs/NN-<id>-game.md`; the implementation then goes through `/spec-impl`. The skill lives in `.agents/skills/add-game/` (`SKILL.md`, `contract.md`, `spec-template.md`), symlinked from `.claude/skills/`.

### Host ↔ game bridge

`public/games/bridge.js` is loaded by each game's `index.html` **before** its own scripts, with `data-game="<id>"` on the script tag. It:

- Polls the game's top-level globals every 200 ms (per-game `readers` map) and posts `{source: 'arcade-vault-game', type: 'state', game, state: {score, lives, level, over}}` to the parent window.
- Pauses/resumes on host messages `{source: 'arcade-vault-host', type: 'pause' | 'resume'}` by freezing `requestAnimationFrame` and `performance.now`.

Adding a new playable game requires: its folder under `public/games/`, the bridge script in its `index.html`, a `readers` entry in `bridge.js` that matches the game's global state variable names, and a `src` in `lib/games.ts`. Any new catalog entry also needs an `av-cover-<id>` rule in `app/globals.css`, and a migration that inserts its row in `public.games`, because saved scores have a foreign key to it.
