# AGENTS.md

## Project

- Vanilla HTML5 Canvas clone of the arcade game Asteroids. No dependencies, no build step, no bundler, no manifest, no tests.
- `index.html` mounts a fixed 800×600 canvas and loads `game.js`, which holds all game logic in a single file.
- Run by opening `index.html` directly in a browser, or serve the directory (`npx serve .`) and visit `http://localhost:3000`.

## Code layout (`game.js`)

- Input: `keys`/`justPressed` maps plus `pressed(code)` for edge detection; arrow keys rotate and thrust, `Space` fires and also restarts after game over.
- Utils: `wrap` (toroidal space — entities wrap at the edges), `dist`, `rand`, `randInt`.
- Classes: `Bullet` (fixed speed, ttl), `Asteroid` (sizes 1–3 driven by the `RADII`/`SPEEDS`/`POINTS` tables; splitting produces two of the next smaller size; each instance carries its own `points` and `rgb`), `ShootingStar` (`Asteroid` subclass: fixed fast speed, despawn ttl, never splits, golden comet tail), `Ship` (thrust, drag, respawn invincibility, shoot cooldown, velocity and triple-shot timers), `PowerUp` (base pickup: hexagon outline, kind icon, despawn-ttl bar; subclasses set `rgb`, `apply` the effect and `drawIcon`), `VelocityPowerUp` (cyan, doubles thrust), `TripleShotPowerUp` (magenta, three parallel bullets), `Particle` (explosion sparks, optional color).
- Game state lives in module-level variables (`ship`, `bullets`, `asteroids`, `particles`, `powerups`, `score`, `lives`, `level`) with a `state` machine: `'playing' | 'dead' | 'gameover'`.
- `update(dt)` and `draw()` run from a `requestAnimationFrame` loop with delta time clamped to 0.05s.
- `spawnAsteroids` keeps a 130px safe distance from the canvas center so asteroids never spawn on the ship.
- Power-ups: `VelocityPowerUp` (cyan) doubles ship thrust for `VELOCITY_DURATION` seconds; `TripleShotPowerUp` (magenta) makes `tryShoot` fire three parallel bullets `TRIPLE_OFFSET` px apart for `TRIPLE_DURATION` seconds. Both appear via a periodic spawn (`FIRST_SPAWN_DELAY`, then every `SPAWN_INTERVAL` seconds, only when none is on screen, `POWERUP_SAFE_DIST` from the ship) and via a `DROP_CHANCE` roll whenever an asteroid is destroyed, with `spawnPowerUp` picking a random kind each time. Picking one up mid-effect just refreshes the timer; effects are lost on death or level change. The thruster flame turns cyan while Velocity is active; each active effect stacks a HUD label with a depleting bar under the score (`drawActiveEffect`; all bars go through `drawTimerBar`, which takes a per-effect color).
- Shooting star: golden fast asteroid worth `SHOOTING_STAR_POINTS` that never splits. It appears via a periodic spawn (`SHOOTING_STAR_FIRST_DELAY`, then every `SHOOTING_STAR_SPAWN_INTERVAL` seconds, only when none is on screen, `SHOOTING_STAR_SAFE_DIST` from the ship), moves at `SHOOTING_STAR_SPEED`, and expires after `SHOOTING_STAR_TTL` seconds in a golden burst that scores nothing (`updateAsteroids` handles the burst and the dead-asteroid filter). It kills the ship on contact and holds level completion while alive.

## Conventions

- Keep it dependency-free: plain ES6+ JavaScript, no imports, no frameworks, no external assets.
- All code, comments, and in-game UI text are in English.
- Canvas dimensions are the `W`/`H` constants at the top of `game.js`; keep them in sync with the `<canvas>` attributes in `index.html`.

## Verification

No automated tests. Open `index.html` in a browser and play: rotate, thrust, and fire; confirm asteroid splitting and scoring (large 20, medium 50, small 100, shooting star 200), edge wrapping, the blinking respawn invincibility, lives, level progression, the game over → restart flow, the power-ups (periodic spawn and asteroid drops pick a random kind; Velocity: cyan flame plus HUD countdown while active, doubled thrust that expires after 5 seconds; Triple shot: three parallel bullets per shot for 5 seconds with a magenta HUD countdown), and the shooting star (periodic golden fast asteroid with a comet tail, never splits, kills the ship on contact, bursts into golden particles without scoring when its 8-second lifetime ends).
