# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Arkanoid game (browser, Canvas 2D). The repo is at the very start: there is no game code, `index.html`, build system, package manifest, or tests yet. Only `README.md` ("Arkanoid game") and the `assets/` folder exist. Do not assume a framework or build tooling; confirm with the user before adding one.

## Assets

- `assets/spritesheet-breakout.png` + `assets/spritesheet.js`: the sprite atlas and its loader. `spritesheet.js` is a plain browser script (global scope, no modules). It defines `EXPLOSION_FRAMES` (per-colour 4-frame brick explosions), `EXPLOSION_DURATION` (150 ms), `SPRITES` (`paddle`, `ball`, `blocks.<colour>` source rects as `{sx, sy, sw, sh}`), and the draw helpers `drawFrame(ctx, frame, x, y, w, h)` and `drawSprite(ctx, name, x, y, w, h)`. Block sprites are addressed as `block_<colour>` (e.g. `block_red`).
- `drawFrame` and `drawSprite` silently draw nothing until the image has loaded (`ssLoaded`). The image path is relative (`assets/spritesheet-breakout.png`), so the page must be served from the project root.
- `assets/sounds/`: `ball-bounce.mp3`, `break-sound.mp3`.

## Spec-driven workflow

Features are planned with project skills in `.agents/skills/` (installed from `Klerith/fernando-skills`, pinned in `skills-lock.json`):

- `/spec <one-sentence feature>`: asks clarifying questions, then writes `specs/NN-slug.md` (state `Draft`). Writes no code.
- `/spec-impl NN-slug`: implements a spec only once its state is Approved. Creates branch `spec-NN-slug` (controlled by `AutoCreateBranch` in `specs/.spec-config.yml`) and works step by step, pausing to review diffs.

Both skills read `CLAUDE.md` first, then `README.md`, for project context. Spec language and headings follow existing specs in `specs/`.

## Other project skill

`.claude/skills/neko/SKILL.md` (`/neko`): makes replies short and cat-like. Persisted text (code, commits, docs) stays in normal prose.
