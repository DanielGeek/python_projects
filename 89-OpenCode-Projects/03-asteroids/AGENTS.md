# AGENTS.md

## Project

- Vanilla HTML5 Canvas clone of the arcade game Asteroids. No dependencies, no build step, no bundler, no manifest, no tests.
- `index.html` mounts a fixed 800×600 canvas and loads `game.js`, which holds all game logic in a single file.
- Run by opening `index.html` directly in a browser, or serve the directory (`npx serve .`) and visit `http://localhost:3000`.

## Code layout (`game.js`)

- Input: `keys`/`justPressed` maps plus `pressed(code)` for edge detection; arrow keys rotate and thrust, `Space` fires and also restarts after game over.
- Utils: `wrap` (toroidal space — entities wrap at the edges), `dist`, `rand`, `randInt`.
- Classes: `Bullet` (fixed speed, ttl), `Asteroid` (sizes 1–3 driven by the `RADII`/`SPEEDS`/`POINTS` tables; splitting produces two of the next smaller size), `Ship` (thrust, drag, respawn invincibility, shoot cooldown, velocity timer), `PowerUp` (cyan hexagon pickup; the bar beneath it depletes as its despawn ttl runs out), `Particle` (explosion sparks, optional color).
- Game state lives in module-level variables (`ship`, `bullets`, `asteroids`, `particles`, `powerups`, `score`, `lives`, `level`) with a `state` machine: `'playing' | 'dead' | 'gameover'`.
- `update(dt)` and `draw()` run from a `requestAnimationFrame` loop with delta time clamped to 0.05s.
- `spawnAsteroids` keeps a 130px safe distance from the canvas center so asteroids never spawn on the ship.
- Velocity power-up: doubles ship thrust for `VELOCITY_DURATION` seconds (picking one up mid-effect just refreshes the timer; the effect is lost on death or level change). It appears via a periodic spawn (`FIRST_SPAWN_DELAY`, then every `SPAWN_INTERVAL` seconds, only when none is on screen, `POWERUP_SAFE_DIST` from the ship) and via a `DROP_CHANCE` roll whenever an asteroid is destroyed. The thruster flame turns cyan while the HUD shows a `VELOCITY` label with a depleting bar (both bars are drawn by `drawTimerBar`).

## Conventions

- Keep it dependency-free: plain ES6+ JavaScript, no imports, no frameworks, no external assets.
- All code, comments, and in-game UI text are in English.
- Canvas dimensions are the `W`/`H` constants at the top of `game.js`; keep them in sync with the `<canvas>` attributes in `index.html`.

## Verification

No automated tests. Open `index.html` in a browser and play: rotate, thrust, and fire; confirm asteroid splitting and scoring (large 20, medium 50, small 100), edge wrapping, the blinking respawn invincibility, lives, level progression, the game over → restart flow, and the Velocity power-up (periodic spawn and asteroid drops, cyan flame plus HUD countdown while active, doubled thrust that expires after 5 seconds).
