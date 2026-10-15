# SPEC 02 — Brick explosion animation

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-10-14
> **Objective:** When the ball destroys a brick, play the 4-frame explosion from `EXPLOSION_FRAMES` in the brick's colour instead of making it vanish instantly.

---

## Scope

**In:**

- On a brick hit, start a 150 ms explosion animation (`EXPLOSION_DURATION`) at the brick's position and size, using the 4 frames of its colour from `EXPLOSION_FRAMES`. These are the destruction sprites already in `assets/spritesheet-breakout.png`; nothing new is drawn or added to the assets.
- The exploding brick stops colliding the moment it is hit; the ball bounces as in SPEC 01.
- Score is added on the hit, not at the end of the animation.
- The win overlay appears only after the last explosion has finished.
- Restarting the game discards all active explosions.

**Out of scope (for future specs):**

- Any audio: `break-sound.mp3` and `ball-bounce.mp3` stay unused.
- Particles, screen shake or any effect other than the sprite frames.
- Multi-hit or indestructible bricks (`gray` stays unused).
- Changes to ball physics, scoring, lives or the HUD.
- Build system, framework or automated tests.

---

## Data model

```js
// game.js
// New field on the game state:
game.explosions = []; // { x, y, w, h, color, elapsed }  elapsed in ms, 0 → EXPLOSION_DURATION

// Frame selection (derived, not stored):
// index = Math.min( 3, Math.floor( elapsed / ( EXPLOSION_DURATION / 4 ) ) )  // ~37.5 ms per frame
```

Conventions:

- An explosion is created when a brick gets `alive = false`, copying the brick's `x`, `y`, `w`, `h` and `color`.
- `elapsed` advances with the frame delta time (in ms) and the explosion is removed once `elapsed >= EXPLOSION_DURATION`.
- Explosion frames are 32 × 16 px and are scaled to the brick size (72 × 24 px) by `drawFrame`.
- The `bricks` array and its `alive` flag keep their SPEC 01 meaning.

---

## Implementation plan

1. ✅ Add `game.explosions = []` to the game state and clear it in `resetGame()`. Manual test: the game still plays exactly as in SPEC 01.
2. ✅ In `bounceOffBricks()`, when a brick is destroyed, push `{ x, y, w, h, color, elapsed: 0 }` into `game.explosions` (the existing `alive = false`, score and bounce logic stay untouched).
3. ✅ Update explosions every frame with the delta time, independent of `game.status === 'playing'`, and drop those with `elapsed >= EXPLOSION_DURATION`. Losing a life does not clear them.
4. ✅ Draw explosions in `draw()` with `drawFrame( ctx, EXPLOSION_FRAMES[ color ][ index ], x, y, w, h )`, after the bricks and before the paddle, ball and overlay. Manual test: every destroyed brick shows its 4 frames in its own colour and then disappears.
5. ✅ Change the victory check: set `won` only when no brick is `alive` **and** `game.explosions` is empty. Ignore a lost ball (`loseLife`) while no brick is `alive`, so the 150 ms window cannot turn a cleared level into a Game Over.
6. ✅ Manual test of the full flow: clear the level, confirm the last explosion plays and the "You win!" overlay appears right after; restart mid-explosion and confirm no explosion remains.

---

## Acceptance criteria

- [x] Hitting a brick shows a 4-frame explosion at the brick's exact position and size, then the brick area is empty.
- [x] The explosion uses the frames of the destroyed brick's colour (a red brick explodes red, a green brick green, etc.).
- [x] The whole animation lasts 150 ms (±1 frame at 60 fps), with the 4 frames shown in order and for equal time.
- [x] The ball never collides with an exploding brick and passes through its area freely.
- [x] The ball still bounces off the destroyed brick on the hit, exactly as in SPEC 01.
- [x] Each brick adds exactly 10 points at the moment of the hit; the HUD updates immediately.
- [x] Several explosions can play at the same time without errors or visual glitches.
- [x] Destroying the last brick plays its explosion in full and the "You win!" overlay appears only afterwards, with a final score of 600.
- [x] Losing a life while explosions are running does not interrupt them.
- [x] Restarting the game mid-explosion leaves no explosion on screen and the grid has 60 fresh bricks.
- [x] The browser console shows no errors and no request to `assets/sounds/` is made.

---

## Decisions

- **Yes:** use only the existing explosion sprites from `assets/spritesheet-breakout.png`, via `EXPLOSION_FRAMES` and `drawFrame`. User decision; no new assets and no effects drawn by code.
- **Yes:** 150 ms total for the 4 frames (~37.5 ms each). User decision; matches the intent of `EXPLOSION_DURATION` and keeps the game snappy.
- **Yes:** the exploding brick stops colliding immediately. User decision; the hit is resolved on contact and the animation is purely visual.
- **Yes:** score is added on the hit. Keeps scoring logic from SPEC 01 unchanged.
- **Yes:** the win overlay waits for the last explosion. User decision; the final explosion stays visible.
- **Yes:** restart clears active explosions; losing a life does not. User decision.
- **Yes:** explosions live in a separate `game.explosions` list rather than extra states on bricks. Bricks keep the simple `alive` flag from SPEC 01 and collision code is not touched.
- **Yes:** ignore lost-ball events once no brick is alive. Avoids a Game Over in the 150 ms window before the win.
- **No:** audio. User decision: animation only; sound gets its own spec covering both assets.
- **No:** easing, fade-out or scale effects. The sprite frames are the whole effect.

---

## Risks

| Risk                                                               | Mitigation                                                                        |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Explosions freeze if the update only runs while `status` is `playing` | Update explosions in every frame regardless of status (step 3)                    |
| Ball falls during the final 150 ms and turns a win into Game Over  | Ignore `loseLife` when no brick is `alive` (step 5)                               |
| `EXPLOSION_FRAMES.gray` duplicates the red frames in the spritesheet | `gray` bricks are unused; revisit when indestructible/multi-hit bricks are specced |

---

## What is **not** in this spec

- Sound effects or music.
- Particles, shake or other visual effects.
- Multi-hit, indestructible or `gray` bricks.
- Changes to ball physics, scoring, lives or HUD.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
