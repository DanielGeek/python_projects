# SPEC GJ mite-field-02 — Mite Field pollen power-ups

> **Status:** Draft
> **Depends on:** SPEC GJ mite-field-01
> **Date:** 2026-11-04
> **Objective:** Extend Mite Field with golden spore pods that drop pollen capsules for three power-ups (twin shot, pierce shot and shield), so a run has goals beyond survival, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ mite-field-01 ships the base game: one mite per wave that splits when hit, a field of spore pods, the jumper bug in the band, one shot at a time, three lives. After a few waves the only change is a longer, faster mite. The backlog note asked for nothing beyond the base game, so this extension is a game-jam decision: it gives the pods a second role and the player a reason to shoot into the field instead of only at the mite, with no new control.

- **Golden pods.** A few pods in the field are golden. Breaking one drops a pollen capsule that falls into the band.
- **Power-ups.** Catching a capsule gives one of three powers: `TWIN` (two shots side by side), `PIERCE` (the shot goes through mite segments) or `SHIELD` (one free hit).

Power-ups also move the game further from the 1981 arcade classic it recalls, which has none; this lowers the look-alike risk flagged in 01.

All changes live in `public/games/mite-field/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `lives`, `level`, `state`) keep their meaning: `lives` is still the lives left, `level` the wave, and `over` is still true only at `gameover`. The catalog `description` is not edited, to keep the `GAMES` entry out of this spec; it still reads as true because it lists nothing these changes contradict. The look stays original and drawn on the canvas, as in 01.

---

## Scope

**In:**

- Golden pods in `game.js`: how many, where, how they look and what breaking one does.
- Pollen capsules in `game.js`: how they fall, how they are caught and what they score.
- The three powers `TWIN`, `PIERCE` and `SHIELD`: what each does, how long it lasts and how they combine.
- The single `shot` of 01 becomes a `shots` array, so `TWIN` can fire a pair.
- A HUD line for the active power and the shield, and the reset of all of it on a lost life and a new run.
- Manual tests and acceptance criteria for all of it.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description`, `controls` and `touch` text.
- Sound, a new control, more power kinds, bombs, a power that slows the mite, more enemy kinds, falling or toxic pods.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ mite-field-01.

Changed pod value (`public/games/mite-field/game.js`):

```js
// pods: Map key r * COLS + c -> { hp: 1 to 3, gold: boolean }
// 01 stored the hit points only; every 01 pod is now { hp, gold: false }
```

Changed shot global:

```js
let shots = []; // [{ x, y }], replaces `shot` of 01; at most 1 shot, or 2 while TWIN is active
```

New top-level globals:

```js
let capsules = []; // [{ x, y, kind }], kind: 'twin' | 'pierce' | 'shield'
let power = null; // { kind: 'twin' | 'pierce', t } or null; t = seconds left
let shield = false; // true while the shooter holds a shield
let guard = 0; // seconds of invulnerability left after the shield breaks
```

Constants:

```js
const GOLD_START = 3; // golden pods in a new field
const GOLD_MIN = 2; // a wave start tops the field up to this many golden pods
const CAPSULE_SPEED = 120; // px per second, straight down
const CAPSULE_R = 8; // px, drawn radius
const CATCH_R = 18; // px, a capsule within this distance of the shooter centre is caught
const CAPSULE_POINTS = 50;
const TWIN_TIME = 10,
  PIERCE_TIME = 8; // seconds
const TWIN_GAP = 8; // px, each shot of a pair is this far left or right of the shooter centre
const GUARD_TIME = 1.5; // seconds
```

These are game-jam starting values, tunable in step 5.

### Rules, added to the rules of SPEC GJ mite-field-01

- **Golden pods in a new field.** At a run start, `GOLD_START` of the `START_PODS` pods are chosen at random to be golden.
- **Top-up at a wave start.** When a wave starts, if fewer than `GOLD_MIN` golden pods are in rows 2 to 17, random plain pods in those rows turn golden until there are `GOLD_MIN`, or none is left to turn. Pods left by hit segments are always plain.
- **Golden pod look.** Same rounded hexagon as a plain pod, in yellow-gold with lighter spore dots, and the same three sizes by hit points. It gets its own cached image for each hit-point level.
- **Breaking a golden pod.** It takes `POD_HP` hits like any pod and adds 5 when it breaks. It also drops a capsule from its cell centre, with a `kind` chosen at random among `twin`, `pierce` and `shield`, equally likely.
- **Capsules.** A capsule falls straight down at `CAPSULE_SPEED`, through pods, segments and the jumper. Shots pass through it; it cannot be shot. It is removed when its centre goes below y = 600.
- **Catching.** While `playing`, a capsule whose centre is within `CATCH_R` of the shooter centre is caught: it is removed, adds `CAPSULE_POINTS` through `addScore`, and gives its power:
  - `twin`: `power = { kind: 'twin', t: TWIN_TIME }`;
  - `pierce`: `power = { kind: 'pierce', t: PIERCE_TIME }`;
  - `shield`: `shield = true`.

  A new `twin` or `pierce` replaces the active timed power and restarts its time. A `shield` caught while holding one adds nothing but the points. A shield and a timed power can be held at the same time.

- **Timed powers.** `power.t` counts down from the loop delta while `playing`, so P, `dead`, `waveclear` and the host pause freeze it. At 0, `power = null`.
- **Firing, changed.** The 01 rule "a shot starts whenever `shot === null`" becomes "a fire starts when `shots` is empty". Without `TWIN` it adds one shot at `(ship.x, ship.y - 14)`, as in 01. With `TWIN` it adds two shots at `(ship.x - TWIN_GAP, ship.y - 14)` and `(ship.x + TWIN_GAP, ship.y - 14)`. Each shot moves, checks hits and is removed on its own, with the substeps and hit order of 01. A fire happens again only when both are gone.
- **Pierce.** While `PIERCE` is active, a shot that hits a mite segment is not removed: it keeps going and can hit more segments on its way up. Each segment it hits scores as in 01 but leaves **no** pod. The shot still stops at the first jumper or pod it reaches, and a pod hit still costs the pod one hit point. The split rule of 01 applies to every segment the shot goes through, one after the other.
- **Shield.** While `shield` is true, the shooter is drawn with a thin green-gold ring. The first touch of a mite segment or the jumper sets `shield = false` and `guard = GUARD_TIME`, and costs no life. The jumper that touched it is removed with no points, and `jumperIn` gets a new delay; a touching segment stays. While `guard > 0` the shooter blinks and no touch counts. `guard` counts down like `power.t`.
- **Lost life.** When a life is lost, `power = null`, `shield = false`, `guard = 0`, and `shots` and `capsules` are emptied. Golden pods in the field stay.
- **Wave clear.** `shots` and `capsules` are emptied, as the shot of 01 was. `power`, `shield` and `guard` carry over into the next wave.
- **New run.** The reset of 01 also sets `shots = []`, `capsules = []`, `power = null`, `shield = false` and `guard = 0`, and the new field gets its golden pods.
- **HUD.** Row 0 gains a line left of the life icons: `TWIN n` or `PIERCE n` with the whole seconds left while a timed power is active, and a small ring icon while `shield` is true. Nothing shows without them.

Capsule look (drawn on the canvas, cached once per kind): a rounded pill 16 px tall in yellow-gold with a darker outline and one letter in the middle, `T`, `P` or `S`, drawn with the same canvas font as the HUD.

Score bound: a capsule adds 50 and a golden pod the same 5 as any pod; `PIERCE` changes how many segments one shot can hit, not what each one is worth. The 01 bound and the `addScore` clamp at 9,999,999 stay. The score is always an integer.

Performance (SPEC 14): at most 2 shots, `START_PODS` pods plus the ones left by segments, and a handful of capsules at once. Golden pods and capsules use cached images and no `shadowBlur` in the frame loop. Caught and fallen capsules are removed from their array, so nothing grows over a long run.

The bridge reader of SPEC GJ mite-field-01 does not change:

```js
"mite-field": function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

Conventions:

- All changes are in `public/games/mite-field/game.js`. `index.html`, the reader, the entry, the cover and the migration stay as in 01.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is still the only way a run ends.
- The new texts `TWIN`, `PIERCE`, `T`, `P` and `S` are in English and name nothing from the arcade classic.

File layout:

```
public/games/mite-field/game.js    adds golden pods, capsules, the three powers, the shots array and the HUD line
```

---

## Implementation plan

1. **Inspect before changing.** Check that SPEC GJ mite-field-01 is `Implemented`, run `npm test` and `npm run build` on the clean tree, and play one run of `/games/mite-field/index.html`. Manual test: both commands pass, and the game behaves as SPEC GJ mite-field-01 says. If not, stop and report.
2. **Shots array.** Replace `shot` with `shots`, with one shot per fire and no other change. Manual test: the game plays exactly as before: one shot on screen at a time, holding Space fires again as soon as it is gone, and every hit scores as in 01.
3. **Golden pods and capsules.** Add the `{ hp, gold }` pod value, the golden pods at a run start, the top-up at a wave start, their images, the capsule drop, the fall, the catch and the 50 points. Manual test: a new run shows exactly 3 golden pods; breaking one adds 5 and drops a capsule with `T`, `P` or `S`; a shot passes through the capsule; catching it adds 50; a missed capsule disappears at the bottom; after breaking two golden pods, the next wave starts with 2 golden pods again.
4. **Powers.** Add `TWIN`, `PIERCE` and `SHIELD`, the timers, the guard and the HUD line. Manual test: with `TWIN`, each fire sends two shots 16 px apart for 10 s; with `PIERCE`, one shot goes through a line of segments, scores each, leaves no pod behind them and stops at the next pod; with `SHIELD`, the first touch of the jumper removes it with no points and costs no life, the shooter blinks for 1.5 s, and the next touch costs a life; the HUD counts down `TWIN` and `PIERCE` and shows the ring while the shield holds.
5. **Combinations and tuning.** Check a shield with a timed power, a new timed power over an old one, and a shield caught while holding one. Manual test: a shield and `TWIN` work at the same time; `PIERCE` caught during `TWIN` replaces it with 8 s; a second shield adds 50 and nothing else. Tune the constants by play if the powers are too rare or too strong.
6. **Reset and pause.** Check a lost life, a wave clear, a new run and both pauses. Manual test: a lost life clears the power, the shield, the shots and the capsules but keeps the golden pods; a wave clear keeps the power and the shield; Space after game over starts with 3 golden pods and no power; P and the host Pause freeze the falling capsules and the power timer, and resume them.
7. **Host and rank.** Play a run with at least one power in `/game/mite-field/play` and save the score. Manual test: `state` messages with `game: "mite-field"` still carry `score`, `lives`, `level` and `over`, `over` is `true` at game over, `SCORE SAVED` shows, and the run appears in `/hall-of-fame` under `Mite Field` only. Delete the test row afterwards.
8. **Checks.** Run `npm run lint`, `npm test` and `npm run build`, and `git diff --stat`. Manual test: all three pass, and the diff lists only `public/games/mite-field/game.js`.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] A new run has exactly 3 golden pods among its 30 pods, all in rows 2 to 17.
- [ ] Every wave start leaves at least 2 golden pods in rows 2 to 17 while enough plain pods are there to turn, and pods left by hit segments are never golden.
- [ ] A golden pod takes 3 hits, adds exactly 5 when it breaks and drops exactly one capsule of kind `twin`, `pierce` or `shield`.
- [ ] A capsule falls straight down at 120 px per second, cannot be shot, and is removed below y = 600.
- [ ] A caught capsule adds exactly 50 and gives its power.
- [ ] With `TWIN` active, each fire sends two shots 16 px apart, the next fire waits until both are gone, and `TWIN` ends after 10 s of play.
- [ ] With `PIERCE` active, a shot goes through every mite segment on its way, scores each as in 01, leaves no pod for them, and stops at the first pod or jumper; `PIERCE` ends after 8 s of play.
- [ ] A new `TWIN` or `PIERCE` replaces the active one and restarts its time.
- [ ] With a shield, the first touch of a segment or the jumper costs no life, removes the jumper with no points, and gives 1.5 s in which no touch counts.
- [ ] Without any power, the game plays exactly as SPEC GJ mite-field-01 says: one shot at a time, a pod left by each hit segment, a life lost on each touch.
- [ ] A lost life clears the power, the shield, the shots and the capsules; a wave clear keeps the power and the shield.
- [ ] The HUD shows `TWIN n` or `PIERCE n` while a timed power is active and a ring icon while the shield holds, and nothing when neither is active.
- [ ] P and the host Pause freeze the capsules and the power and guard timers, and resume them.
- [ ] The host still receives `state` messages with `game: "mite-field"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` only at game over.
- [ ] A finished run with a power shows `SCORE SAVED` and appears in `/hall-of-fame` under `Mite Field` only.
- [ ] `game.js` still uses no `shadowBlur` inside the frame loop, no image or audio file and no `localStorage`, and `grep -riE "centipede|mushroom|flea|spider|scorpion"` still finds nothing in `public/games/mite-field/`.
- [ ] `git diff` lists only `public/games/mite-field/game.js`; `lib/games.ts`, `public/games/bridge.js`, `app/globals.css`, `supabase/migrations/`, `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and `components/ui/game.tsx` have no edits.

---

## Decisions

- **Yes:** golden pods and pollen power-ups as the extension (game-jam decision, because the backlog note asked for nothing beyond the base game). It needs no new control and moves the game further from the arcade classic. **No:** more enemy kinds (a pod dropper, a toxic crawler), which would bring it closer to the classic; **no:** sound in this spec, which would be its own spec.
- **Yes:** three powers, `TWIN`, `PIERCE` and `SHIELD`, equally likely (game-jam decisions). **No:** a bomb, a slow-down or an extra life as a power.
- **Yes:** 3 golden pods in a new field and a top-up to 2 at each wave start (game-jam decisions), so every wave offers a power. **No:** golden pods from hit segments, which would make the mite itself a power source.
- **Yes:** capsules fall into the band and must be caught, and cannot be shot (game-jam decisions), so catching one is a risk in the jumper's zone.
- **Yes:** 50 points per capsule, 10 s of `TWIN`, 8 s of `PIERCE` (game-jam decisions), tunable in step 5.
- **Yes:** one timed power at a time, which a new one replaces, and a shield that stacks with it (game-jam decisions). **No:** stacking `TWIN` and `PIERCE`.
- **Yes:** `PIERCE` leaves no pod for the segments it goes through (game-jam decision), so a pierce does not fill the field. **No:** a pierce through pods.
- **Yes:** the shield removes the jumper with no points and leaves a touching segment, with a 1.5 s guard (game-jam decisions). **No:** a shield that destroys segments.
- **Yes:** a lost life clears every power, and a wave clear keeps them (game-jam decisions).
- **Yes:** `shot` becomes `shots`, a change the reader never sees (game-jam decision).
- **Yes:** `lives`, `level` and `over` keep the meaning of SPEC GJ mite-field-01. **No:** a new ending or a new life rule.
- **Yes:** original names and art, and no branding of the arcade classic (user decision, from SPEC GJ mite-field-01).
- **Yes:** everything in `game.js`, with no catalog, cover, reader or migration change (game-jam decision). **No:** editing the `description`, which stays true without mentioning the powers.

---

## Risks

| Risk                                                                                              | Mitigation                                                                                                                                            |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing. | The reader does not change and the four globals keep their names; `shot` is not one of them. Step 7 checks the messages by hand.                      |
| `over` is not true for every way the run ends, so the score is never saved.                       | The only ending is still `gameover`, when the last life goes; the shield only delays it. Step 7 plays a full run to the end.                          |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                   | Every new value is a whole number and goes through the `addScore` clamp of 01 (see the score bound above).                                            |
| The game has its own pause and conflicts with the host pause.                                     | Capsules and the power and guard timers advance from the same loop deltas as the rest, so P and the bridge freeze them. Step 6 checks both.           |
| The `games` row is missing, so the foreign key rejects every score.                               | The row comes from SPEC GJ mite-field-01 and this spec does not touch it. Step 7 saves a score.                                                       |
| Replacing `shot` with `shots` breaks a 01 rule (one shot at a time, hit order, substeps).         | Step 2 does only that change and replays 01 before any power exists.                                                                                  |
| `PIERCE` splits a mite many times in one frame and leaves broken mites with a wrong head.         | The split rule of 01 runs once per segment, in the order the shot meets them. Step 4 pierces a straight line of segments and checks each piece moves. |
| `TWIN` plus hold-to-fire makes the game too easy.                                                 | `TWIN` lasts 10 s and waits for both shots. Step 5 tunes the time and the drop rate by play.                                                          |
| Powers are too rare because golden pods are shot by accident early in a wave.                     | Capsules fall to the band and wait to be caught, and the top-up gives 2 golden pods each wave. Step 5 tunes `GOLD_START` and `GOLD_MIN`.              |
| The catalog `description` does not mention the powers.                                            | Accepted: the text stays true. Updating it is a separate change that touches `lib/games.ts`.                                                          |

---

## What is **not** in this spec

- A new catalog entry, migration, reader or cover, or any edit of `lib/games.ts`.
- Sound, a new control, more power kinds, more enemy kinds, falling or toxic pods.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Any other game.

Each one of those, if it lands, goes in its own spec.
