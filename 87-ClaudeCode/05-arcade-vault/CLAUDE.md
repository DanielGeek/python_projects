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

- `app/` — App Router. Routes: `/` (library), `/game/[id]` (detail), `/game/[id]/play` (player), `/login`, `/hall-of-fame`.
- `components/ui/` — shared UI primitives (`basics.tsx` has `cx` and base components; `interactive.tsx` has client components such as `Input` and `SearchBar`). They use `av-*` CSS class names defined in `app/globals.css`.
- `lib/` — client-side data layer, all stand-ins for a future backend:
  - `games.ts` — static `GAMES` catalog, `CATEGORIES`, `getGame`. `src: null` means the game is listed but not playable yet (snake, pac-man, space-invaders).
  - `session.ts` — fake auth in localStorage (`arcade-vault:session`), exposed via `useSession` (`useSyncExternalStore`). Guests are named `GUEST`.
  - `scores.ts` — per-game leaderboards in localStorage (`arcade-vault:scores:<gameId>`, top 50). `useScores` subscribes to a custom `arcade-vault:scores` event plus `storage`.
  - Both modules carry `BACKEND:` comments marking where the real API or Supabase calls should replace the localStorage code. Keep the exported function signatures stable when swapping.
- `public/games/<id>/` — playable games (arkanoid, tetris, asteroids) are static HTML/canvas copies of sibling projects, embedded in the host page via iframe. They are not part of the React build.

### Host ↔ game bridge

`public/games/bridge.js` is loaded by each game's `index.html` **before** its own scripts, with `data-game="<id>"` on the script tag. It:

- Polls the game's top-level globals every 200 ms (per-game `readers` map) and posts `{source: 'arcade-vault-game', type: 'state', game, state: {score, lives, level, over}}` to the parent window.
- Pauses/resumes on host messages `{source: 'arcade-vault-host', type: 'pause' | 'resume'}` by freezing `requestAnimationFrame` and `performance.now`.

Adding a new playable game requires: its folder under `public/games/`, the bridge script in its `index.html`, a `readers` entry in `bridge.js` that matches the game's global state variable names, and a `src` in `lib/games.ts`.
