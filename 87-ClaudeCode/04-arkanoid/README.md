# Arkanoid game

A browser-based Arkanoid (brick-breaker) game drawn on an HTML5 Canvas.

> **Status:** playable. Specs 01–08 are implemented (see `specs/`).

## How the game works

- **Start screen:** pick a difficulty. It sets the ball speed and the lives for the whole run.

  | Difficulty | Ball speed | Lives |
  |------------|------------|-------|
  | Easy       | 300 px/s   | 5     |
  | Normal     | 400 px/s   | 3     |
  | Hard       | 500 px/s   | 2     |

- **Paddle:** sits at the bottom and moves left and right.
- **Ball:** starts stuck to the paddle. It bounces off the walls, the ceiling, the paddle and the bricks. If it falls below the paddle, the player loses a life.
- **Bounce angle:** depends on where the ball hits the paddle. The center sends it straight up. The edges send it out at a sharper angle.
- **Bricks:** each hit breaks a brick with a 150 ms explosion animation and scores 10 points.
- **Levels:** three hand-made levels. Clearing one loads the next, keeping score and lives.
- **Win / lose:** clear level 3 to win. Lose all lives and the game is over. Either way, Space or a click returns to the start screen.
- **Sound:** a bounce sound on walls, ceiling and paddle, and a break sound on bricks.

## Controls

| Action | Keys |
|--------|------|
| Pick difficulty (start screen) | `1` `2` `3`, or arrows / `A` `D` then `Enter` / `Space` |
| Move the paddle | `←` `→`, `A` `D`, or the mouse |
| Launch the ball | `Space` or click |
| Pause / resume | `P` or `Esc` (the game also pauses when the window loses focus) |
| Mute / unmute | `M` |

A speaker icon and a controls guide are shown beside the canvas.

## Project structure

```
04-arkanoid/
├── README.md
├── CLAUDE.md                       # guidance for Claude Code
├── index.html                      # page, canvas, mute indicator and controls guide
├── game.js                         # game state, input, loop and drawing
├── levels.js                       # LEVELS layouts and LEVEL_COLORS
├── specs/                          # feature specs (01–08)
├── skills-lock.json                # pinned versions of the spec skills
├── assets/
│   ├── spritesheet-breakout.png    # sprite atlas
│   ├── spritesheet.js              # sprite coordinates and draw helpers
│   └── sounds/
│       ├── ball-bounce.mp3
│       └── break-sound.mp3
├── .agents/skills/                 # spec and spec-impl skills
└── .claude/skills/neko/            # /neko skill (cat-style replies)
```

## Assets

### Sprite sheet

`assets/spritesheet.js` is a plain browser script (no modules). It defines:

| Name | Description |
|------|-------------|
| `SPRITES` | Source rectangles `{ sx, sy, sw, sh }` for the `paddle`, the `ball` and the `blocks` of each color |
| `EXPLOSION_FRAMES` | Four explosion frames per brick color: `red`, `cyan`, `green`, `magenta`, `yellow`, `hotpink`, `gray` |
| `EXPLOSION_DURATION` | Length of the explosion animation: 150 ms |
| `drawSprite(ctx, name, x, y, w, h)` | Draws a sprite by name. Brick sprites use the `block_<color>` form, for example `block_red` |
| `drawFrame(ctx, frame, x, y, w, h)` | Draws one frame, for example an explosion frame |

Notes:

- Both draw functions draw nothing until the image has finished loading.
- The image path is relative (`assets/spritesheet-breakout.png`), so serve the page from the project root.

Example:

```js
drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );
drawSprite( ctx, 'block_red', brick.x, brick.y, 32, 16 );
drawFrame( ctx, EXPLOSION_FRAMES.red[ 0 ], brick.x, brick.y, 32, 16 );
```

### Sounds

| File | Intended use |
|------|--------------|
| `assets/sounds/ball-bounce.mp3` | Ball hits a wall or the paddle |
| `assets/sounds/break-sound.mp3` | A brick breaks |

## Development workflow

Features are planned with a spec-driven workflow. The skills come from `Klerith/fernando-skills`.

1. Run `/spec <one-sentence feature>`. Claude asks clarifying questions, then saves `specs/NN-slug.md` with state `Draft`.
2. Review the spec and mark it as Approved.
3. Run `/spec-impl NN-slug`. Claude creates the branch `<type>/NN-slug` (e.g. `feature/NN-slug`, `bugfix/NN-slug`) and implements the spec step by step, pausing to review diffs.

`AutoCreateBranch` in `specs/.spec-config.yml` controls whether the branch is created without asking.

## Running the game

There is no build step. Serve the project root with any static server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. The page must be served from the project root so the sprite sheet path resolves.
