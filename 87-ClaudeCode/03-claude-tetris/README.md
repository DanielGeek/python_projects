# Tetris

Implementation of the classic **Tetris** in vanilla JavaScript, using HTML5 Canvas and CSS. No external dependencies, no frameworks, no build step: just open and play.

![Tech](https://img.shields.io/badge/HTML5-Canvas-orange)
![Tech](https://img.shields.io/badge/CSS3-blueviolet)
![Tech](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

---

## Table of contents

- [Tetris](#tetris)
  - [Table of contents](#table-of-contents)
  - [What the project does](#what-the-project-does)
  - [How to run the game](#how-to-run-the-game)
    - [Option 1: open the file directly](#option-1-open-the-file-directly)
    - [Option 2: local server (recommended)](#option-2-local-server-recommended)
  - [Controls](#controls)
  - [How it works](#how-it-works)
    - [1. `index.html`](#1-indexhtml)
    - [2. `style.css`](#2-stylecss)
    - [3. `game.js`](#3-gamejs)
    - [Game flow](#game-flow)
  - [Technologies](#technologies)
  - [Project structure](#project-structure)
  - [Customization](#customization)
  - [License](#license)

---

## What the project does

A playable version of classic Tetris with all the mechanics you would expect:

- **10 × 20** cell board.
- The **7 standard pieces** (I, O, T, S, Z, J, L) with distinct colors.
- **Rotation** with basic _wall kicks_ (small offsets so a piece can rotate next to a wall).
- **Soft drop** (faster fall) and **hard drop** (instant fall).
- **Ghost piece**: shows where the current piece will land.
- **Preview** of the next piece.
- Classic Tetris **scoring system** (100 / 300 / 500 / 800 multiplied by level).
- **Levels** that increase every 10 lines and speed up the fall.
- **Pause** and **Game Over** with a restart option.
- **Light / dark theme toggle** (top-right button). Dark is the default; the choice is remembered in `localStorage`.

---

## How to run the game

Nothing to install or compile. You have two options:

### Option 1: open the file directly

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Option 2: local server (recommended)

Any static server works. Some examples:

```bash
# With Python 3
python3 -m http.server 8000

# With Node.js (npx)
npx serve .

# With PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

---

## Controls

| Key       | Action                      |
| --------- | --------------------------- |
| `←` / `→` | Move the piece horizontally |
| `↑` or `X` | Rotate the piece clockwise |
| `↓`       | Soft drop (fall faster)     |
| `Space`   | Hard drop (instant fall)    |
| `P`       | Pause / resume              |

---

## How it works

The game is made of three cooperating files:

### 1. `index.html`

Defines the visual structure:

- A **300 × 600** pixel `<canvas id="board">` where the board is rendered.
- A side panel with `SCORE`, `LINES`, `LEVEL`, the next-piece preview and the controls list.
- An overlay for the **PAUSED** and **GAME OVER** states.

### 2. `style.css`

Provides the _dark / retro arcade_ look: dark background, monospaced font for the counters and _backdrop blur_ on the overlays.

### 3. `game.js`

Contains all the game logic. In broad strokes:

- **Board model**: a `ROWS × COLS` matrix where each cell holds `0` (empty) or a color index (1–7) identifying the piece.
- **Pieces**: defined as square matrices. Rotation is computed as transpose + row reversal (`rotateCW`).
- **Collision detection** (`collide`): checks that no piece cell leaves the board or overlaps already locked blocks.
- **Wall kicks** (`tryRotate`): if the rotation collides, it tries shifting the piece ±1 and ±2 columns before discarding the turn.
- **Game loop** (`loop`): based on `requestAnimationFrame`, accumulates elapsed time and moves the piece down one row when `dropInterval` is exceeded.
- **Line clearing** (`clearLines`): scans the board bottom to top; each full row is removed and an empty one is inserted at the top.
- **Scoring**: uses the classic `[0, 100, 300, 500, 800]` table multiplied by the current level; hard drop adds 2 points per cell and soft drop 1 point per row.
- **Level and speed**: level rises every 10 lines; fall speed is `max(100, 1000 − (level − 1) × 90)` milliseconds.
- **Ghost piece** (`ghostY`): projects the final position of the current piece downward and draws it with `globalAlpha = 0.2`.

### Game flow

```
init()
  ├─ createBoard()                  → empty matrix
  ├─ next = randomPiece()
  ├─ spawn()                        → moves next to current and generates a new next
  └─ requestAnimationFrame(loop)
        ↓
   loop(timestamp)
     ├─ accumulates dt
     ├─ if dt ≥ dropInterval → moves piece down or calls lockPiece()
     ├─ draw()  (grid + board + ghost + current piece)
     └─ requestAnimationFrame(loop)

   keydown → move / rotate / soft-drop / hard-drop / pause
```

When a newly spawned piece already collides on appearing (`spawn`), `endGame()` fires and the **Game Over** overlay is shown.

---

## Technologies

- **HTML5** — markup and two `<canvas>` elements (board and preview).
- **CSS3** — _flexbox_, color variables, `backdrop-filter` and `box-shadow`.
- **Vanilla JavaScript (ES6+)** — `const`/`let`, _arrow functions_, _spread operator_, `Array.from`, _template literals_…
- **Canvas 2D API** — for all game rendering.
- **`requestAnimationFrame`** — for the browser-synchronized game loop.

**No dependencies.** No `package.json`, no bundler, no transpiler.

---

## Project structure

```
03-tetris/
├── index.html      # DOM structure and canvas
├── style.css       # Game styles (dark theme)
├── game.js         # All the Tetris logic (~300 lines)
└── README.md
```

---

## Customization

Some parameters that are easy to tweak in `game.js`:

| Constant       | Meaning                                  | Default               |
| -------------- | ---------------------------------------- | --------------------- |
| `COLS`         | Board columns                            | `10`                  |
| `ROWS`         | Board rows                               | `20`                  |
| `BLOCK`        | Size in pixels of each cell              | `30`                  |
| `COLORS`       | Color palette per piece type             | 7 colors              |
| `LINE_SCORES`  | Points for clearing 1, 2, 3 or 4 lines   | `[0,100,300,500,800]` |
| `dropInterval` | Initial fall speed in ms                 | `1000`                |

> If you change `COLS`, `ROWS` or `BLOCK`, remember to also adjust the `width` and `height` of `<canvas id="board">` in `index.html` so they match (`COLS × BLOCK` × `ROWS × BLOCK`).

---

## License

Free-to-use project for educational and practice purposes.
