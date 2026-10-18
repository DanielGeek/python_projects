# 02 — Block explosion animation

- **Status:** Implemented
- **Date:** 2026-05-08
- **Dependencies:** 01-mvp-arkanoid (base game implemented)
- **Objective:** Play the spritesheet explosion animation at the position of each destroyed block, while the game keeps running without pauses.

---

## Scope

### Inside the spec

- When a block is destroyed, launch an explosion animation at its coordinates
- The animation uses `EXPLOSION_FRAMES[color]` (4 frames) drawn with `drawFrame()`
  and lasts exactly `EXPLOSION_DURATION` (150 ms)
- Multiple explosions run in parallel with no limit
- The block stops existing for collisions at the very instant it is destroyed
- The animation is drawn over the empty space where the block was

### Out of scope

- Audio (break-sound.mp3, ball-bounce.mp3) — separate spec
- Additional particle effects
- Animation on the paddle when bouncing

---

## Data model

An array of active explosions is added in `game.js`:

```js
explosions = [
  {
    x, // x position of the destroyed block
    y, // y position of the destroyed block
    w, // block width (32)
    h, // block height (16)
    color, // block color — key into EXPLOSION_FRAMES
    elapsed, // ms elapsed since the start (starts at 0)
  },
];
```

When `elapsed >= EXPLOSION_DURATION`, the explosion is removed from the array.
No data is persisted between sessions.

---

## Implementation plan

1. **Initialize the `explosions` array** — declare `let explosions = []` next to the rest
   of the state variables in `game.js`.

2. **Launch an explosion when a block is destroyed** — at the collision point where
   `block.alive = false` is set, add to `explosions` an object with `{ x, y, w, h, color, elapsed: 0 }`.

3. **Update explosions in `update(dt)`** — iterate `explosions`, increment
   `elapsed += dt * 1000` (convert seconds to ms), remove the ones that exceed
   `EXPLOSION_DURATION`.

4. **Draw explosions in `draw()`** — iterate `explosions`, compute the current frame index
   with `Math.floor(elapsed / EXPLOSION_DURATION * 4)` (clamped to 3),
   call `drawFrame(ctx, EXPLOSION_FRAMES[color][frameIndex], x, y, w, h)`.
   Draw after the blocks and before the HUD.

---

## Acceptance criteria

- [x] When a block breaks, an animation appears at its position before it visually disappears
- [x] The animation runs through the 4 frames of `EXPLOSION_FRAMES[color]` in 150 ms
- [x] The explosion color matches the color of the destroyed block
- [x] The block no longer produces collisions from the instant it is destroyed
- [ ] Multiple simultaneous explosions can play without interfering with each other
- [x] When the animation ends (150 ms), the explosion is removed from the array and is no longer drawn
- [x] The game does not pause or lose smoothness during explosions

---

## Decisions taken and discarded

| Decision                         | Chosen                                  | Discarded                        | Reason                                   |
| -------------------------------- | --------------------------------------- | -------------------------------- | ---------------------------------------- |
| Collision during animation       | Block dies immediately                  | Block solid until animation ends | Avoids trapped-ball bugs                 |
| Limit of simultaneous explosions | No limit                                | Maximum N animations             | Unnecessary — few happen at once         |
| Audio on destruction             | Excluded                                | `break-sound.mp3`                | Out of scope, separate spec              |
| Frame drawing                    | `drawFrame()` already in spritesheet.js | Own implementation               | The asset and the function already exist |
