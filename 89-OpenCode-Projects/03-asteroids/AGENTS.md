# AGENTS.md

## Project

- Vanilla HTML5 Canvas clone of the arcade game Asteroids. No dependencies, no build step, no bundler, no manifest, no tests.
- `index.html` mounts a fixed 800×600 canvas and loads `game.js`, which holds all game logic in a single file.
- Run by opening `index.html` directly in a browser, or serve the directory (`npx serve .`) and visit `http://localhost:3000`.

## Code layout (`game.js`)

- Input: `keys`/`justPressed` maps plus `pressed(code)` for edge detection; arrow keys rotate and thrust, `Space` fires and also restarts after game over.
- Utils: `wrap` (toroidal space — entities wrap at the edges), `dist`, `rand`, `randInt`.
- Classes: `Bullet` (fixed speed, ttl), `Asteroid` (sizes 1–3 driven by the `RADII`/`SPEEDS`/`POINTS` tables; splitting produces two of the next smaller size; each instance carries its own `points` and `rgb`), `ShootingStar` (`Asteroid` subclass: fixed fast speed, despawn ttl, never splits, golden comet tail), `Ship` (thrust, drag, respawn invincibility, shoot cooldown, velocity and shield timers), `PowerUp` (hexagon pickup whose `kind` sets its color and glyph — cyan `>>` for Velocity, green dome for Shield; the bar beneath it depletes as its despawn ttl runs out), `Particle` (explosion sparks, optional color).
- Ship skins: the `SKINS` table (name, stroke, optional fill, flame color, `rear` flame anchor, hull as closed subpaths with the nose on +x) defines 5 silhouettes; `traceHull` traces any hull on the canvas without stroking or filling. `KeyS` cycles skins in any state via `cycleSkin`, persists the pick in `localStorage` (`asteroids-skin`), and shows a fading `SKIN: <NAME>` toast under the level HUD (`skinLabelTimer`). `Ship.draw` and `drawLifeIcon` (hull at half scale) both render the active skin; the thruster flame uses the skin's color except while Velocity is active (cyan), and a dim `S: CHANGE SKIN` hint at the bottom-left of the canvas keeps the key discoverable in every state.
- Game state lives in module-level variables (`ship`, `bullets`, `asteroids`, `particles`, `powerups`, `score`, `lives`, `level`) with a `state` machine: `'playing' | 'dead' | 'gameover'`.
- `update(dt)` and `draw()` run from a `requestAnimationFrame` loop with delta time clamped to 0.05s.
- `spawnAsteroids` keeps a 130px safe distance from the canvas center so asteroids never spawn on the ship.
- Velocity power-up: doubles ship thrust for `VELOCITY_DURATION` seconds (picking one up mid-effect just refreshes the timer; the effect is lost on death or level change). It appears via a periodic spawn (`FIRST_SPAWN_DELAY`, then every `SPAWN_INTERVAL` seconds, only when none is on screen, `POWERUP_SAFE_DIST` from the ship) and via a `DROP_CHANCE` roll whenever an asteroid is destroyed; `randomKind` picks the kind on every spawn. The thruster flame turns cyan while the HUD shows a `VELOCITY` label with a depleting bar.
- Shield power-up: grants collision protection for `SHIELD_DURATION` seconds (picking one up mid-effect just refreshes the timer; the effect is lost on death or level change). While active, a pulsing green bubble of `SHIELD_RADIUS` surrounds the ship and the HUD shows a `SHIELD` label with a depleting bar. Asteroids and shooting stars that touch the shielded ship are vaporized — burst of particles, no points, no split, no drop — instead of killing it (`updateAsteroids` then filters the dead asteroid). Effect labels and despawn bars are all drawn by `drawTimerBar`, which takes the kind's `rgb`.
- Shooting star: golden fast asteroid worth `SHOOTING_STAR_POINTS` that never splits. It appears via a periodic spawn (`SHOOTING_STAR_FIRST_DELAY`, then every `SHOOTING_STAR_SPAWN_INTERVAL` seconds, only when none is on screen, `SHOOTING_STAR_SAFE_DIST` from the ship), moves at `SHOOTING_STAR_SPEED`, and expires after `SHOOTING_STAR_TTL` seconds in a golden burst that scores nothing (`updateAsteroids` handles the burst and the dead-asteroid filter). It kills the ship on contact and holds level completion while alive.

## Conventions

- Keep it dependency-free: plain ES6+ JavaScript, no imports, no frameworks, no external assets.
- All code, comments, and in-game UI text are in English.
- Canvas dimensions are the `W`/`H` constants at the top of `game.js`; keep them in sync with the `<canvas>` attributes in `index.html`.

## Verification

No automated tests. Open `index.html` in a browser and play: rotate, thrust, and fire; confirm asteroid splitting and scoring (large 20, medium 50, small 100, shooting star 200), edge wrapping, the blinking respawn invincibility, lives, level progression, the game over → restart flow, the Velocity power-up (periodic spawn and asteroid drops, cyan flame plus HUD countdown while active, doubled thrust that expires after 5 seconds), the Shield power-up (green hexagon with a dome glyph, pulsing green bubble around the ship, HUD countdown bar, collisions with asteroids and shooting stars vaporize them without scoring while it lasts, effect lost on death or level change), the shooting star (periodic golden fast asteroid with a comet tail, never splits, kills the ship on contact, bursts into golden particles without scoring when its 8-second lifetime ends), and the skin system (press `S` in any state: hull, flame color, and life icons change with a fading name toast under the level HUD; the pick persists across reloads via `localStorage`).
