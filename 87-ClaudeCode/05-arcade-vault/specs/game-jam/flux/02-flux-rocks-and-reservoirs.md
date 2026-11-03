# SPEC GJ flux-02 — Flux rocks and reservoirs

> **Status:** Draft
> **Depends on:** SPEC GJ flux-01
> **Date:** 2026-11-02
> **Objective:** Extend Flux with fixed board cells from level 2 on, rocks that block placement and leak the flow, and reservoirs that the flow crosses three times slower, so each level asks for a different route, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ flux-01 ships the base game: a random source on an empty 10×7 grid, a queue of five pieces, a flow that speeds up, a longer length target and a shorter countdown each level. Past the first levels the only change is speed, and every board is the same empty field. The backlog asked for nothing beyond the base game, so this extension is a game-jam decision. It adds two fixed cells that follow from the rules already there:

- **Rocks.** From level 2, a few cells hold a rock. No piece can be placed on a rock, and the flow leaks if it runs into one. The player has to route around them.
- **Reservoirs.** From level 3, a few cells hold a fixed straight tank, horizontal or vertical. It cannot be replaced. The flow crosses it like a pipe, but it takes three times as long, so routing the flow through a tank buys time to build ahead.

Both keep the scoring of SPEC GJ flux-01 as the user described it: points per segment crossed plus the loop bonus. A reservoir counts as one segment and scores like one. Nothing new scores. Both use the `kind` field of a cell that SPEC GJ flux-01 keeps open for this.

This change lives in `public/games/flux/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `level`, `state`) keep their meaning. The catalog `description` and `controls` are not edited, to keep the `GAMES` entry out of this spec. The entry still reads as true, because it lists nothing the new cells contradict.

---

## Scope

**In:**

- Two new cell kinds in `game.js`, `'rock'` and `'tank'`: how many appear per level, where they are placed, and how they look.
- The changes to placing (both reject a piece) and to the flow (a rock leaks, a tank is crossed at a third of the speed).
- Pre-rendered sprites for the rock, the empty tank and the full tank, plus the per-frame fill of a tank.
- Manual tests and acceptance criteria for both.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description` and `controls` text.
- A new score source: a reservoir bonus, a rock bonus or a level-clear bonus.
- Other special cells (one-way pipes, teleports, bonus cells), sound, a new control and any other mode.
- Changing `games.max_score` (SPEC 18), since the score bound does not change.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ flux-01.

New top-level constants (`public/games/flux/game.js`):

```js
const MAX_ROCKS = 6; // rocks on a board from level 7
const MAX_TANKS = 3; // reservoirs on a board from level 7
const TANK_SLOWDOWN = 3; // a reservoir takes 3 × fillMs to cross
const PLACE_TRIES = 200; // random tries per fixed cell before it is skipped
```

Changes to existing data:

| Where              | SPEC GJ flux-01                                                  | This spec                                                                                                       |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cell `kind`        | `'source'` or `'pipe'`.                                          | Also `'rock'` (`{ kind: 'rock', mask: 0, flow: 0 }`) and `'tank'` (`{ kind: 'tank', mask: 10 or 5, flow: 0 }`). |
| Board build        | Empty grid plus the source.                                      | After the source, places `tankCount(level)` tanks, then `rockCount(level)` rocks, by the rules below.           |
| Placing            | Accepted on an empty cell or a `pipe` with `flow === 0`.         | Unchanged rule, so a `rock` or a `tank` rejects the piece with the red flash, like the source.                  |
| Entering a cell    | Valid only for a `pipe` with the right opening and free channel. | Also valid for a `tank` with the same checks. A `rock` is never valid, so entering it is a leak.                |
| Crossing a segment | `progress += delta / fillMs`.                                    | In a `tank`, `progress += delta / (fillMs × TANK_SLOWDOWN)`. Completing it counts as one segment, like a pipe.  |

Rules:

- **Counts.** `rockCount(level) = min(MAX_ROCKS, level - 1)`: 0 at level 1, 1 at level 2, 6 from level 7. `tankCount(level) = min(MAX_TANKS, floor((level - 1) / 2))`: 0 at levels 1 and 2, 1 at levels 3 and 4, 2 at levels 5 and 6, 3 from level 7.
- **Reserved cells.** No rock or tank is placed on the source or on any of its 8 neighbours, so the cell in front of the spout is always free and the first piece can always go there.
- **Tanks.** Each tank picks an orientation at random, horizontal (`mask` 10) or vertical (`mask` 5), and a random free cell that is not reserved. Both cells its openings face must be inside the grid and empty, so a tank can always be entered from either end. A tank never sits on the opening cell of another tank.
- **Rocks.** Each rock takes a random free cell that is not reserved, is not an opening cell of a tank, and does not touch another rock, diagonals included. That keeps every empty cell reachable from at least two sides.
- **Tries.** Each tank and each rock gets up to `PLACE_TRIES` random cells. If none fits, that cell is skipped and the board has one fewer. The build never loops forever.
- **Placing.** A rock or a tank under the cursor rejects Space: nothing changes, the queue does not move and the cursor flashes red for 200 ms, as on the source.
- **Rock and flow.** When the flow tries to enter a rock, it is a leak, like an empty cell: `leak` is the rock cell, `state = 'gameover'`, and the end screen draws the spill mark on the rock.
- **Tank and flow.** The flow enters a tank only through one of its two openings, and only once. It takes `fillMs × TANK_SLOWDOWN` milliseconds to cross. When it completes, `crossed` goes up by 1 and the score goes up by `10 × level`, exactly as for a pipe. It never gives a loop bonus. Entering a tank from its side, or a second time, is a leak.
- **Look.** A rock is a dark grey bevelled block with two cracks. A tank is a wide capsule on its axis with a gauge window, drawn darker than a pipe, and the flow fills it as a level that rises from the entry end to the exit end. The rock, the empty tanks (one per orientation) and the full tanks are drawn once into offscreen canvases at load, like the pipe sprites. Only the partial fill of the tank being crossed is drawn per frame, with a single `fillRect`. The frame loop adds no `shadowBlur`, no gradient and no allocation.
- **Levels and restart.** Rocks and tanks are part of the board, so they are placed again for each new level and for a new run, and never carry over.

Score bound: unchanged from SPEC GJ flux-01. A tank is one of the at most 30 segments of a level and gives no extra points, so a level is still worth at most `1,800 × level`. The clamp to 9,999,999 still applies, and a `games.max_score` set by SPEC 18 needs no change. The score stays an integer.

File layout:

```
public/games/flux/game.js     adds MAX_ROCKS, MAX_TANKS, TANK_SLOWDOWN, PLACE_TRIES, the rock and tank kinds, their placement, sprites and flow rules
```

No other file changes.

---

## Implementation plan

1. **Inspect before changing.** Check that SPEC GJ flux-01 is implemented: `public/games/flux/game.js` exists, `GAMES` has `flux`, and `npm test` passes. Manual test: `/game/flux/play` runs, and `grid[r][c].kind` reads `'source'` on the source cell in the console. If not, stop and report.
2. **Kinds and sprites.** Add the constants, the two kinds and the offscreen sprites for the rock and the tanks. Manual test: setting a few cells of `grid` from the console to a rock, a horizontal tank and a vertical tank draws them in place, and the frame rate stays smooth.
3. **Board build.** Add the counts, the reserved ring, the tank rule, the rock rule and the try limit to the board build. Manual test: in the console, set `level` to 1, 2, 3, 5 and 7 and let a level clear; each next board has the counts of the rule, no fixed cell is in the ring around the source, no two rocks touch, and every tank has two empty cells at its ends.
4. **Placing.** Make rocks and tanks reject Space. Manual test: Space on a rock or a tank flashes red and leaves the queue and the cell as they were.
5. **Flow rules.** Add the leak on a rock and the slow crossing of a tank. Manual test: a route into a rock shows `GAME OVER` with the spill on the rock; a route through a tank at level 3 takes about 5.3 s to cross it (3 × 1760 ms), adds 30 points and 1 to `LENGTH`; entering a tank from its side leaks.
6. **Pause and rank.** Pause with P and with the host while the flow is inside a tank, then play a run past level 3 to a leak. Manual test: the tank fill freezes and resumes; `message` events with `game: "flux"` keep a changing `score` and `level`, `over: true` at the leak, and `SCORE SAVED` shows. Delete the test row afterwards.

---

## Acceptance criteria

- [ ] Level 1 has no rocks and no tanks. Each later board has exactly `min(6, level - 1)` rocks and `min(3, floor((level - 1) / 2))` tanks, unless a cell was skipped after 200 tries.
- [ ] No rock or tank is ever on the source or on any of its 8 neighbours.
- [ ] No two rocks touch, diagonals included, and no rock is on the cell an opening of a tank faces.
- [ ] Both opening cells of every tank are inside the grid and empty when the board is built.
- [ ] Space on a rock or a tank changes nothing and flashes the cursor red.
- [ ] The flow running into a rock ends the run with `GAME OVER` and a spill mark on the rock.
- [ ] The flow crosses a tank only through its openings, takes `3 × fillMs` to do it, and adds exactly `10 × level` points and 1 to `crossed`.
- [ ] Entering a tank from its side, or a second time, is a leak.
- [ ] A tank never gives the loop bonus, and no other new score source exists.
- [ ] Rocks and tanks are placed again for each level and each run, and never carry over.
- [ ] The rock and tank sprites are pre-rendered, and the frame loop adds no `shadowBlur` and no gradient.
- [ ] The host pause and P freeze the flow while it is inside a tank.
- [ ] `score` stays an integer from 0 to 9,999,999, and `over` is still true only after a leak.
- [ ] `lib/games.ts`, `app/globals.css`, `public/games/bridge.js`, `supabase/migrations/`, `CLAUDE.md`, `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and the other games' folders have no edits (`git diff` is empty for them).
- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] A finished run past level 3 shows `SCORE SAVED` and appears in `/hall-of-fame` under `Flux`.

---

## Decisions

- **Yes:** one extension, rocks and reservoirs (game-jam decision). The backlog asked for nothing beyond the base game, and fixed cells give each level its own shape. **No:** sound, a speed-up key or touch work, which are out of scope or already covered by SPEC GJ flux-01.
- **Yes:** keep the user's scoring untouched: a tank scores as one segment and nothing new scores (game-jam decision, to respect "score per segment crossed plus a loop bonus"). **No:** a reservoir bonus, which would add a score source the user did not describe and raise the SPEC 18 bound.
- **Yes:** rocks from level 2 and tanks from level 3, capped at 6 and 3 (game-jam decision), so level 1 stays the plain tutorial board. **No:** hazards on every level.
- **Yes:** a rock leaks the flow, like an empty cell (game-jam decision). **No:** a rock that stops the flow without a leak, which would add a second way to end or stall a level.
- **Yes:** a tank takes three times as long (game-jam decision), so it is a choice between time and route length. **No:** a tank that holds the flow for a fixed delay, which would need a second timer.
- **Yes:** placement rules that keep the source ring free, tanks enterable from both ends and rocks apart (game-jam decision), so a board is never blocked at the start. **No:** a full path search to prove each board can reach `goal`, which costs more than the risk it removes.
- **Yes:** a try limit of 200 per fixed cell, then skip (game-jam decision), so the build always ends.
- **Yes:** fixed cells are rebuilt every level, so each run is comparable in shape though not identical.
- **Yes:** the extension edits only `public/games/flux/game.js`. **No:** a catalog, cover, migration or reader change.

---

## Risks

| Risk                                                                                                    | Mitigation                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.       | The reader and its globals do not change. Step 6 checks the messages by hand, and `lib/games.test.ts` still checks the reader exists.                                    |
| `over` is not true for every way the run ends, so the score is never saved.                             | A rock adds a leak case but not a new ending: it uses the same leak path. Step 5 tests it and step 6 plays a full run.                                                   |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                         | No new score source. A tank scores `10 × level` like a pipe, and the clamp of SPEC GJ flux-01 still applies.                                                             |
| The slow tank changes the pause behavior.                                                               | The tank uses the same `progress` and the same capped `performance.now()` deltas. Step 6 pauses with P and with the host while the flow is in a tank.                    |
| The `games` row is missing, so the foreign key rejects every score.                                     | Not touched by this spec. SPEC GJ flux-01 step 11 and the test in `lib/leaderboard.test.ts` cover it.                                                                    |
| Code that assumes a cell is a source or a pipe (drawing, placing, entering) breaks on a rock or a tank. | SPEC GJ flux-01 reads `kind` and `mask` everywhere. Step 2 draws both kinds, step 4 places on them and step 5 runs the flow into them.                                   |
| A board with six rocks and three tanks leaves no route long enough for `goal`.                          | The reserved ring, the rock spacing and the tank ends keep the board open, and 60 or more cells stay free for a `goal` of at most 30. Step 3 inspects boards at level 7. |
| The random placement never finds a valid cell and the build hangs.                                      | `PLACE_TRIES` caps the tries, and a cell that does not fit is skipped. A criterion allows the skip.                                                                      |
| A rock reads as a pipe at 375 px, and the player places into it by mistake.                             | The rock is a filled grey block with no openings, drawn unlike any pipe, and Space on it only flashes red.                                                               |
| Tanks make high levels too easy, since each one buys a lot of time at a short `fillMs`.                 | Accepted: at most three per board, and each still counts only one segment. Balance changes go in their own spec.                                                         |

---

## What is **not** in this spec

- A new catalog entry, migration, cover or reader.
- A new score source or a change to the scoring of SPEC GJ flux-01.
- Other special cells, extra modes, sound or a new control.
- Changes to the player, the leaderboard code, scores, credits or the bridge protocol.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
