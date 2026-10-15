# SPEC 04 — Multiple levels

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-10-14
> **Objective:** Replace the single fixed brick grid with three hand-made levels that advance automatically when a level is cleared, keeping score and lives, and show "You win!" only after the last level.

---

## Scope

**In:**

- A new file `levels.js` in the project root, next to `game.js`, holding `LEVELS` (3 hand-made brick layouts, each a 10-column grid defined as strings, one character per cell, empty cells allowed) and `LEVEL_COLORS`. `index.html` loads it with a plain `<script src="levels.js">` before `game.js`.
- Level 1 is the SPEC 01 grid (10 × 6, one colour per row). Levels 2 and 3 use other shapes with gaps.
- When the last brick of a level has exploded (SPEC 02), the next level loads automatically: new bricks, ball stuck to the paddle, status `ready`. Score and lives carry over.
- "You win!" appears only after the third level is cleared. Game Over behaves as before.
- Restart from an overlay returns to level 1 with score 0 and 3 lives.
- The HUD shows the current level ("Level N/3") between the score and the lives.

**Out of scope (for future specs):**

- Level editor, loading levels from files or generating them by rule.
- Level select, main menu or an extra "Level cleared" overlay.
- Ball speed or paddle changes per level (the ball keeps the SPEC 01 constant speed).
- Multi-hit or indestructible bricks (`gray` stays unused) and power-ups.
- Transition animation between levels.
- Persisting progress between sessions.
- Build system, framework or automated tests.

---

## Data model

```js
// levels.js (plain browser script, global scope, no modules; loaded before game.js)
const LEVELS = [
  [ // level 1: full grid, 60 bricks
    'rrrrrrrrrr',
    'yyyyyyyyyy',
    'cccccccccc',
    'mmmmmmmmmm',
    'hhhhhhhhhh',
    'gggggggggg',
  ],
  [ // level 2: diamond, 38 bricks
    '....rr....',
    '...yyyy...',
    '..cccccc..',
    '.mmmmmmmm.',
    'hhhhhhhhhh',
    '.gggggggg.',
  ],
  [ // level 3: frame with gaps, 40 bricks
    'rrrrrrrrrr',
    'y........y',
    'c.mmmmmm.c',
    'c.hhhhhh.c',
    'y........y',
    'gggggggggg',
  ],
];

const LEVEL_COLORS = { r: 'red', y: 'yellow', c: 'cyan', m: 'magenta', h: 'hotpink', g: 'green' };
```

```js
// game.js: new field on the game state
game.level = 0; // index into LEVELS
```

Conventions:

- `levels.js` only declares data (`LEVELS`, `LEVEL_COLORS`); it contains no logic. `game.js` reads both as globals, like it does with `SPRITES` from `assets/spritesheet.js`.
- `index.html` script order is `assets/spritesheet.js`, `levels.js`, `game.js`.
- `.` is an empty cell; any other character must exist in `LEVEL_COLORS`.
- Every row has exactly `COLS` (10) characters. Brick size, margin and `BRICK_TOP` stay as in SPEC 01.
- `buildBricks( level )` replaces the current `buildBricks()` and returns the same `{ x, y, w, h, color, alive }` objects. `ROW_COLORS` and `ROWS` are removed if nothing else uses them.
- `game.status` keeps the SPEC 01 values; no new status is added.
- Maximum score for a full game: (60 + 38 + 40) × 10 = 1380.

---

## Implementation plan

1. Create `levels.js` with `LEVELS` and `LEVEL_COLORS`, and add `<script src="levels.js"></script>` to `index.html` between `assets/spritesheet.js` and `game.js`. Add `game.level` in `game.js`. Change `buildBricks` to take a level index and build bricks from its grid, skipping `.`. Initial state and `resetGame()` use level 0. Manual test: the game looks and plays exactly as in SPEC 02 (60 bricks, 600 points to clear).
2. Add `loadLevel( index )`: sets `game.level`, rebuilds `game.bricks`, clears `game.explosions`, zeroes the ball velocity, sets status `ready` and sticks the ball to the paddle. Make `resetGame()` reset score and lives and call `loadLevel( 0 )`. Manual test: restart from an overlay returns to the level 1 grid.
3. Change the victory check in `update()`: when no brick is `alive` and `game.explosions` is empty, call `loadLevel( game.level + 1 )` if another level exists, otherwise set `won`. Manual test: clearing level 1 shows level 2 with the ball on the paddle and the score kept.
4. Draw "Level N/3" centred in the HUD at the same height as score and lives. Manual test: the text updates on every level change and does not overlap score or lives.
5. Manual test of the full flow: clear all 3 levels and confirm the win overlay shows a final score of 1380; lose a life on level 2 and confirm the layout stays as it was and lives carry over; lose all lives on level 3 and confirm Game Over, then restart to level 1 with 3 lives and 0 points.

---

## Acceptance criteria

- [x] On load, level 1 shows 60 bricks in 10 × 6, coloured per row exactly as in SPEC 01.
- [x] `LEVELS` and `LEVEL_COLORS` are defined in `levels.js`, loaded from `index.html` before `game.js`, and `game.js` contains no level grids.
- [ ] Level 2 shows the 38-brick diamond and level 3 the 40-brick frame, with the layouts and colours defined above.
- [ ] Destroying the last brick of a level plays its full explosion and then loads the next level, with the ball stuck to the paddle in `ready` status.
- [ ] Score and lives are unchanged by the level change.
- [ ] The next level starts only after the last explosion has finished; no explosion from the previous level remains.
- [ ] The ball falling while the last brick of a level is exploding does not cost a life or cause Game Over (SPEC 02 rule still holds).
- [ ] "You win!" appears only after level 3 is cleared, with a final score of 1380 if no brick is missed.
- [ ] Losing a life keeps the current level and its remaining bricks.
- [ ] Losing the third life shows "Game Over" on any level; restart goes to level 1 with 3 lives, 0 points and 60 bricks.
- [ ] The HUD shows "Level 1/3", "Level 2/3" and "Level 3/3" at the right moments.
- [ ] Ball speed is the same in all levels.
- [ ] The browser console shows no errors.

---

## Decisions

- **Split:** levels live in their own spec, not in SPEC 03. User decision; sound and levels are different domains, so each gets a smaller diff.
- **Yes:** 3 hand-made levels defined in code. User decision; full control over shapes with no generator or file loading.
- **Yes:** grids as string arrays with a colour letter per cell. Readable in the source and trivial to edit.
- **Yes:** levels in their own `levels.js`, not in `game.js`. User decision; level data is edited on its own and `game.js` stays logic only.
- **Yes:** `levels.js` is a plain global script in the project root. Same convention as `assets/spritesheet.js`; no modules or build system.
- **No:** ES modules (`import`/`export`) for levels. They would change how `game.js` loads and need a module-capable setup; out of scope.
- **Yes:** auto-advance keeping score and lives. User decision; no extra overlay or lives reset.
- **Yes:** "You win!" only after the last level. User decision.
- **Yes:** only the layout changes between levels. User decision; keeps the SPEC 01 exclusion on speed increase.
- **Yes:** reuse the `ready` status for the start of each level. No new status, so launch logic and overlays stay untouched.
- **Yes:** the HUD shows "Level N/3". Not asked explicitly; recommendation taken so the player knows the progress.
- **No:** level select, level editor, transitions or per-level music. Each belongs in its own spec.
- **No:** `gray`/multi-hit bricks in any level. Still out of scope as in SPEC 01 and SPEC 02.

---

## Risks

| Risk                                                              | Mitigation                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A typo in a grid (wrong row length or unknown letter) breaks the level | `buildBricks` throws a clear error for an unknown letter; check row length in manual test |
| Ball trapped in a closed pocket of level 3 with no way out          | Level 3 has no enclosed pockets; verify by playing it                            |
| Level change in the middle of the 150 ms explosion window            | Load the next level only when `game.explosions` is empty (step 3)                |
| `ROWS` / `ROW_COLORS` removed while still referenced                 | Search `game.js` for both names before deleting them                             |
| `levels.js` loaded after `game.js` or missing, so `LEVELS` is undefined | Script order in `index.html` is fixed in step 1; the console error shows it at once |

---

## What is **not** in this spec

- Level editor, file-loaded or generated levels.
- Level select, main menu or an extra "Level cleared" overlay.
- Ball speed or other difficulty changes per level.
- Multi-hit, indestructible or `gray` bricks, power-ups.
- Transition animations.
- Persistence of progress.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
