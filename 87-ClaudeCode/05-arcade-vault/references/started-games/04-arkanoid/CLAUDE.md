# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arkanoid game in plain HTML, CSS and JavaScript — no dependencies, zero frameworks. It opens directly in the browser (`open index.html`).

## Development

There is no build step and no server required. To test changes: `open index.html`.

## Architecture

### Main files

| File | Role |
|---|---|
| `index.html` | Entry point; loads the scripts and the 800×600 px `<canvas>` |
| `game.js` | All the game logic (state, loop, physics, render, HUD, overlays) |
| `levels.js` | Defines `LEVELS`: array of 5 levels with `blocks[]` and `ballSpeedMultiplier` |
| `assets/spritesheet.js` | Loads the spritesheet and exposes drawing helpers |

### Assets

- **`assets/spritesheet-breakout.png`** — single spritesheet with all the sprites
- **`assets/sounds/ball-bounce.mp3`** and **`assets/sounds/break-sound.mp3`** — sound effects

### `spritesheet.js` API

```js
loadSpritesheet(cb)                        // loads the image; calls cb when done
drawSprite(ctx, name, x, y, w, h)          // draws a sprite by name
drawFrame(ctx, frame, x, y, w, h)          // draws an animation frame
// Exported constants: SPRITES, EXPLOSION_FRAMES, EXPLOSION_DURATION
```

### Available sprites

| Name | Description |
|---|---|
| `paddle` | Paddle (162×14 px) |
| `ball` | Ball (16×16 px) |
| `block_gray`, `block_red`, `block_yellow`, `block_cyan`, `block_magenta`, `block_hotpink`, `block_green` | Blocks by color |

Explosions use `EXPLOSION_FRAMES[color]` (4 frames) and last `EXPLOSION_DURATION` ms.

### Game state (in `game.js`)

```js
gameState   // 'playing' | 'paused' | 'gameover' | 'win'
score       // number
lives       // number (starts at 3)
currentLevel // active level number (0-indexed over LEVELS)
paddle      // { x, y, w: 162, h: 14 }
ball        // { x, y, w: 16, h: 16, vx, vy }
blocks[]    // [{ x, y, w, h, color, alive }]
explosions[]// active animations
```

## Spec-driven workflow

This project uses spec-driven development. **Do not write code without an approved spec.**

### Commands

| Command | Action |
|---|---|
| `/spec [description]` | Designs a new spec, asking questions first. Saves to `specs/NN-slug.md` with status `Draft`. |
| `/spec-impl NN-slug` | Implements the approved spec step by step, creating branch `spec-NN-slug` and pausing after each step. |

### Spec lifecycle

```
Draft → Approved → Implemented
               ↘ Obsolete
```

The status is changed **manually** before running `/spec-impl`. Never implement a spec in `Draft` status.

### Spec structure (`specs/NN-slug.md`)

```markdown
# NN — Short title

- **Status:** Draft | Approved | Implemented | Obsolete
- **Date:** YYYY-MM-DD
- **Dependencies:** required previous specs
- **Objective:** a single sentence

## Scope
## Data model
## Implementation plan      ← numbered steps, each committable
## Acceptance criteria      ← boolean checklist
## Decisions                ← what was considered and why
## What this spec does NOT include
```

The full reference is in `.agents/skills/spec/template.md`.

### Existing specs

| # | Slug | Status |
|---|---|---|
| 01 | `mvp-arkanoid` | Implemented |
| 02 | `block-explosion-animation` | Implemented |
| 03 | `sounds-and-levels` | Implemented |

The next spec will be `04-...`.
