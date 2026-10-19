---
name: add-game
description: Designs the spec to add a playable game, with its global leaderboard, to Arcade Vault. The game comes from a folder in references/started-games/ or is a new game built to the bridge contract. Asks the game-specific questions, then writes specs/NN-<id>-game.md ready for /spec-impl.
disable-model-invocation: true
argument-hint: "<folder in references/started-games, or a short game idea>"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Bash(ls:*), Bash(cat:*), Bash(date:*), Bash(diff:*), mcp__supabase__list_migrations, mcp__supabase__list_tables
---

# /add-game — Spec designer for a new playable game

## Session context

Today's date (use this for the spec header, never guess it):
!`date +%F`

Specs that already exist:
!`ls specs/ 2>/dev/null || echo "The specs/ folder does not exist yet"`

Reference games available:
!`ls references/started-games/ 2>/dev/null || echo "No references/started-games/ folder"`

Game folders already in public/games/:
!`ls public/games/ 2>/dev/null`

Ids in the catalog and in the archive:
!`grep -hE '^\s+id: "' lib/games.ts lib/games-archive.ts 2>/dev/null`

---

This skill produces the **spec** that adds one game to Arcade Vault: playable in the CRT frame, listed in the catalog, and ranked in the global Supabase leaderboard. **You write no game code here.** You inspect the game, ask what is undecided, and save `specs/NN-<id>-game.md`. The user approves it and runs `/spec-impl NN-<id>-game`.

Your replies are in the same language as the user's prompt. The spec, and everything in the repo, is in English.

## Why the leaderboard needs no per-game code

`app/game/[id]/play/game-player.tsx` already calls `saveScore` and `submitScore` when the bridge reports `over` going from false to true, and `/hall-of-fame` builds its tabs from `GAMES`. So a game is "ranked" when two things are true:

1. Its bridge reader reports a correct integer `score` and a correct `over`.
2. A migration inserts its row in `public.games` (`scores.game_id` has a foreign key to it).

The spec must never plan edits to `game-player.tsx`, `lib/leaderboard.ts` or `lib/scores.ts`.

## Phase 1 — Context

Read, in this order:

1. `CLAUDE.md` (the **Host ↔ game bridge** section and the `lib/leaderboard.ts` / `supabase/migrations/` bullets).
2. `contract.md` in this skill's directory.
3. `specs/05-asteroids-game.md` and `specs/08-save-scores-to-supabase.md`, as the model for tone, headings and status wording. Also read the most recent spec in `specs/` to get the next number `NN`.
4. `public/games/bridge.js` and `lib/games.ts`.
5. `spec-template.md` in this skill's directory.

## Phase 2 — Identify the source

The argument is either a folder name in `references/started-games/` or a game idea.

**From a reference.** Read its `index.html`, `game.js` and any other script, `README.md` and `CLAUDE.md`. Extract and write down:

- The top-level globals that hold score, lives, level and game over (`grep -nE '^(let|var|const) '`). Note whether it has no lives (`lives: null`) or a win state (`over` must be true for a win too).
- Canvas size, which gives `aspect`.
- The `keydown` handlers: which keys scroll the host inside the iframe (arrows, Space) and need `preventDefault`.
- Its own pause keys or overlay, theme toggles, extra DOM outside the canvas, assets (images, audio) and relative paths.
- Any non-English text in code, canvas texts or `lang`.
- Controls, scoring and features from the README, for the catalog copy.

**Archived match.** Compare the reference with `lib/games-archive.ts` and the folders in `public/games/` (for example `diff -q` the `game.js`). If one matches (`03-tetris` and `drop`, `04-arkanoid` and `brick-buster`, `02-asteroids` and `rocks`), ask with AskUserQuestion every time: restore the archived entry, or create a new id from the reference as the source of truth. Explain what each costs: restoring reuses the folder, reader and cover but keeps the drift from the reference; a new id needs its own folder, reader, cover and score table (SPEC 05 did this for `asteroids` next to `rocks`).

**From scratch.** Collect the idea, then plan the game under the rules in `contract.md`. The spec must say what the new files are and which globals the reader uses.

## Phase 3 — Questions

Ask with AskUserQuestion, at most four per round, only what Phases 1–2 did not settle:

- `id` (lowercase kebab-case; it feeds the route, `av-cover-<id>`, the bridge key and the score storage key) and `title`.
- `category`: `Arcade`, `Puzzle`, `Shooter` or `Versus`. A new category is out of scope.
- `accent`: `cyan`, `magenta`, `yellow` or `green`.
- `difficulty` 1 to 5, `tags` (only `TOUCH` if the game has touch controls) and the cover-art idea.
- Catalog copy: propose `tagline` and `description` drawn from the README and the code, and let the user adjust. Never promise features the game does not have.

Raise the risks you found: its own pause conflicting with the host pause, no way to restart after game over, a score that is not an integer or can exceed 9,999,999, a win ending, audio autoplay blocked in an iframe, relative asset paths.

If the user wants to go faster, remind them that a wrong reader or a missing `games` row fails silently at runtime.

## Phase 4 — Write the spec

1. Check `mcp__supabase__list_migrations` so the migration step names the right current state. Do not apply anything.
2. Fill `spec-template.md` and save it as `specs/NN-<id>-game.md` (NN is the next free number, two digits). Status `Draft`, `Depends on: SPEC 05, SPEC 08`, today's date.
3. Fill every `<placeholder>`: real globals in the reader, the exact `GAMES` entry, the exact migration SQL, the changes to `game.js` as a table (file, reference, vault) and the cover-art description.
4. End by telling the user to review the spec, set it to approved, and run `/spec-impl NN-<id>-game`.

## Rules

- No code, no copying of game files and no migration applied in this skill.
- The reference is the source of truth: the spec lists only platform changes to `game.js` (`preventDefault`, a pause conflict if any) and never changes mechanics or balance.
- Copy only `index.html`, scripts, assets and `favicon.svg` into `public/games/<id>/`. Never `README.md`, `CLAUDE.md`, `.gitignore`, `specs/` or lock files.
- Do not touch other games, their entries, readers or covers.
- The migration insert uses the single-line tuple format described in the template, because `lib/leaderboard.test.ts` parses it.
