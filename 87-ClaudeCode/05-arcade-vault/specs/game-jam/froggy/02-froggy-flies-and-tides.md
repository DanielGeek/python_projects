# SPEC GJ froggy-02 — Froggy flies and tides

> **Status:** Draft
> **Depends on:** SPEC GJ froggy-01
> **Date:** 2026-10-20
> **Objective:** Extend Froggy with a bonus fly that appears on an empty pad and with tide logs that sink from level 3, so later sets are riskier and more rewarding, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ froggy-01 ships the base game: five lanes of traffic, four lanes of logs, five pads, a timer, three lives and a level per cleared set. After a few sets the only change is speed. The user asked for nothing beyond the base game, so this extension is a game-jam decision: it adds one reward and one hazard that follow from the rules already there.

- **Fly.** A glowing fly lands on one empty pad for a few seconds. Landing on that pad while the fly is there scores extra. It gives the player a reason to aim for a pad that is not the closest.
- **Tide logs.** From level 3, the logs in rows 2 and 4 sink for a moment on a fixed cycle, with a warning. A frog riding a sunk log drowns. It adds a river hazard without a new lane type, a new object type or a new control.

Both changes live in `public/games/froggy/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `lives`, `level`, `state`) keep their meaning. The catalog `description` is not edited, to keep the `GAMES` entry out of this spec; the entry still reads as true because it lists nothing these changes contradict.

---

## Scope

**In:**

- A bonus fly in `game.js`: when it spawns, how long it stays, what it scores and how it is drawn.
- Tide logs in `game.js`: which lanes, from which level, the cycle, the warning and the drowning rule.
- Two new top-level globals (`fly`, `clock`) and a change to the lane items of rows 2 and 4 (a `phase` per log).
- Drawing of the fly, of the sinking warning and of the submerged log.
- Manual tests and acceptance criteria for both.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description` and `controls` text.
- Sound, a new control, extra lives, more lanes, moving pads and any other hazard.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ froggy-01.

New top-level globals (`public/games/froggy/game.js`):

```js
let clock = 0; // seconds of play since the start of the run, advanced by loop deltas, only in 'playing'
let fly = null; // { pad, until } or null; pad is an index into PAD_X, until is a `clock` value
let flyAt = 0; // `clock` value at which the next fly may appear
```

Constants:

```js
const FLY_BONUS = 200; // extra points for landing on the pad that holds the fly
const FLY_STAY = 5; // seconds a fly stays on its pad
const TIDE_FROM = 3; // first level with tide logs
const TIDE_ROWS = [2, 4]; // river rows whose logs sink
const TIDE_PERIOD = 6; // seconds of one cycle
const TIDE_WARN = 1; // seconds of flashing before the log sinks
const TIDE_DOWN = 1; // seconds the log stays under water
```

Rules, added to the rules of SPEC GJ froggy-01:

- **Fly spawn.** `flyAt` is set at the start of every attempt to `clock` plus a random time from 4 to 10 s. When `clock >= flyAt`, no fly is active and at least one pad is empty, a fly appears on a random empty pad: `fly = { pad, until: clock + FLY_STAY }`. When `clock >= fly.until`, or when its pad is filled, `fly` becomes `null` and `flyAt` is set again with a new random time from 4 to 10 s. At most one fly exists at a time.
- **Fly bonus.** Landing on the pad `fly.pad` while `fly` is not null adds `FLY_BONUS` on top of the pad points and the time bonus of SPEC GJ froggy-01, and sets `fly = null`. A fly that is still active when the frog dies stays where it is until it expires.
- **Fly reset.** A new run, and a cleared set, set `fly = null`. `clock` is set to 0 on a new run only.
- **Tide logs.** From `level >= TIDE_FROM`, every log of the rows in `TIDE_ROWS` has a `phase` (seconds, set at lane creation as a random value from 0 to `TIDE_PERIOD`) and cycles with `t = (clock + phase) mod TIDE_PERIOD`:

  | `t`                                                              | Log state                                  | Solid |
  | ---------------------------------------------------------------- | ------------------------------------------ | ----- |
  | `0` to `TIDE_PERIOD - TIDE_WARN - TIDE_DOWN` (4 s)               | afloat                                     | yes   |
  | up to `TIDE_PERIOD - TIDE_DOWN` (1 s)                            | warning: the log flashes and dips          | yes   |
  | up to `TIDE_PERIOD` (1 s)                                        | sunk: the log is drawn dark and low        | no    |

  Below `TIDE_FROM`, every log is always afloat.

- **Drowning.** The river rule of SPEC GJ froggy-01 ("safe only when `frog.x` lies inside a log") only counts a log that is solid. A frog on a log that sinks drowns at the moment it becomes not solid. A hop onto a sunk log is a drowning.
- **Lane speed and spacing** do not change.

Score bound: each pad can add at most 200 more, so a set is worth at most 2,450 + 5 × 200 = 3,450 points. The score is still an integer and stays far below 9,999,999.

Drawing:

- **Fly.** A small pale dot with two translucent wings and a yellow glow, on the pad, pulsing once per second. In its last 1.5 s it flashes.
- **Warning.** The log flashes between its normal colour and a lighter one at 4 Hz and is drawn 4 px lower.
- **Sunk.** The log is drawn in a dark tone, 10 px lower and without its glow, with a few bubbles above it.

Reader, migration, `GAMES` entry, cover and bridge: unchanged from SPEC GJ froggy-01. The reader still reads `score`, `lives`, `level` and `state`.

File layout:

```
public/games/froggy/game.js     adds clock, fly, flyAt, the tide cycle on rows 2 and 4, and their drawing
```

---

## Implementation plan

1. **Inspect before changing.** Check that SPEC GJ froggy-01 is Implemented and that `npm test` and `npm run build` pass on the clean tree. Manual test: `/game/froggy/play` runs, a set can be cleared, and `git status` is clean. If not, stop and report.
2. **Game clock.** Add `clock`, advanced by the loop delta in `playing` only, and reset on a new run. Manual test: in the console, `clock` rises while playing, stays still in `dead`, `cleared` and `ready`, and stays still while the host is paused.
3. **Fly.** Add `fly`, `flyAt`, the spawn, the expiry, the bonus and the drawing. Manual test: a fly appears on an empty pad between 4 and 10 s after an attempt starts, leaves after 5 s, never appears on a filled pad, and landing on its pad adds `FLY_BONUS` on top of the pad points; landing on another pad does not.
4. **Tide cycle.** Add `phase` to the logs of rows 2 and 4, the three states and the solid rule in the river check. Manual test: in the console, set `level = 3`; the logs of rows 2 and 4 flash for 1 s, sink for 1 s and come back every 6 s, and the logs of rows 1 and 3 never sink.
5. **Drowning and drawing.** Make the frog drown on a sunk log and draw the warning and the sunk states. Manual test: riding a log through its warning is safe, a frog on the log at the moment it sinks drowns and costs one life, and hopping onto a sunk log drowns.
6. **Level gate.** Keep the tide off below `TIDE_FROM`. Manual test: at level 1 and 2 no log sinks; the set that is started after clearing level 2 has sinking logs, and a new run is back to level 1 with none.
7. **Regression.** Play a full run. Manual test: the score, lives, level and `over` messages from the bridge are the same as before (only larger scores with the fly), the run ends at the third death, and `SCORE SAVED` shows.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] Only `public/games/froggy/game.js` has edits (`git diff` is empty for every other file).
- [ ] `clock` advances only in `playing`, and does not advance while the host pause is on.
- [ ] A fly appears on one empty pad, never on a filled pad, between 4 and 10 s after an attempt starts, and there is never more than one.
- [ ] A fly leaves after `FLY_STAY` seconds, or when its pad is filled.
- [ ] Landing on the pad that holds the fly adds exactly `FLY_BONUS` more than the same landing without it, and removes the fly.
- [ ] At level 1 and 2 no log sinks.
- [ ] From level 3, the logs of rows 2 and 4 are afloat for 4 s, flash for 1 s and are sunk for 1 s, and the logs of rows 1 and 3 never sink.
- [ ] A frog on a log that becomes sunk, and a hop onto a sunk log, each cost exactly one life.
- [ ] The score stays an integer and `over` is still true only at `gameover`.
- [ ] The reader, the `GAMES` entry, `av-cover-froggy`, the migration and the bridge have no edits.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `components/ui/game.tsx` and the other games' folders have no edits (`git diff` is empty for them).

---

## Decisions

- **Yes:** the extension is a bonus fly plus tide logs (game-jam decision: the user asked for no extension). They follow from the base rules: a reason to choose a pad, and a river hazard.
- **Yes:** a fly bonus of 200, a stay of 5 s and a spawn time of 4 to 10 s (game-jam decisions).
- **Yes:** tide logs on rows 2 and 4 from level 3, with a 6 s cycle: 4 s afloat, 1 s warning, 1 s sunk (game-jam decisions). **No:** sinking on every lane, which would leave no safe route.
- **Yes:** a warning before every sink, so a drowning is never a surprise.
- **Yes:** the changes stay inside `game.js`. **No:** editing the catalog `description` or `controls`, a new migration or a new cover.
- **Yes:** `clock` counts play time only, so the cycle and the fly freeze with the host pause and with the death and cleared screens.
- **No:** new controls, so the `TOUCH` tag and the swipe handling are unchanged.

---

## Risks

| Risk                                                                                              | Mitigation                                                                                                              |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing. | The reader is unchanged and reads only `score`, `lives`, `level` and `state`. Step 7 checks the messages by hand.      |
| `over` is not true for every way the run ends, so the score is never saved.                       | The ending is unchanged: only `gameover`. Step 7 plays a full run.                                                      |
| The score is above 9,999,999 or not an integer, so `submitScore` rejects it.                      | The bonus is a constant integer, and a set is worth at most 3,450 points.                                               |
| The game has its own pause and conflicts with the host pause.                                     | `clock` is advanced from loop deltas, which the bridge freezes. Step 2 checks it.                                       |
| The `games` row is missing, so the foreign key rejects every score.                               | Not touched here; SPEC GJ froggy-01 step 12 covers it, and step 1 here checks it was done.                              |
| Two sunk logs leave no safe path, and a set becomes impossible.                                   | Only rows 2 and 4 sink, and rows 1 and 3 never do, so a route of afloat logs exists in every cycle. Step 5 plays level 3. |
| A random fly appears on the only empty pad right when the frog lands, which feels unfair.         | The fly is a bonus, never a hazard, and the pad scores the same without it.                                             |
| The `phase` makes two neighbouring logs sink together and look like a bug.                        | The phase is random per log; if the play test shows a bad case, a fixed phase table replaces it in this file.           |
| The catalog `description` does not mention the new features.                                      | Accepted: it lists nothing that contradicts them. A new copy would need an edit of `lib/games.ts` and its own spec.     |

---

## What is **not** in this spec

- A new catalog entry, migration, cover or reader.
- Changes to `lib/games.ts` text, including the description and the controls.
- Sound, new controls, extra lives, more lanes or moving pads.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Any other game.

Each one of those, if it lands, goes in its own spec.
