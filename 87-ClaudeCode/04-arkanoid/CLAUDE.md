# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Arkanoid game (browser, Canvas 2D). Specs 01–08 are implemented. There is no build system, package manifest or automated tests, and none is planned: plain scripts loaded by `index.html`. Do not assume a framework or build tooling; confirm with the user before adding one.

To run it, serve the project root with any static server (e.g. `python3 -m http.server 8000`) and open `http://localhost:8000`. The sprite path is relative, so the page must be served from the root.

## Code layout

- `index.html`: 800 × 600 `<canvas id="game">` inside `#stage`, plus the page-level DOM widgets `#mute-indicator` (SPEC 05) and `#controls-guide` (SPEC 08), both CSS-only layout in the grey area right of the canvas (they move to the viewport's top-right corner below 968 px). Scripts load in order: `assets/spritesheet.js`, `levels.js`, `game.js`, all plain global-scope scripts (no modules).
- `levels.js`: data only. `LEVELS` (3 hand-made layouts, rows of 10 characters, `.` = empty cell) and `LEVEL_COLORS` (character → colour name used by the sprites).
- `game.js`: everything else. Constants at the top, then audio and mute, `DIFFICULTIES`, the single `game` state object, input handlers, `update(dt)` / `draw()` and the `requestAnimationFrame` loop.
- Code style: spaces inside parentheses (`foo( a, b )`), single quotes, semicolons, short comments explaining the why.

## Game behaviour (as implemented)

- `game.status`: `'menu' | 'ready' | 'playing' | 'paused' | 'won' | 'lost'`. The game starts in `menu`.
  - `menu` (SPEC 07): pick Easy / Normal / Hard (`1`/`2`/`3` start at once; arrows or `A`/`D` move the highlight; `Enter` or `Space` start). Difficulty sets ball speed (300 / 400 / 500 px/s) and lives (5 / 3 / 2) for the whole run; `game.difficulty` is the index into `DIFFICULTIES` and survives back to the menu as the highlight.
  - `ready`: ball stuck to the paddle; `Space` or click launches.
  - `playing` / `paused` (SPEC 06): `P` or `Esc` toggles; window `blur` pauses automatically. Ball, bricks, explosions and paddle freeze.
  - `won` / `lost`: overlay; `Space` or click returns to `menu`.
- Levels (SPEC 04): clearing a level (after its last explosion ends) loads the next one with score and lives kept; "You win!" only after level 3. HUD shows score, "Level N/3" and lives.
- Brick hits start a 150 ms explosion (SPEC 02); the brick stops colliding immediately and score is added on the hit.
- Sound (SPEC 03): bounce sound on walls, ceiling and paddle; break sound on a brick (never both). `M` toggles mute in any status; `muted` lives outside `game` so a reset never unmutes. Sound errors must never throw.

## Assets

- `assets/spritesheet-breakout.png` + `assets/spritesheet.js`: the sprite atlas and its loader. `spritesheet.js` is a plain browser script (global scope, no modules). It defines `EXPLOSION_FRAMES` (per-colour 4-frame brick explosions), `EXPLOSION_DURATION` (150 ms), `SPRITES` (`paddle`, `ball`, `blocks.<colour>` source rects as `{sx, sy, sw, sh}`), and the draw helpers `drawFrame(ctx, frame, x, y, w, h)` and `drawSprite(ctx, name, x, y, w, h)`. Block sprites are addressed as `block_<colour>` (e.g. `block_red`).
- `drawFrame` and `drawSprite` silently draw nothing until the image has loaded (`ssLoaded`).
- `assets/sounds/`: `ball-bounce.mp3`, `break-sound.mp3`.

## Spec-driven workflow

Features are planned with project skills in `.agents/skills/` (installed from `Klerith/fernando-skills`, pinned in `skills-lock.json`):

- `/spec <one-sentence feature>`: asks clarifying questions, then writes `specs/NN-slug.md` (state `Draft`). Writes no code.
- `/spec-impl NN-slug`: implements a spec only once its state is Approved. Creates branch `<type>/NN-slug`, e.g. `feature/NN-slug` or `bugfix/NN-slug` (controlled by `AutoCreateBranch` in `specs/.spec-config.yml`) and works step by step, pausing to review diffs.

Both skills read `CLAUDE.md` first, then `README.md`, for project context. Spec language and headings follow existing specs in `specs/`. Status lifecycle: `Draft` → `Approved` → `Implemented`; commits that move a spec between states are made separately (see `git log`).

Existing specs: 01 playable MVP, 02 brick explosion animation, 03 sound effects, 04 multiple levels, 05 mute indicator, 06 pause and resume, 07 difficulty selection, 08 controls guide. The next spec is 09.

## Other project skill

`.claude/skills/neko/SKILL.md` (`/neko`): makes replies short and cat-like. Persisted text (code, commits, docs) stays in normal prose.
