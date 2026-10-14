# SPEC 01 — Playable Arkanoid MVP

> **Status:** Approved
> **Depends on:** none
> **Date:** 2026-10-14
> **Objective:** A playable browser Arkanoid with a single 10×6 brick level, three lives, 10 points per brick, and a win / Game Over overlay.

---

## Scope

**In:**

- `index.html` page with a fixed 800 × 600 px `<canvas>`, served from the project root.
- A single fixed level: a grid of 10 columns × 6 rows of bricks, one row per colour.
- Paddle controlled simultaneously by keyboard (arrow keys and A/D) and mouse.
- Ball with constant speed that bounces off walls, ceiling, paddle and bricks.
- Three lives and a score of 10 points per brick, both shown in an in-canvas HUD.
- Bricks disappear instantly when hit.
- A simple win and Game Over overlay, with game restart.

**Out of scope (for future specs):**

- Multiple levels or a level editor.
- Power-ups, multi-hit or indestructible bricks (the `gray` colour is unused).
- Progressive ball speed increase.
- Brick explosion animation (`EXPLOSION_FRAMES`, `EXPLOSION_DURATION` in `assets/spritesheet.js` stay unused).
- Any audio: `assets/sounds/ball-bounce.mp3` and `assets/sounds/break-sound.mp3` stay unused.
- Pause, main menu, settings.
- High scores or any persistence between sessions.
- Touch or mobile support.
- Build system, framework or automated tests.

---

## Data model

```js
// Constants (game.js)
const CANVAS_W = 800;
const CANVAS_H = 600;
const COLS = 10;
const ROWS = 6;
const LIVES = 3;
const POINTS_PER_BRICK = 10;
const ROW_COLORS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green']; // top to bottom

// Game state
const game = {
  status: 'ready',      // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: LIVES,
  paddle: { x, y, w, h },
  ball:   { x, y, r, vx, vy },
  bricks: [/* { x, y, w, h, color, alive } */],
};
```

Conventions:

- Origin at the top-left corner.
- Velocities in pixels per second, integrated with the frame delta time.
- Statuses: `ready` = ball stuck to the paddle waiting to be launched; `playing` = ball in play; `won` and `lost` = overlay visible.
- A brick with `alive = false` is neither drawn nor collided with.
- Indicative sizes, to be fixed during implementation: 72 × 24 px brick, 40 px side margin (10 × 72 + 2 × 40 = 800); paddle around 120 × 16 px; ball 16 × 16 px.

---

## Implementation plan

1. Create `index.html` with `<canvas id="game" width="800" height="600">`, load `assets/spritesheet.js` and `game.js` as classic scripts, and centre the canvas with minimal inline styling. Create `game.js` with the `requestAnimationFrame` loop, which clears the canvas and calls `loadSpritesheet`. Manual test: serving the root shows the canvas with no console errors.
2. Draw the paddle (`drawSprite(ctx, 'paddle', ...)`) and move it with the ←/→ and A/D keys, clamped to the canvas edges.
3. Add mouse control: the paddle follows the cursor's X coordinate over the canvas. Keyboard and mouse coexist and the latest input wins.
4. Add the ball in `ready` status, stuck to the centre of the paddle and following it. Space or click launches it upwards at a slightly tilted initial angle and switches to `playing`.
5. Implement ball movement with bounces off the side walls and ceiling. Crossing the bottom edge costs a life (step 8).
6. Implement ball–paddle collision: the exit angle depends on the impact point (centre = vertical, edges = up to 60° from the vertical) at constant speed. The ball always leaves upwards.
7. Build the 10 × 6 brick grid with `drawSprite(ctx, 'block_<color>', ...)` using `ROW_COLORS`, and the ball–brick collision: the brick gets `alive = false`, the ball flips `vx` or `vy` depending on the axis of least penetration, and 10 points are added. The ball advances in sub-steps per frame to avoid tunnelling through bricks.
8. Add the HUD (score and lives) and the lives logic: when the ball falls a life is deducted and status returns to `ready`; at 0 lives the status becomes `lost`.
9. Detect victory (no `alive` bricks) and switch to `won`. Draw the semi-transparent overlay with the text "You win!" or "Game Over", the final score and a restart hint. Space or click restarts the game (score, lives, bricks and ball).

---

## Acceptance criteria

- [ ] Served from the project root, `index.html` loads with no errors in the browser console.
- [ ] The canvas is exactly 800 × 600 px.
- [ ] On load, 60 bricks are visible in 10 columns × 6 rows, coloured per `ROW_COLORS` from top to bottom.
- [ ] The paddle moves with ← / → and A / D, and also by following the mouse over the canvas, without leaving the edges.
- [ ] At the start the ball is stuck to the paddle and follows it; space or click launches it.
- [ ] The ball bounces off the side walls and the ceiling, and keeps the same speed for the whole game.
- [ ] The paddle bounce angle changes with the impact point: centre exits vertically, edges exit tilted, never more than 60° from the vertical.
- [ ] Touching a brick makes it disappear immediately and the ball bounces.
- [ ] Each broken brick adds exactly 10 points and the HUD shows the total.
- [ ] The game starts with 3 lives; when the ball falls one is deducted, the ball returns to the paddle and waits for a new launch.
- [ ] Losing the third life shows the "Game Over" overlay with the final score.
- [ ] Breaking all 60 bricks shows the win overlay with the final score (600 points).
- [ ] From either overlay, space or click restarts the game with 3 lives, 0 points and all 60 bricks.
- [ ] The game makes no sound and loads no audio file (no requests to `assets/sounds/` in the network tab).
- [ ] In a normal game the ball does not pass through bricks or the paddle.

---

## Decisions

- **Yes:** a single fixed 10 × 6 level. It is what was asked for and keeps the MVP small.
- **Yes:** fixed 800 × 600 px canvas. User decision; avoids scaling logic.
- **Yes:** keyboard and mouse at the same time. User decision.
- **Yes:** three lives and 10 points per brick, with no bonuses. User decision.
- **Yes:** simple overlay for win and Game Over, with no title screen. User decision.
- **Yes:** simple, predictable bounce at constant speed, like classic Arkanoid. Interpreted as exit angle depending on the paddle impact point, which is what the original does; without it the trajectory would be almost fixed.
- **Yes:** classic scripts, `index.html` + `game.js`, alongside `assets/spritesheet.js`. No modules or build, consistent with `spritesheet.js` (global scope) and the `CLAUDE.md` rule not to add tooling without confirmation.
- **No:** ES modules. They require a server with correct MIME types and break the `spritesheet.js` pattern.
- **No:** several JS files split by responsibility. At this size a single `game.js` is simpler; split it in a future spec when it grows.
- **No:** speed increase, power-ups, `gray` bricks. They belong to later specs.
- **Yes (pending confirmation):** launch and restart with space or click. Not answered explicitly; the recommendation is taken.
- **No:** audio of any kind. User decision: no sound in the MVP, even though the assets already exist in the repo.
- **No:** brick explosion animation. User decision: bricks just disappear in the MVP.

---

## Risks

| Risk                                                    | Mitigation                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Ball tunnels through bricks or paddle at high speed     | Move the ball in sub-steps per frame, with a maximum displacement below the ball radius |
| Opening `index.html` via `file://` blocks the spritesheet | Document that it must be served from the project root, e.g. `python3 -m http.server`    |
| Ball stuck in an endless horizontal loop                | Guarantee a minimum vertical speed component after every bounce                         |

---

## What is **not** in this spec

- More than one level, or a level editor.
- Power-ups, multi-hit or indestructible bricks.
- Increasing ball speed.
- Brick explosion animation.
- Sound effects or music.
- Pause, main menu and settings.
- Persistent high scores.
- Touch or mobile support.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
