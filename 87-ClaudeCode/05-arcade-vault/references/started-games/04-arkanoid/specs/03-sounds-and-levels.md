# 03 — Sounds and levels

- **Status:** Implemented
- **Date:** 2026-05-08
- **Dependencies:** 01-mvp-arkanoid, 02-block-explosion-animation
- **Objective:** Add sound effects (bounce and block destruction) and 5 levels with different block patterns, increasing ball speed (+10 % per level) and a level selector reachable from the pause (P / Escape key).

---

## Scope

### Inside the spec

- Play `ball-bounce.mp3` when the ball bounces off walls and the paddle
- Play `break-sound.mp3` when a block is destroyed
- No volume control — always on at the browser's default volume
- 5 levels with different block patterns and their own color palettes
- The base ball speed increases by a cumulative 10 % per level
  (level 1 = base, level 5 ≈ +46 %)
- When all blocks of a level are cleared, the next one starts automatically
- When level 5 is completed, a "You beat the game!" overlay appears
- Pause with the P or Escape key: semi-transparent overlay with buttons 1–5
  to jump directly to any level
- When jumping to a level from the pause, the ball speed matches that level
  (it does not always start from the base)
- The score accumulates across levels

### Out of scope

- Volume control or mute
- More than 5 levels
- Power-ups
- Persisting progress between sessions
- Background music
- Transition animation between levels
- High scores

---

## Data model

### New state variables in `game.js`

```js
currentLevel; // number, 1–5, starts at 1
bounceSound; // HTMLAudioElement — loaded at startup
breakSound; // HTMLAudioElement — loaded at startup
```

### Level definition

Static `LEVELS` array (constant in `levels.js`), one object per level:

```js
LEVELS = [
  {
    speed: 1.0, // base speed multiplier (vx/vy × speed)
    blocks: [
      // array of { col, row, color } — occupied cells only
      { col: 0, row: 0, color: 'red' },
      // ...
    ],
  },
  // levels 2–5...
];
```

The 5 patterns:

| Level | Pattern       | Description                                          |
| ----- | ------------- | ---------------------------------------------------- |
| 1     | Full grid     | Filled 10×6 (same as the MVP), colors per row        |
| 2     | Pyramid       | Centered rows that narrow towards the top            |
| 3     | Checkerboard  | Blocks at even (col+row) positions                   |
| 4     | Rows with gaps | 6 rows with 3–4 random missing blocks per row       |
| 5     | Frame + cross | Blocks only on the edge of the area and a central cross |

Speeds: level 1 = ×1.0, level 2 = ×1.1, level 3 = ×1.21, level 4 = ×1.33, level 5 = ×1.46.

### Pause state

```js
isPaused; // boolean, starts at false
```

---

## Implementation plan

1. **Load sounds** — at the top of `game.js`, create two `HTMLAudioElement`s pointing to
   `assets/sounds/ball-bounce.mp3` and `assets/sounds/break-sound.mp3`, assign them to
   `bounceSound` and `breakSound`.

2. **Play sounds** — in `update(dt)`:

   - Where the ball bounces off walls or the paddle: call `bounceSound.cloneNode().play()`
   - Where `block.alive = false` is set: call `breakSound.cloneNode().play()`
   - Use `cloneNode()` to allow simultaneous sounds to overlap.

3. **Define `LEVELS`** — declare the static array with the 5 level objects
   (patterns and speed multipliers) in a separate `levels.js` file,
   and include it in `index.html` before `game.js`.

4. **`loadLevel(n)` function** — receives the level number (1–5), rebuilds the `blocks`
   array from `LEVELS[n-1].blocks`, repositions the ball on the paddle,
   applies `vx * speed` and `vy * speed` using the base speed, and updates
   `currentLevel = n`.

5. **Automatic level advance** — in `update(dt)`, when all blocks have
   `alive: false`: if `currentLevel < 5` call `loadLevel(currentLevel + 1)`;
   if `currentLevel === 5` switch to `gameState = 'win'` with the message
   "You beat the game!".

6. **Pause** — add a listener for the P and Escape keys that toggles `isPaused`.
   In the game loop, if `isPaused === true` skip `update(dt)` but keep
   calling `draw()` to render the overlay.

7. **Pause overlay** — in `draw()`, when `isPaused === true` draw over the
   canvas: semi-transparent background, "PAUSED" text and 5 centered numbered buttons.
   When a button is clicked: call `loadLevel(n)` and disable the pause.

8. **Level HUD** — in `draw()`, show the current level next to the score and the lives
   while `gameState === 'playing'`.

---

## Acceptance criteria

- [x] When the ball bounces off a wall or the paddle, `ball-bounce.mp3` plays
- [x] When a block is destroyed, `break-sound.mp3` plays and `ball-bounce.mp3` does not
- [x] Two sounds can play at the same time without one cancelling the other
- [x] Level 1 shows the full 10×6 grid
- [x] Level 2 shows a centered pyramid pattern
- [x] Level 3 shows a checkerboard (even positions occupied)
- [x] Level 4 shows rows with gaps
- [x] Level 5 shows a frame with a central cross
- [ ] Each level has a color palette different from the others
- [ ] When all blocks of a level are cleared, the next one loads automatically
- [ ] The ball is noticeably faster on level 5 than on level 1
- [ ] When level 5 is completed the "You beat the game!" overlay appears
- [ ] The P and Escape keys pause and resume the game
- [ ] During the pause the game does not advance (ball and blocks frozen)
- [ ] The pause overlay shows 5 numbered buttons
- [ ] Pressing a level button in the pause loads that level with its correct speed
- [ ] The HUD shows the current level at all times during the game
- [ ] The score accumulates correctly when moving from one level to another

---

## Decisions taken and discarded

| Decision                  | Chosen                                    | Discarded                        | Reason                                                       |
| ------------------------- | ----------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| Simultaneous sounds       | `cloneNode().play()`                      | Reuse a single `Audio` per sound | A single element cancels itself if the sound has not ended   |
| Volume control            | No control — default volume               | Slider or mute key               | Out of scope, adds complexity without clear value            |
| Level definition          | Static `LEVELS` array in `levels.js`      | External JSON file               | No build or server; JSON would require an async fetch        |
| Speed per level           | Multiplier over base speed (+10 %)        | Different fixed speed per level  | More predictable and easier to tune                          |
| Pause                     | P and Escape toggle `isPaused`            | Only one key                     | Two keys cover different player conventions                  |
| Level selector            | Numeric buttons in the pause overlay      | Separate main menu               | Reuses the existing overlay; reachable without leaving the game |
| Speed when jumping levels | Speed of the chosen level                 | Always base speed                | Consistency — makes it easier to test the level as it would be played |
| Transition between levels | Immediate (direct load)                   | Animation or intermediate screen | Out of scope; the animation deserves its own spec            |
| Score when changing level | Accumulates across levels                 | Resets per level                 | More motivating; consistent with the current HUD             |
