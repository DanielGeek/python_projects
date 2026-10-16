# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a web platform for playing arcade games online and competing for the highest score. Built with spec-driven design (`/spec` and `/spec-impl` skills, installed via `npx skills@latest add Klerith/fernando-skills`). Specs and docs must be written in English. The UI copy and game data in `lib/games.ts` are in English.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured.

## Next.js version warning

Next 16.4.1 / React 19.3 / Tailwind 4 (`@tailwindcss/turbopack`). APIs differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`) before writing Next-specific code (see `AGENTS.md`). Path alias `@/*` maps to the project root.

## Architecture

- `app/` — App Router. Routes: `/` (landing), `/library` (game library), `/game/[id]` (detail), `/game/[id]/play` (player), `/login`, `/hall-of-fame`. Anything that means "back to the library" links to `/library`; the logo links to `/`.
- `app/_home/` — landing sections, one file each: `hero`, `features`, `games-rail`, `stats`, `activity`, `pricing`, `final-cta`, plus `silhouettes`, `section-head` and `reveal` (client wrapper that fades a section in once, using `IntersectionObserver`). `hero` and `pricing` read `useSession` to hide "Create account" and turn "Start free" into "Play now". `stats` and `pricing` are static marketing copy; `activity` shows real scores. The `_` prefix keeps the folder out of routing. Landing CSS is `av-home-*` in `app/globals.css`, ported from `references/templates/home-about/`.
- `components/ui/` — shared UI primitives (`basics.tsx` has `cx` and base components; `interactive.tsx` has client components such as `Input` and `SearchBar`; `game.tsx` has `GameCard`, `CoverArt`, `HUD`, `CRTScreen`, `Podium`, `Leaderboard`). Per-game cover art is CSS only: `av-cover-<gameId>` in `app/globals.css`. They use `av-*` CSS class names defined in `app/globals.css`.
- `lib/` — client-side data layer, all stand-ins for a future backend:
  - `games.ts` — static `GAMES` catalog (8 games), `CATEGORIES` (Arcade, Puzzle, Shooter, Versus), `getGame`. Accents: cyan, magenta, yellow, green. `difficulty`, `plays` and `tags` feed the detail stat strip (`plays` is mock data). `src: null` means the game is listed but not playable yet (serpent, muncher, invaders, froggy, pixel-duel).
  - `session.ts` — fake auth in localStorage (`arcade-vault:session`), exposed via `useSession` (`useSyncExternalStore`). Guests are named `GUEST`.
  - `credits.ts` — per-device credit counter in localStorage (`arcade-vault:credits`, starts at 3), exposed via `useCredits`, `spendCredit`, `insertCoin`. The player spends one credit per game start (mount and "Play again"); at 0 it shows `INSERT COIN` instead of the game. The Nav shows the balance.
  - `scores.ts` — per-game leaderboards in localStorage (`arcade-vault:scores:<gameId>`, top 50). `useScores` subscribes to a custom `arcade-vault:scores` event plus `storage`. Cross-game helpers for the landing: `useAllScores`, `latestScores`, `topPlayersToday` (best score per player, local calendar day) and `timeAgo`.
  - These modules carry `BACKEND:` comments marking where the real API or Supabase calls should replace the localStorage code. Keep the exported function signatures stable when swapping.
- `public/games/<id>/` — playable games (brick-buster, drop, rocks) are static HTML/canvas copies of sibling projects, embedded in the host page via iframe. They are not part of the React build.

## Skills

Use **/frontend-design** to scaffold and manage frontend components and architecture.

### Host ↔ game bridge

`public/games/bridge.js` is loaded by each game's `index.html` **before** its own scripts, with `data-game="<id>"` on the script tag. It:

- Polls the game's top-level globals every 200 ms (per-game `readers` map) and posts `{source: 'arcade-vault-game', type: 'state', game, state: {score, lives, level, over}}` to the parent window.
- Pauses/resumes on host messages `{source: 'arcade-vault-host', type: 'pause' | 'resume'}` by freezing `requestAnimationFrame` and `performance.now`.

Adding a new playable game requires: its folder under `public/games/`, the bridge script in its `index.html`, a `readers` entry in `bridge.js` that matches the game's global state variable names, and a `src` in `lib/games.ts`. Any new catalog entry also needs an `av-cover-<id>` rule in `app/globals.css`.
