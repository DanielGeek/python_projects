# SPEC GJ surge-02 — Surge power cells

> **Status:** Draft
> **Depends on:** SPEC GJ surge-01
> **Date:** 2026-10-23
> **Objective:** Extend Surge with two power cells that rise with the rows, an Overload that blasts a 3×3 area and a Breaker that holds the rise for a few seconds, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ surge-01 ships the base game: four colors, group clears worth `n²`, gravity, and a row that rises faster with every level. After a few levels the only change is speed, and a board full of scattered single cells has no way out. The user asked for nothing beyond the base game, so this extension is a game-jam decision. It adds two cells that follow from the rules already there, with no new control:

- **Overload.** A colorless cell. Space or Enter on it clears it and every block in the 3×3 area around it, whatever the color. It breaks up a board of single cells, the case where the base game has no move.
- **Breaker.** A colored cell with a switch mark. It clears as part of a normal group of its color, and when it does, the rise timer holds for 5 s. It gives the player a moment to build big groups, which the `n²` score rewards.

Both cells arrive in the preview row, so the player sees them coming. Both changes live in `public/games/surge/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `lives`, `level`, `state`) keep their meaning. The catalog `description` is not edited, to keep the `GAMES` entry out of this spec; it still reads as true, because it lists nothing these changes contradict.

---

## Scope

**In:**

- A new cell encoding in `grid` and `next` for the Overload and the Breaker.
- The spawn rule: at most one power cell per new preview row, never in the start rows.
- The Overload blast: the 3×3 area, the cascade when another Overload is in the area, the score and the gravity after it.
- The Breaker hold: when it starts, how long it lasts, how it stacks, and how the rise bar shows it.
- New top-level globals and constants, the drawing of both cells and of the hold, and the cached sprites for them.
- Manual tests and acceptance criteria for both.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description`, `controls` and `touch` text.
- A new control or key, sound, more colors, other power cells (row clear, color wipe), combo bonuses and column shifting.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ surge-01.

Cell encoding in `grid[row][col]` and `next[col]` (`public/games/surge/game.js`). The base values 0 to 3 and -1 keep their meaning:

| Value | Cell       | Color for the flood fill |
| ----- | ---------- | ------------------------ |
| -1    | Empty      | none                     |
| 0 - 3 | Plain cell | the value                |
| 4 - 7 | Breaker    | the value minus 4        |
| 8     | Overload   | none, never in a group   |

A helper `colorOf(v)` returns `v % 4` for `0 <= v <= 7` and -1 otherwise. The flood fill of SPEC GJ surge-01 compares `colorOf` instead of the raw value, so a Breaker joins the groups of its color.

New constants:

```js
const OVERLOAD = 8;
const OVERLOAD_CHANCE = 0.08; // chance that a new preview row holds one Overload
const BREAKER_CHANCE = 0.05; // chance that a new preview row holds one Breaker (checked after the Overload)
const HOLD_ADD = 5; // seconds of hold per Breaker cleared
const HOLD_MAX = 10; // the hold never goes above this
```

New top-level globals:

```js
let hold = 0; // seconds left of the Breaker hold, decreased by loop deltas in 'playing' only
let blastFx = []; // [{ col, row, t }] drawing only: the Overload flash, emptied when it fades
```

### Rules

- **Spawn.** Each time a new preview row is made, one random number `r` decides it: `r < OVERLOAD_CHANCE` puts one Overload in a random column, `r < OVERLOAD_CHANCE + BREAKER_CHANCE` turns one random cell into the Breaker of its color (value + 4), and anything else leaves the row plain. A row holds at most one power cell. The start rows of a run and the first preview row are plain.
- **Gravity.** Both power cells fall and rise like any block.
- **Overload.** Space or Enter with the cursor on an Overload clears a blast set: the Overload plus every non-empty cell in the 3×3 area centred on it, clipped to the board. When the set holds another Overload, its own 3×3 area joins the set, and so on until no new Overload is added. With `n` cells in the set, `score = Math.min(MAX_SCORE, score + n * n)`, as for a group. Then gravity runs once.
- **Breaker.** A Breaker counts as a cell of its color in the flood fill and in the score. For each Breaker cleared, by a group or by a blast, `hold = Math.min(HOLD_MAX, hold + HOLD_ADD)`.
- **Hold.** While `hold > 0` in `playing`, `riseClock` does not advance and `hold` decreases by the loop delta. When it reaches 0, `riseClock` continues from where it stopped. Clears, the cursor and the score work as usual during the hold. Both values advance from `performance.now()` deltas, so the host pause freezes them.
- **Ending.** Unchanged. The run ends only at a rise while a column has a block in row 0, and a hold delays that rise. An Overload in row 0 is a block like any other.
- **Restart.** A new run sets `hold = 0` and `blastFx = []`, with the other globals of SPEC GJ surge-01.

Score bound: a blast holds at most 120 cells, the size of the board, so it is worth at most 14,400, the same as the largest group in SPEC GJ surge-01. The `Math.min` cap and the integer score do not change.

Original look (canvas paths and gradients only, cached as in SPEC GJ surge-01):

- **Overload.** A dark cell with a white-cyan lightning bolt and a cracked border. Its core pulses by alpha with the loop time, not with `shadowBlur`.
- **Breaker.** The plain cell of its color with a small white switch lever over the glyph, so the color glyph stays readable.
- **Blast.** For 220 ms the cleared area flashes white and a ring of arcs spreads from each Overload in the set. Drawing only; it does not block input.
- **Hold.** The rise bar turns pale blue, stops filling and shows `HOLD` with the seconds left, for example `HOLD 4.2`.

Each sprite is built once. If the game has skins by then (the `skin-designer` agent runs after SPEC GJ surge-01 through `/spec-impl-game`), the new sprites are built for every skin and theme and cleared with the other cached sprites when the skin or theme changes.

The reader of SPEC GJ surge-01 does not change:

```js
surge: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
```

File layout:

```
public/games/surge/game.js     cell encoding, spawn, Overload blast, Breaker hold, drawing
```

---

## Implementation plan

1. **Encoding and flood fill.** Add `colorOf()` and make the flood fill and the drawing use it. Manual test: open `/games/surge/index.html`, set `grid[9][0] = 4` and a cyan cell next to it in the console, and clearing the pair adds 4 points, as two cyan cells did before. Plain games play as in SPEC GJ surge-01.
2. **Sprites.** Add the Overload and Breaker sprites to the cache. Manual test: with values 4 to 8 set in the console, each Breaker shows its color glyph with the lever, and the Overload shows the bolt and pulses.
3. **Spawn.** Add the spawn rule to the making of the preview row. Manual test: set both chances to 1 for a moment, and every new preview row holds exactly one Overload; set them back, and over a 5-minute run a few power cells appear, never two in one row and never in the start rows.
4. **Overload blast.** Add the blast set, the cascade, the score, the gravity and the flash. Manual test: an Overload in the middle of a full area clears 9 cells and adds 81, one in a corner clears 4 and adds 16, two Overloads side by side clear both areas in one press, and the blocks above fall.
5. **Breaker hold.** Add `hold`, the stop of `riseClock`, the stacking, and the `HOLD` bar. Manual test: clearing a group with one Breaker shows `HOLD 5.0` and no row rises for 5 s, a second Breaker during the hold raises it to at most 10, the rise bar then continues from where it stopped, and host Pause freezes the hold too.
6. **Restart and ending.** Reset `hold` and `blastFx` on a new run. Manual test: lose a run during a hold, press Space, and the new run starts with no hold and the rise bar empty. The host still receives `over: true` at game over and `SCORE SAVED` shows.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] The changes are only in `public/games/surge/game.js` (`git diff --stat` lists no other file).
- [ ] The start rows and the first preview row of a run hold no power cell.
- [ ] No preview row holds more than one power cell.
- [ ] A Breaker joins the flood fill as a cell of its color, and a group with a Breaker scores exactly `n²`.
- [ ] An Overload never joins a group, and Space or Enter on it clears it and every non-empty cell of the clipped 3×3 area around it.
- [ ] An Overload inside a blast adds its own 3×3 area to the same clear.
- [ ] A blast of `n` cells adds exactly `n²` points, and gravity runs after it.
- [ ] Each cleared Breaker adds 5 s of hold, and the hold never goes above 10 s.
- [ ] During a hold no row rises, and when it ends the rise bar continues from where it stopped.
- [ ] Host Pause freezes the hold and the rise bar, and Resume continues both.
- [ ] A new run starts with `hold = 0`.
- [ ] The run still ends only at a rise while a column has a block in row 0, and the host receives `over: true` then.
- [ ] `lib/games.ts`, `public/games/bridge.js`, `app/globals.css`, `supabase/migrations/`, `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and `components/ui/game.tsx` have no edits (`git diff` is empty for them).

---

## Decisions

- **Yes:** power cells as the extension (game-jam decision, because the user asked for nothing beyond the base game). **No:** sound, a pause key or touch on the canvas, which add no play and need assets or a new control.
- **Yes:** two cells, the Overload and the Breaker (game-jam decision). The Overload solves a board of single cells; the Breaker rewards building big groups. **No:** a row clear or a color wipe, which overlap with the Overload and would make the `n²` score swing too much.
- **Yes:** no new control: both cells use Space or Enter and the cursor of SPEC GJ surge-01 (game-jam decision). **No:** new keys, which would also need the bridge `KEYS` table and a new `touch` button.
- **Yes:** a blast of `n` cells scores `n²` like a group (game-jam decision), so the user's scoring rule stays the only one. **No:** a flat bonus per blast.
- **Yes:** the 3×3 area and the cascade between Overloads (game-jam decision). **No:** a bigger area, which would empty the board too fast.
- **Yes:** the chances 0.08 and 0.05 per row, the hold of 5 s per Breaker and the cap of 10 s (game-jam decisions), tunable in steps 3 and 5.
- **Yes:** power cells appear only in the preview row, so they are seen before they rise (game-jam decision). **No:** cells that change on the board.
- **Yes:** the hold stops `riseClock`, it does not reset it (game-jam decision), so a hold never skips the warning of the rise bar.
- **Yes:** the changes stay inside `game.js`. **No:** editing the catalog `description` or `controls`, a new migration, a new reader or a new cover.
- **Yes:** the `level` keeps its meaning of SPEC GJ surge-01, the rise speed. **No:** power cells that change with the level.

---

## Risks

| Risk                                                                                                 | Mitigation                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.    | The reader does not change and the globals keep their names. Step 6 checks the messages again.                                       |
| `over` is not true for every way the run ends, so the score is never saved.                          | The ending does not change. Step 6 plays a run to the end during a hold.                                                             |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                      | A blast scores `n²` with `n` at most 120, and the `Math.min` cap of SPEC GJ surge-01 stays.                                          |
| The hold does not freeze with the host pause, so it runs out while the game is paused.               | `hold` advances from the same loop deltas as `riseClock`. Step 5 checks it with host Pause.                                          |
| The `games` row is missing, so the foreign key rejects every score.                                  | This spec adds no game. The row from SPEC GJ surge-01 stays, and `lib/leaderboard.test.ts` still checks it.                          |
| The cascade loops forever on a board full of Overloads.                                              | Each cell joins the set once (a visited mark), so the cascade ends after at most 120 cells. Step 4 tests two Overloads side by side. |
| The Breaker lever hides the color glyph, and color-blind players lose the cue.                       | The lever sits beside the glyph, not over it. Step 2 checks all four colors.                                                         |
| Power cells make the game too easy, so runs never end.                                               | The rise still speeds up with the level, and the chances and the hold are constants tuned by play in steps 3 and 5.                  |
| The new sprites are drawn with `shadowBlur` every frame and slow the game.                           | They are cached as in SPEC GJ surge-01, and the Overload pulse uses alpha only.                                                      |
| Skins added after SPEC GJ surge-01 do not cover the new cells, or keep stale sprites after a change. | The sprites are built for every skin and theme and cleared with the rest of the cache when the skin or theme changes.                |
| The catalog `description` does not mention the power cells.                                          | Accepted: it lists nothing that contradicts them. A new copy would need an edit of `lib/games.ts` and its own spec.                  |

---

## What is **not** in this spec

- A new catalog entry, migration, reader or cover, and any edit of `lib/games.ts`.
- New keys or touch buttons, sound, more colors, other power cells, combo bonuses or column shifting.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
