# SPEC GJ skyguard-02 — Skyguard splitters and bombers

> **Status:** Draft
> **Depends on:** SPEC GJ skyguard-01
> **Date:** 2026-10-23
> **Objective:** Extend Skyguard with splitting warheads from wave 3 and a bomber that crosses the sky from wave 5, so later waves change in kind and not only in speed, without touching the catalog, the migration or the bridge.

---

## Why this spec exists

SPEC GJ skyguard-01 ships the base game: one kind of warhead in straight lines, six cities, one launcher, ammo per wave and a wave bonus. After a few waves the only change is more warheads, faster. The backlog note asked for nothing beyond the base game, so this extension is a game-jam decision: it adds two threats that follow from the rules already there and need no new control.

- **Splitters.** From wave 3, some warheads split into three at mid height. Catching one before the split is worth more, so the player has a reason to fire early and high instead of waiting over the cities.
- **Bomber.** From wave 5, one bomber per wave flies across the upper sky and drops warheads on the way. Shooting it down early stops its drops and scores a bonus.

Both changes live in `public/games/skyguard/game.js`. No catalog entry, migration, reader, cover or test changes, because the globals the reader uses (`score`, `lives`, `level`, `state`) keep their meaning: `lives` is still the cities left, `level` the wave, and `over` is still true only at `gameover`. The catalog `description` is not edited, to keep the `GAMES` entry out of this spec; it still reads as true because it lists nothing these changes contradict. The look stays vector lines only, with no third-party art and no "Missile Command" branding, as in 01.

---

## Scope

**In:**

- Splitting warheads in `game.js`: from which wave, how many, where they split, what the children aim at, what they score and how they look.
- One bomber per wave in `game.js`: from which wave, its path, its drops, its hit rule, its score and how it looks.
- A `kind` field on each warhead, a new top-level global `bomber`, and the wave rule extended so a wave ends only when the bomber is gone too.
- The extra ammo for those waves and a one-line notice on the wave banner the first time each threat appears.
- Manual tests and acceptance criteria for both.

**Out of scope (for future specs):**

- A new catalog entry, a new migration, a new `av-cover-*` rule or a new `readers` entry.
- Editing `lib/games.ts`, including the `description`, `controls` and `touch` text.
- Sound, a new control, chain reactions, rebuilt or bonus cities, more launchers, a launcher that can be hit, and any threat beyond splitters and the bomber.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol and `components/ui/game.tsx`.
- Any other game.

---

## Data model

No new persistence. The score table, the catalog and the `games` row are the ones from SPEC GJ skyguard-01.

Changed warhead shape (`public/games/skyguard/game.js`):

```js
// warheads: [{ kind, sx, sy, x, y, vx, vy, splitY }]
// kind: 'plain' | 'splitter' | 'child'
// splitY: canvas y at which a splitter splits; null for 'plain' and 'child'
```

New top-level global:

```js
let bomber = null; // { x, dir, drops: [x, x, x], hit: false } or null; flies along y = BOMBER_Y
```

Constants:

```js
const SPLIT_FROM = 3; // first wave with splitters
const SPLIT_MIN_Y = 150,
  SPLIT_MAX_Y = 300; // a splitter splits at a random y in this range
const SPLIT_INTO = 2; // children added at the split; the splitter itself goes on as a third
const BOMBER_FROM = 5; // first wave with a bomber
const BOMBER_Y = 110; // flight height
const BOMBER_SPEED = 90; // px per second
const BOMBER_DROPS = 3; // warheads it drops on one crossing
const BOMBER_HIT = 22; // a blast within this distance of its centre downs it
```

### Wave table, extended

These rows are added to the wave table of SPEC GJ skyguard-01. The other rows do not change.

| Value                    | Formula                                                      | Wave 3 | Wave 5 | Cap            |
| ------------------------ | ------------------------------------------------------------ | ------ | ------ | -------------- |
| Splitters among the wave | `L >= 3 ? min(6, floor((L - 1) / 2)) : 0`                    | 1      | 2      | 6 from wave 13 |
| Bomber                   | one if `L >= 5`, else none                                   | none   | one    | one per wave   |
| Ammo                     | warheads in the wave + 12 + 2 × splitters + (bomber ? 4 : 0) | 26     | 36     | 58             |

Splitters are part of the wave's warhead count, not added to it. Their children and the bomber's drops are extra. These are game-jam starting values, tunable in step 4.

### Rules, added to the rules of SPEC GJ skyguard-01

- **Splitter launch.** When a wave starts, the given number of its launches are chosen at random to be splitters. A splitter is launched like a plain warhead, with `kind: 'splitter'` and a random `splitY` from `SPLIT_MIN_Y` to `SPLIT_MAX_Y`.
- **Split.** When a splitter's head reaches `splitY`, it becomes a `child` that keeps its own path, and `SPLIT_INTO` more children start from that point. Each new child flies at the wave speed to a random standing city ±16 px. If no other city stands, it aims at the same city. Its trail starts at the split point. Children never split.
- **Splitter look.** Until it splits, a splitter's head is a small open diamond instead of a cross, so the player can tell it apart. Its trail is the same magenta line. After the split, the children look like plain warheads.
- **Bomber flight.** On a bomber wave, the bomber enters when half of the wave's launches are done. It comes from a random side (`dir` is `1` from the left at x = -40, `-1` from the right at x = 840), flies along `BOMBER_Y` at `BOMBER_SPEED`, and is removed when it leaves the other side. Its `drops` are three random x values inside 80 to 720, chosen when it enters.
- **Bomber drops.** When the bomber passes a drop x, it drops one `plain` warhead from `(x, BOMBER_Y + 8)`, aimed at a random standing city ±16 px, at the wave speed. A downed bomber drops nothing more.
- **Hits.** The blast rule of 01 applies to every kind of warhead. The bomber is downed when it is within the current radius of a blast plus `BOMBER_HIT` of its centre; it is removed with a short flash.
- **Points.** A `plain` or `child` warhead is worth `25 × m`, as in 01. A `splitter` caught before it splits is worth `50 × m`. A downed bomber is worth `100 × m`. All go through `addScore`.
- **Wave clear.** The 01 rule ("no launches left, no warheads, shots or blasts") also needs `bomber === null`. The bonus formulas of 01 do not change; the extra ammo makes the ammo bonus larger on those waves.
- **Banner notice.** The wave banner of wave 3 also shows `SPLITTERS INBOUND`, and the banner of wave 5 shows `BOMBER INBOUND`. Other waves show only `WAVE n`.
- **Reset.** A new run and every wave start set `bomber = null`. Game over freezes the bomber where it is, like the warheads.

Bomber look (vector lines only): a magenta outline, 40 px wide, of a swept-wing silhouette with a short tail, and a small blinking light drawn as a two-pixel line. No sprite and no fill.

Score bound: at the top multiplier (×6), a wave now holds at most 30 warheads (6 of them splitters), 12 children, 3 drops and one bomber, plus 6 cities and 58 interceptors. That is at most (24 × 25 + 6 × 50 + 12 × 25 + 3 × 25 + 100) × 6 + 6 × 600 + 58 × 30 = 8,250 + 3,600 + 1,740 = 13,590 points per wave. Reaching 9,999,999 still needs more than 700 waves, and the `addScore` clamp of 01 stays. The score is always an integer.

Performance (SPEC 14): at most 45 warheads and one bomber at once. The bomber is drawn with a few `lineTo` calls per frame and no `shadowBlur`. Children are pushed into the same `warheads` array and removed when they die, so nothing grows over a long run.

The bridge reader of SPEC GJ skyguard-01 does not change:

```js
skyguard: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

Conventions:

- All changes are in `public/games/skyguard/game.js`. `index.html`, the reader, the entry, the cover and the migration stay as in 01.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is still the only way a run ends.

File layout:

```
public/games/skyguard/game.js    adds splitters, the bomber, the extended wave table and the banner notice
```

---

## Implementation plan

1. **Inspect before changing.** Check that SPEC GJ skyguard-01 is `Implemented`, run `npm test` and `npm run build` on the clean tree, and play one run of `/games/skyguard/index.html`. Manual test: both commands pass, and the game behaves as SPEC GJ skyguard-01 says. If not, stop and report.
2. **Warhead kinds.** Add the `kind` and `splitY` fields, keep every 01 warhead as `plain`, and draw the splitter diamond head. Manual test: waves 1 and 2 play exactly as before (same counts, same 20 and 22 ammo, same points); setting `level = 3` in the console before a wave shows one warhead with a diamond head.
3. **Split.** Add the split at `splitY`, the children and the splitter points. Manual test: in wave 3, the splitter turns into three warheads between y = 150 and y = 300, the children aim at standing cities, a splitter caught before the split adds `50 × m` (×2 at wave 3, so 100), a child adds `25 × m`, and children never split again.
4. **Bomber.** Add the bomber entry, flight, drops, hit rule, points and removal, and the extended ammo. Manual test: with `level = 5`, the bomber enters when half of the launches are done, flies along y = 110 from a random side, drops three warheads, adds `100 × m` when a blast downs it and drops nothing after that, and the wave starts with 36 ammo. Tune the table by play if a wave is impossible or trivial.
5. **Wave clear and banner.** Extend the wave clear rule with `bomber === null` and add the banner notice. Manual test: a bomber wave does not end while the bomber is still flying with no warheads left; `SPLITTERS INBOUND` shows on wave 3 only and `BOMBER INBOUND` on wave 5 only.
6. **Reset and pause.** Check the reset and both pauses with the new threats. Manual test: game over during a bomber crossing freezes the bomber; Space after the lock starts wave 1 with no bomber and no splitters; P and the host Pause freeze the bomber and the children, and resume them.
7. **Host and rank.** Play a run past wave 5 in `/game/skyguard/play` and save the score. Manual test: `state` messages with `game: "skyguard"` still carry `score`, `lives`, `level` and `over`, `over` is `true` at game over, `SCORE SAVED` shows, and the run appears in `/hall-of-fame` under `Skyguard` only. Delete the test row afterwards.
8. **Checks.** Run `npm run lint`, `npm test` and `npm run build`, and `git diff --stat`. Manual test: all three pass, and the diff lists only `public/games/skyguard/game.js`.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] Waves 1 and 2 have no splitters and no bomber, and play exactly as SPEC GJ skyguard-01 says.
- [ ] Wave `L >= 3` has `min(6, floor((L - 1) / 2))` splitters among its `min(30, 6 + 2 × L)` warheads, each drawn with a diamond head until it splits.
- [ ] A splitter splits once, between y = 150 and y = 300, into three warheads aimed at standing cities, and no child ever splits.
- [ ] A splitter caught before its split adds exactly `50 × m`, and a child or a plain warhead adds exactly `25 × m`.
- [ ] Every wave from 5 has exactly one bomber, which enters when half of the launches are done, flies along y = 110 and drops at most 3 warheads.
- [ ] A blast that reaches the bomber downs it, adds exactly `100 × m` and stops its drops.
- [ ] A wave's ammo is its warhead count + 12 + 2 × splitters + 4 when it has a bomber.
- [ ] A wave does not clear while the bomber is still on screen.
- [ ] The wave 3 banner shows `SPLITTERS INBOUND` and the wave 5 banner shows `BOMBER INBOUND`; no other banner shows either line.
- [ ] Game over freezes the bomber and the children, and a restart starts wave 1 with no bomber.
- [ ] P and the host Pause freeze the bomber, the splitters and the children, and resume them.
- [ ] The host still receives `state` messages with `game: "skyguard"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` only at game over.
- [ ] A finished run past wave 5 shows `SCORE SAVED` and appears in `/hall-of-fame` under `Skyguard` only.
- [ ] `game.js` still uses no `shadowBlur`, no image or audio file and no `localStorage`, and no text in it says "Missile Command".
- [ ] `git diff` lists only `public/games/skyguard/game.js`; `lib/games.ts`, `public/games/bridge.js`, `app/globals.css`, `supabase/migrations/`, `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and `components/ui/game.tsx` have no edits.

---

## Decisions

- **Yes:** splitting warheads and a bomber as the extension (game-jam decision, because the backlog note asked for nothing beyond the base game). **No:** sound, chain reactions or bonus cities in this spec; each would be its own spec.
- **Yes:** splitters from wave 3 and the bomber from wave 5 (game-jam decisions), so the first two waves stay a clean tutorial of 01.
- **Yes:** a splitter is one of the wave's warheads and its children are extra, and the bomber's drops are extra too (game-jam decisions). The ammo grows with them (+2 per splitter, +4 for a bomber).
- **Yes:** a splitter shows a diamond head before it splits (game-jam decision), so firing early is a choice the player can see. **No:** splitters that look like plain warheads.
- **Yes:** `50 × m` for a splitter before its split and `100 × m` for the bomber (game-jam decisions). **No:** points for a bomber drop beyond the plain `25 × m`.
- **Yes:** one bomber per wave, three drops, a fixed height of y = 110 and a hit margin of 22 px (game-jam decisions), tunable in step 4. **No:** a bomber that dives or fires at the launcher.
- **Yes:** `lives`, `level` and `over` keep the meaning the user gave them (user decision, from SPEC GJ skyguard-01). **No:** a new ending or a new life rule.
- **Yes:** vector lines only and no "Missile Command" branding for the new threats too (user decisions, from SPEC GJ skyguard-01).
- **Yes:** everything in `game.js`, with no catalog, cover, reader or migration change (game-jam decision). **No:** editing the `description`, which stays true without mentioning the new threats.

---

## Risks

| Risk                                                                                              | Mitigation                                                                                                                                         |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing. | The reader does not change and the four globals keep their names. Step 7 checks the messages by hand.                                              |
| `over` is not true for every way the run ends, so the score is never saved.                       | The only ending is still `gameover`, when the last city falls. Step 7 plays a full run to the end.                                                 |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                   | Every new value is a whole number and goes through the `addScore` clamp of 01 (see the score bound above).                                         |
| The game has its own pause and conflicts with the host pause.                                     | The bomber and the children advance from the same loop deltas as the rest, so P and the bridge freeze them. Step 6 checks both.                    |
| The `games` row is missing, so the foreign key rejects every score.                               | The row comes from SPEC GJ skyguard-01 and this spec does not touch it. Step 7 saves a score.                                                      |
| A wave never clears because a bomber or a child is stuck off screen.                              | The bomber is removed once it leaves the other side, and every warhead is removed at the ground. Step 5 waits through a bomber wave with no shots. |
| Splits and drops make late waves impossible, with more warheads than 3 shots can cover.           | The extra ammo, the diamond warning and the starting values in the table. Step 4 tunes them by play.                                               |
| Up to 45 warheads at once make the frame slow without a GPU.                                      | One `lineTo` per trail, no `shadowBlur`, dead objects removed. The `game-performance-booster` agent can measure it later.                          |
| The catalog `description` does not mention the new threats.                                       | Accepted: the text stays true. Updating it is a separate change that touches `lib/games.ts`.                                                       |

---

## What is **not** in this spec

- A new catalog entry, migration, reader or cover, or any edit of `lib/games.ts`.
- Sound, chain reactions, rebuilt or bonus cities, more launchers or a launcher that can be hit.
- Any threat beyond splitting warheads and one bomber per wave.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Any other game.

Each one of those, if it lands, goes in its own spec.
