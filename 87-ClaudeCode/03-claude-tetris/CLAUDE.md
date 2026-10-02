# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JavaScript Tetris (HTML5 Canvas + CSS). No dependencies, no build step, no tests, no linter. Everything (README, UI strings) is in English.

## Running

Open `index.html` directly, or serve statically: `python3 -m http.server 8000` and visit `http://localhost:8000`.

## Architecture

All logic lives in a single script, [game.js](game.js), loaded by [index.html](index.html) and styled by [style.css](style.css). The script looks up DOM elements by id at load time (`board`, `next-canvas`, `score`, `lines`, `level`, `overlay`, `overlay-title`, `overlay-score`, `restart-btn`), so renaming ids in the HTML requires updating the constants at the top of `game.js`.

- **State** is a set of module-level `let` globals (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `dropInterval`, ...) reset by `init()`, which is also the restart handler.
- **Board** is a 20×10 matrix of integers: `0` is empty, `1–12` index into both `PIECES` (shape matrices) and `COLORS`/`LIGHT_COLORS`. Piece type number == color index, so adding a piece means editing all three arrays (and, for a non-classic piece, the spawn rules in `randomPiece()`/`spawn()`). `POWER_BLOCK` (13) is only a shape-cell marker and never reaches the board.
- **Piece set**: types 1–7 are the classic tetrominoes (uniform, the default). Types 8–10 are pentominoes (+, U, Y; `PENTOMINO_CHANCE` 12% total), 12 is a hollow 3×3 ring (`RING_CHANCE` 3%), both rolled in `randomPiece()` via `pieceOfType()`. Type 11 is a single block, never random: a 4-line clear sets `singlePending` and `spawn()` makes it the next piece (a pending power-up takes priority).
- **Game loop**: `loop(ts)` is a `requestAnimationFrame` loop that accumulates elapsed time into `dropAccum` for gravity and redraws every frame. Pause/game-over stop it via `cancelAnimationFrame(animId)`. Resuming restarts it with a fresh `lastTime`.
- **Piece lifecycle**: `lockPiece()` → `merge()` → `clearLines()` (updates score/level/`dropInterval`) → `spawn()` (promotes `next`; calls `endGame()` if the spawn position collides).
- **Input** is one `keydown` handler using `e.code`. Rotation (`tryRotate`) is clockwise only, with simple horizontal wall kicks `[0, -1, 1, -2, 2]`.
- **Scoring**: line clears use `LINE_SCORES × level`; soft drop gives +1 per cell and hard drop +2 per cell. Level is `floor(lines / 10) + 1`, and `dropInterval = max(100, 1000 - (level-1) * 90)` ms.
- **Power-ups**: every `POWER_EVERY` (5) lines, `clearLines()` sets `powerPending`; `spawn()` then makes the *next* piece a one-block `powerUpPiece()` (shape cell `POWER_BLOCK` = 8, a `power` name from `POWER_GLYPHS`). It moves/drops like any piece, but `lockPiece()` calls `applyPower()` instead of `merge()`, so it is never stored on the board. Effects: `bomb` (3×3 around it), `bolt` (random row or column), `tint` (removes all blocks of the color it lands on; on the floor, the most common color), `gravity` (`compactColumns()`), `freeze` (`freezeLeft` = 5000 ms, counted down in `loop()` so pausing stops it; gravity is off but the player can still move/drop). Destroyed blocks give `POWER_SCORE` each. `drawBlock()` takes an optional `power` arg to draw the glyph; color is the `--power` CSS variable cached into `powerColor` by `applyTheme()`.
- **Theming**: dark is the default. Colors live in CSS custom properties in [style.css](style.css) (`:root` = dark, `:root[data-theme="light"]` = light). The `#theme-toggle` button (ids `theme-toggle`, `theme-toggle-icon`, `theme-toggle-text`) calls `applyTheme()` in `game.js`, which sets `data-theme` on `<html>`, swaps `palette` between `COLORS` and `LIGHT_COLORS`, caches the `--grid` value into `gridColor` (canvas can't read CSS), and repaints via `draw()`/`drawNext()` (the loop is stopped while paused/game over). The choice is persisted in `localStorage` under `tetris-theme`. The button is blurred after click so Space doesn't re-trigger it. Any new color should be a CSS variable, not a hard-coded value.
- **Rendering**: `draw()` repaints grid, board, ghost piece (via `ghostY()`, alpha 0.2) and current piece. `drawNext()` renders into the separate preview canvas.
