# SPEC GJ prism-02 — Prism spectrum gem

> **Status:** Draft
> **Depends on:** SPEC GJ prism-01
> **Date:** 2026-10-23
> **Objective:** Extend Prism with a rare single spectrum gem that, when it lands on a gem, clears every gem of that color in the well, so a crowded well has an escape and a big chain has a setup, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ prism-01 ships the base game: triplets of five colors, matches in four directions, chains and an overflow ending. After a few levels the only change is speed, and a bad stack has no way out except luck. The user asked for nothing beyond the base game, so this extension is a game-jam decision: it adds one special piece that follows from the rules already there.

- **Spectrum gem.** Every tenth piece is not a triplet but a single rainbow gem. It falls, moves and drops like any piece. When it lands on a gem, it clears every gem in the well that has the color of the gem under it. The clear then runs through the same gravity and chain steps as any other clear.

It gives the player a choice about where to land it, and a reason to leave a color untouched in the well. It uses the `piece.gems` array that SPEC GJ prism-01 keeps open for this.

This change lives in `public/games/prism/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `level`, `state`) keep their meaning. The catalog `description` and `controls` are not edited, to keep the `GAMES` entry out of this spec; the entry still reads as true because it lists nothing the gem contradicts.

---

## Scope

**In:**

- A spectrum piece in `game.js`: when it appears, what it looks like, how it moves and how it locks.
- The clear rule of the gem: which gems it removes, what it scores and how it joins the chain.
- A preview of the gem in the `NEXT` panel.
- Two new top-level globals (`pieceCount`, `SPECTRUM_EVERY`) and a `kind` field in `piece` and `nextPiece`.
- Manual tests and acceptance criteria for both.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description` and `controls` text.
- Sound, a new control, more special gems, garbage rows and any other mode.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ prism-01.

New top-level globals (`public/games/prism/game.js`):

```js
const SPECTRUM = 5; // color index of the spectrum gem; never written to grid
const SPECTRUM_EVERY = 10; // every tenth piece of a run is a spectrum gem
let pieceCount = 0; // pieces spawned in the run, reset on restart
```

Changes to existing data:

| Where                         | SPEC GJ prism-01                          | This spec                                                                                         |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `piece`, `nextPiece`          | `{ col, row, gems }` / `{ gems }`         | Both also have `kind`: `'triplet'` (3 gems) or `'spectrum'` (1 gem, `gems` is `[SPECTRUM]`).       |
| Spawn                         | Draws `nextPiece`, makes a new triplet.   | Increments `pieceCount`; when `(pieceCount + 1) % SPECTRUM_EVERY === 0` the new `nextPiece` is a spectrum gem. |
| Spawn cells                   | Rows 0, 1 and 2 of column 2.              | A spectrum gem uses only row 0 of column 2. If it is occupied, the run ends.                       |
| ↑ (cycle)                     | Rotates the three gems.                   | Does nothing for a spectrum gem.                                                                  |
| Lock                          | Writes the gems and scans for matches.    | A spectrum gem is not written to `grid`; it triggers the spectrum clear first (see below).         |

Rules:

- **Appearance.** `pieceCount` counts every piece that spawns, starting at 1 for the first. `nextPiece` is chosen when the current piece spawns, so a spectrum gem shows in the `NEXT` panel one piece ahead. Piece 10, 20, 30… are spectrum gems. Piece 1 to 9 are triplets.
- **Movement.** A spectrum gem moves with ← →, falls with the same `fallInterval`, soft drops with ↓ and hard drops with Space, with the same points per row. Its collision loops over `piece.gems`, which has one entry, so it is blocked by gems and walls like any piece.
- **Look.** The gem is drawn as a rounded square with a white border, filled with a gradient that cycles through the five gem colors, using `performance.now()` for the phase. A strip of the five gem colors is pre-rendered once, like the gem sprites, and `drawImage` slices it by the phase. The frame loop builds no gradient and uses no `shadowBlur`.
- **Locking.** The gem locks when a tick cannot move it down, or on a hard drop. Let `(r, c)` be its cell and `below = grid[r + 1][c]`.
  - If `r + 1` is outside the well (the gem is on the floor), it disappears with no clear and no score. The scan for ordinary matches still runs, but nothing changed, so the next piece appears.
  - If `below` is a gem of color `k`, it is a spectrum clear.
- **Spectrum clear.** Every gem in `grid` of color `k` is marked, plus nothing else. `marks` is set to those cells, `chain` becomes 1 and the state becomes `resolving`, so the gems flash, are removed and the rest settle with the same phases and times as an ordinary clear. The spectrum gem itself is never in the grid, so it is not counted in `marks`.
- **Scoring and levels.** The clear scores `marks.length × 10 × chain × level` like any chain step, and adds `marks.length` to `cleared`. After the settle, the grid is scanned in the usual way: any new run is chain 2, 3 and so on, with the same formula. There is no extra bonus.
- **Ending.** The overflow check of SPEC GJ prism-01 runs after the chain finishes. A spectrum gem that lands on a stack that reaches row 0 does not save the run by itself: only the gems it clears count. The ending is the same one rule, so `over` keeps its meaning.
- **Restart.** `pieceCount` is reset to 0 with the other globals when a run starts.

Score bound: the clear removes at most the 77 gems that can be in a well of 78 cells, so one step is at most `77 × 10 × chain × level`. The clamp to 9,999,999 from SPEC GJ prism-01 already applies. The score stays an integer.

File layout:

```
public/games/prism/game.js     adds SPECTRUM, SPECTRUM_EVERY, pieceCount, piece kind, the spectrum drawing and the spectrum clear
```

No other file changes.

---

## Implementation plan

1. **Inspect before changing.** Check that SPEC GJ prism-01 is implemented: `public/games/prism/game.js` exists, `GAMES` has `prism`, and `npm test` passes. Manual test: `/game/prism/play` runs, and `piece.gems` is an array in the console. If not, stop and report.
2. **Piece kind and spawn.** Add `kind`, `pieceCount`, `SPECTRUM_EVERY` and the spawn rule, including the single-cell spawn check and `pieceCount` reset on restart. Manual test: in the console, set `pieceCount = 8`; the next piece to spawn is a triplet, and the one after it is a spectrum gem, `NEXT` shows it one piece early, and after a restart `pieceCount` is 0 again.
3. **Movement and drawing.** Make ← →, falling, soft drop, hard drop and ↑ work for one gem, and draw it with the cycling colors in the well and in `NEXT`. Manual test: the gem moves, falls, soft drops and hard drops with the same points as a triplet, ↑ does nothing, the colors cycle and the frame rate stays smooth.
4. **Spectrum clear.** Add the lock rule: the floor case and the color clear, joined to the `resolving` flow. Manual test, setting `grid` from the console: landing on a magenta gem clears every magenta gem in the well, with the flash; landing on the floor makes the gem vanish without points; landing on a gem that has none of its color elsewhere clears just that one.
5. **Scoring and chains.** Check the points and the chain after the clear. Manual test: clearing 6 gems at level 1 adds 60; if the fall creates a run, it clears as chain 2 and shows `CHAIN ×2`; `cleared` grows and `level` rises at 30.
6. **Ending.** Check the overflow after a spectrum gem. Manual test: a spectrum clear that leaves a gem in row 0 ends the run; a spectrum clear that removes the gems filling the top rows lets the run continue; a spawn blocked at column 2 row 0 shows `GAME OVER`.
7. **Bridge and rank.** Play a full run past piece 10. Manual test: `message` events with `game: "prism"` keep a changing `score` and `level`, `over: true` at game over, and `SCORE SAVED` shows. Delete the test row afterwards.

---

## Acceptance criteria

- [ ] Pieces 1 to 9 of a run are triplets, and piece 10 and every tenth piece after it is a single spectrum gem.
- [ ] The `NEXT` panel shows a spectrum gem one piece before it spawns.
- [ ] `pieceCount` is 0 at the start of every run.
- [ ] A spectrum gem moves with ← →, falls, soft drops with ↓ and hard drops with Space like a triplet, and ↑ does nothing to it.
- [ ] A spectrum gem is drawn with cycling colors and a white border, and the frame loop adds no `shadowBlur`.
- [ ] Landing on a gem of color `k` clears every gem of color `k` in the well, and no gem of another color.
- [ ] Landing on the floor makes the gem vanish with no clear and no points.
- [ ] The spectrum clear adds `marks.length × 10 × chain × level` points with `chain` 1, adds `marks.length` to `cleared`, and uses the same flash and settle phases as an ordinary clear.
- [ ] A run formed by the fall after a spectrum clear clears as chain 2, with `CHAIN ×2`.
- [ ] The spectrum gem is never written to `grid`, and the matching rules of SPEC GJ prism-01 never see color 5.
- [ ] The overflow rule is unchanged: the run ends only when a gem is in row 0 after the chains or the next piece cannot spawn.
- [ ] `score` stays an integer from 0 to 9,999,999.
- [ ] `lib/games.ts`, `app/globals.css`, `public/games/bridge.js`, `supabase/migrations/`, `CLAUDE.md`, `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and the other games' folders have no edits (`git diff` is empty for them).
- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] A finished run past piece 10 shows `SCORE SAVED` and appears in `/hall-of-fame` under `Prism`.

---

## Decisions

- **Yes:** one extension, the spectrum gem (game-jam decision). The user asked for nothing beyond the base game, and this follows from the rules: it is a way out of a crowded well and a setup for chains. **No:** sound or touch controls, which are already covered or out of scope in SPEC GJ prism-01.
- **Yes:** every tenth piece, announced in `NEXT` (game-jam decision), so the player can plan. **No:** a random chance, which would make runs less comparable on the leaderboard.
- **Yes:** a single gem that clears all gems of the color it lands on (game-jam decision). **No:** a bomb that clears an area, or a gem that picks the color itself, which would need a new control.
- **Yes:** landing on the floor wastes the gem (game-jam decision). **No:** clearing the whole well, which would be too strong.
- **Yes:** the clear scores like any chain step, with no bonus (game-jam decision), so the score table stays the same one.
- **Yes:** `pieceCount` restarts with every run, so each run is comparable.
- **Yes:** the extension edits only `public/games/prism/game.js`. **No:** a catalog, cover, migration or reader change.

---

## Risks

| Risk                                                                                                     | Mitigation                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.        | The reader and its globals do not change. Step 7 checks the messages by hand, and `lib/games.test.ts` still checks the reader exists.       |
| `over` is not true for every way the run ends, so the score is never saved.                              | The only ending is still the overflow. Step 6 tests it with a spectrum gem on the stack, and step 7 plays a full run.                       |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                          | The clear uses the same integer formula and the same clamp as SPEC GJ prism-01.                                                             |
| The new piece changes the pause behavior.                                                                | The gem uses the same loop and the same `performance.now()` deltas. Step 3 pauses with P and with the host pause while a gem falls.        |
| The `games` row is missing, so the foreign key rejects every score.                                      | Not touched by this spec. SPEC GJ prism-01 step 10 and the test in `lib/leaderboard.test.ts` cover it.                                      |
| Code that assumes three gems per piece (spawn, drawing, `NEXT`) breaks for one gem.                      | SPEC GJ prism-01 loops over `piece.gems`. Step 3 plays a spectrum gem through every route and step 2 checks the `NEXT` panel.               |
| Color 5 leaks into `grid` and the matcher counts it as a color.                                          | The gem is never written to `grid`, and a criterion checks it. Step 4 inspects `grid` after a lock.                                         |
| A spectrum gem on the floor feels like a bug.                                                            | The rule is in Decisions and the `NEXT` panel warns one piece ahead. A clearer hint is a future spec.                               |
| A big clear erases most of the well and makes the score swing between runs.                              | Accepted: the gem arrives at a fixed piece count and the clear scores like any chain step. Balance changes go in their own spec.           |

---

## What is **not** in this spec

- A new catalog entry, migration, cover or reader.
- Other special gems, garbage rows, extra modes or levels with goals.
- Sound or a new control.
- Changes to the player, the leaderboard code, scores, credits or the bridge protocol.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
