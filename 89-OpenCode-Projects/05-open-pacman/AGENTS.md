# AGENTS.md

## Overview

PacMan-like game in vanilla JavaScript, HTML, and CSS. No build tools, no bundler, no package manager: `src/` is served and opened directly in a browser.

## Structure

- `src/index.html` — entry point. Loads scripts as globals via `<script>` tags in a fixed order.
- `src/js/maze.js` — maze layout and constants (`MAZE`, `TUNNEL_ROW`, `PACMAN_START`, `GHOST_STARTS`). No logic.
- `src/js/game.js` — state and rules (`createGame`, `update`). Depends on `maze.js` globals.
- `src/js/render.js` — drawing (`draw` to canvas). Pure presentation, no game rules.
- `src/css/style.css` — layout and overlay styles.
- `.agents/skills/` — spec and spec-impl skills used by this project's Spec Driven Development workflow.

## Script load order

Scripts share globals instead of ES modules. The order in `index.html` matters:

`maze.js` → `game.js` → `render.js` → `main.js`

When adding a new file, insert its `<script>` tag after its dependencies and before `main.js`.

## Workflow

This project follows Spec Driven Development as a learning exercise:

- New features or changes start with a spec (use the `spec` skill), then implementation (use the `spec-impl` skill).
- Keep the README's intent in mind: a modern, simpler take on the original PacMan.

## Verification

There are no automated tests. Verify changes by:

- Serving the directory statically (e.g. `python3 -m http.server` from this folder) and opening `src/index.html`.
- Playtesting: start, eat dots, tunnel wrap, ghost collision, win, and restart paths.

## Code style

- English for all code, comments, and identifiers.
- Small functions, no duplication (DRY), self-documenting names.
- Follow the existing conventions: file-header comment describing the module's role, spaces inside parentheses as in `( 'value' )`, and shared state passed via the `game` object.
- Do not introduce ES module syntax, build steps, or external dependencies; keep it vanilla.
