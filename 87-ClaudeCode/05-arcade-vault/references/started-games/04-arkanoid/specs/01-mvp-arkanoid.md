# 01 — Playable Arkanoid MVP

- **Status:** Implemented
- **Date:** 2026-05-07
- **Dependencies:** none (first spec of the project)
- **Objective:** Implement a playable Arkanoid game on a single 800×600 px HTML/Canvas screen, with a paddle, a ball, a 10×6 block grid, 3 lives, score and game-over/victory overlays.

---

## Scope

### Inside the MVP

- 800×600 px canvas, black background
- Paddle controlled with the mouse and the keyboard (←→) at the same time
- Ball with simple bounce (inverting `vy` on the paddle, inverting `vx`/`vy` on walls and blocks)
- Grid of 10 columns × 6 rows of blocks, one color per row
- 3 lives: when the ball falls, one life is deducted and the ball is repositioned
- Score: 10 points per broken block, visible in the HUD during the game
- Semi-transparent overlay with "GAME OVER" (0 lives) and "YOU WON!" (all blocks broken)

### Outside the MVP (left for later specs)

- Multiple levels
- Power-ups
- High scores / persistence
- Separate start or result screens
- Angle physics on the paddle
- Explosion animations when breaking blocks
- Audio

---

## Data model

No persistent structures are introduced. All state lives in module variables in `game.js`:

### Game state

```js
gameState; // 'playing' | 'gameover' | 'win'
score; // number, starts at 0
lives; // number, starts at 3
```

### Paddle

```js
paddle = { x, y, w: 162, h: 14 };
// x is updated with the mouse and the keyboard; y is fixed at 560
```

### Ball

```js
ball = { x, y, w: 16, h: 16, vx, vy };
// initial speed: vx = 200, vy = -300 (px/s)
// spawns centered on the paddle
```

### Blocks

```js
blocks = [{ x, y, w: 32, h: 16, color, alive: bool }];
// 10 columns × 6 rows
// colors per row (top to bottom): red, yellow, cyan, magenta, hotpink, green
// initial position: x from 104, y from 80, no gaps between blocks
```

---

## Implementation plan

1. **Base structure** — create `index.html` with `<canvas id="game" width="800" height="600">`,
   import `assets/spritesheet.js` and `game.js`. Black background via CSS.

2. **Game loop** — in `game.js`: call `loadSpritesheet()` and start the loop with
   `requestAnimationFrame`; compute `dt` in seconds between frames; empty `update(dt)` and `draw()` functions.

3. **Paddle** — initialize `paddle` centered on x, y=560. Move with `mousemove` events
   (clamped to the canvas) and `keydown`/`keyup` (←→ at 400 px/s). Draw with `drawSprite('paddle')`.

4. **Ball** — initialize `ball` on the paddle with `vx=200, vy=-300`.
   In `update`: move with `dt`, bounce off walls (left, right, ceiling),
   bounce off the paddle (invert `vy`), detect a fall below the canvas (lose a life).

5. **Blocks** — generate a 10×6 `blocks` array with colors per row.
   In `update`: for each `alive` block, detect AABB collision with the ball,
   mark `alive: false`, add 10 to the score, invert `vy`.
   In `draw`: draw only the `alive` ones with `drawSprite('block_' + color)`.

6. **Lives and game over** — when losing a life: if `lives > 0` reposition the ball on the paddle;
   if `lives === 0` switch to `gameState = 'gameover'`. In `draw`: when `gameState !== 'playing'`
   draw a semi-transparent overlay with the message "GAME OVER" or "YOU WON!".

7. **Victory condition** — in `update`, after breaking a block, check whether all
   blocks have `alive: false`; if so, `gameState = 'win'`.

8. **HUD** — in `draw`: show the score (top-left) and remaining lives (top-right)
   as text on the canvas while `gameState === 'playing'`.

---

## Acceptance criteria

- [x] `index.html` opens in the browser with no console errors
- [x] The canvas is 800×600 px and has a black background
- [x] The paddle moves with the mouse without leaving the canvas
- [x] The paddle moves with ←→ without leaving the canvas
- [ ] The ball starts moving when the page loads
- [ ] The ball bounces off the three walls (left, right, ceiling)
- [ ] The ball bounces off the paddle
- [ ] 60 blocks (10×6) are drawn with their colors per row
- [ ] When touching a block, it disappears and the score goes up 10 points
- [ ] The score is shown in the HUD during the game
- [ ] The lives (3) are shown in the HUD during the game
- [ ] When the ball falls, a life is lost and the ball is repositioned on the paddle
- [ ] At 0 lives the "GAME OVER" overlay appears
- [ ] When all blocks are broken the "YOU WON!" overlay appears

---

## Decisions taken and discarded

| Decision              | Chosen                      | Discarded                             | Reason                |
| --------------------- | --------------------------- | ------------------------------------- | --------------------- |
| Result screens        | Semi-transparent overlay    | Separate screens                      | MVP simplicity        |
| Paddle physics        | Simple bounce (invert `vy`) | Angle based on impact position        | Outside the MVP scope |
| Animation on breaking | None (the block disappears) | Explosion with `EXPLOSION_FRAMES`     | Outside the MVP scope |
| Audio                 | No sound                    | `ball-bounce.mp3` / `break-sound.mp3` | Outside the MVP scope |
| Levels                | 1 fixed level               | Multiple levels                       | Outside the MVP scope |
| Persistence           | None                        | localStorage for high scores          | Outside the MVP scope |
