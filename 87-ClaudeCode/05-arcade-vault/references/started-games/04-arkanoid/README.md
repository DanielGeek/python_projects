# Arkanoid

Arkanoid game in plain HTML, CSS and JavaScript — no dependencies, zero frameworks.

## Play

Open `index.html` directly in the browser. It needs no server and no build.

## Controls

| Action         | Key / Input                      |
| -------------- | -------------------------------- |
| Move paddle    | Mouse or ← →                     |
| Pause / resume | P or Escape                      |
| Jump to level  | Buttons 1–5 in the pause overlay |

## Features

- 800×600 px canvas with sprites from the spritesheet
- Paddle, ball and collisions with basic physics
- 3 lives — when the ball falls, one life is deducted and the ball is repositioned
- Score accumulated across the 5 levels (10 pts per block)
- HUD with score, lives and current level
- 5 levels with different block patterns
- The ball speeds up 10 % per level (level 5 ≈ +46 % vs level 1)
- Explosion animation when a block is destroyed (4 spritesheet frames)
- Sound effects on bounces and when breaking blocks
- Pause overlay with a level selector
- Game Over and victory overlays ("You beat the game!")

## Levels

| Level | Pattern               | Speed |
| ----- | --------------------- | ----- |
| 1     | Full 10×6 grid        | ×1.0  |
| 2     | Centered pyramid      | ×1.1  |
| 3     | Checkerboard          | ×1.21 |
| 4     | Rows with gaps        | ×1.33 |
| 5     | Frame + central cross | ×1.46 |

## Project structure

```
index.html          # entry point
game.js             # game logic (state, loop, physics, render)
levels.js           # definition of the 5 levels (LEVELS)
assets/
  spritesheet-breakout.png
  spritesheet.js    # drawSprite / drawFrame helpers
  sounds/
    ball-bounce.mp3
    break-sound.mp3
specs/              # design specs (spec-driven workflow)
```

## Implemented specs

| #   | Spec                                              | Status      |
| --- | ------------------------------------------------- | ----------- |
| 01  | Playable MVP (paddle, ball, blocks, lives, score) | Implemented |
| 02  | Explosion animation when breaking blocks          | Implemented |
| 03  | Sounds and 5 levels with a selector in the pause  | Implemented |
