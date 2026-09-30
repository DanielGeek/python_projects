# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Asteroids clone in plain HTML5 canvas + vanilla JS. No dependencies, no bundler, no tests, no linter. `index.html` loads `game.js` via a classic `<script>` tag (not a module).

## Running

Open `index.html` in a browser, or serve the directory (`npx serve .`, then http://localhost:3000). Verification is manual in the browser.

## Architecture (all in `game.js`)

- **Fixed logical canvas**: `W = 800`, `H = 600` constants must match the `<canvas width/height>` attributes in `index.html`. The world is toroidal: every entity wraps positions with `wrap(v, max)`; particles are the exception and do not wrap.
- **Entities**: `Bullet`, `Asteroid`, `Ship`, `Particle` classes each own `update(dt)` and `draw()` (drawing uses the global `ctx`). Removal is by a `dead` flag; arrays are re-filtered each frame in `update()`.
- **Game state** is module-level `let` variables (`ship, bullets, asteroids, particles, score, lives, level, state, deadTimer`), reset by `initGame()`. `state` is `'playing' | 'dead' | 'gameover'`; `update()` branches on it first. In `'dead'` the ship is gone for 2s, then `ship.reset()` (which grants 3s of blinking invincibility).
- **Loop**: `requestAnimationFrame` → `update(dt)` then `draw()`. `dt` is in seconds and clamped to 0.05.
- **Input**: `keys[e.code]` holds state; `justPressed` + `pressed(code)` gives one-shot edge detection (consumed on read). Shooting and restart use `pressed('Space')`; movement reads `keys` directly.
- **Asteroid sizes** are indexed 1–3 through the parallel arrays `RADII`, `SPEEDS`, `POINTS` (index 0 is unused padding). `split()` spawns two of `size - 1`. Note that `POINTS` rewards small asteroids most (100/50/20).
- **Collision** is circle-based with `dist()`; ship vs asteroid uses `a.radius * 0.82` for forgiveness. Level clears when `asteroids.length === 0` → `nextLevel()` spawns `3 + level` large asteroids outside a safe radius around the center.
