# SPEC GJ mite-field-01 — Mite Field game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-11-04
> **Objective:** Add Mite Field, a new fixed shooter written from scratch where a segmented mite winds down through a field of spore blocks, to the vault as a playable catalog entry with id `mite-field`, ranked in the global leaderboard.

---

## Why this spec exists

The game comes from the `game-planner` backlog (`references/game-suggestions-todo.md`, row `mite-field`). The description is the source of truth:

- A fixed shooter in a spore field.
- A segmented mite winds down through spore blocks, and it splits when a middle segment is hit.
- A jumper bug harasses the bottom zone.
- The arrows move the shooter inside the bottom band, and Space fires.
- A 4:3 screen and the green accent (the second green after `snake`).
- It must not look like the arcade classic it recalls: names and art stay original.

There is no reference game, so the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill, with the standard globals `score`, `lives`, `level` and `state`. No implemented or archived game is the same genre: `asteroids` is the only Shooter in `GAMES`, and the archived Shooters (`invaders`, `rocks`) are rows of aliens and a rock field. Nothing is restored from `lib/games-archive.ts`; `mite-field` is a new id, not in `GAMES`, `ARCHIVED_GAMES`, `public/games/` or `specs/game-jam/` (checked).

Points flagged against the platform, none of which change the design:

- **Look-alike.** A segmented crawler that winds through blocks and splits when hit, plus a bouncing bug in the player zone, is the core of a well-known 1981 arcade game. The backlog note already names the risk. This spec keeps every name, shape and color original (mite, spore pods, jumper bug, no mushrooms, no flea, no spider), and a `grep` criterion keeps the classic's name out of the folder and the entry. Some rules the spec fills in also follow the classic (a hit segment leaves a block, the bug scores more up close); they are game-jam decisions the user can drop at review.
- **Accent.** Green repeats `snake`. The note chose it knowingly ("second green after `snake`"), so it is kept as a user decision.
- **Touch.** Since SPEC 12 every playable entry needs a `touch` config, the on-screen pad under the CRT frame. Mite Field gets the pad (four arrows, `A` fires, `B` pauses) and nothing on the canvas, because the description asks for keys only.
- **Space is fire and restart.** Space fires, and holding it keeps firing. A player holding it when the last life goes would restart at once and skip the end screen. A short restart lock fixes it without changing the controls.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The fit to the frame reuses the `fitToFrame()` pattern of SPEC 09 (`drop`), SPEC 10 and SPEC 11. The drawing follows the SPEC 14 rules from the start (no `shadowBlur` in the frame loop, glowing parts cached).

---

## Scope

**In:**

- New folder `public/games/mite-field/` with `index.html` and `game.js`, written for this spec. No image, no audio, no font file: all art is drawn on the canvas.
- `index.html` has `lang="en"`, loads `../bridge.js` with `data-game="mite-field"` before `game.js`, and holds one 800×600 canvas.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, `preventDefault` on the arrow keys and Space, and a P pause.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake` and `froggy`.
- A `readers["mite-field"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` at the end of the array, with a `touch` config, and the comment above `GAMES` updated.
- Cover art: an `av-cover-mite-field` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_mite_field_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md`.

**Out of scope (for future specs):**

- Power-ups and golden spore pods (SPEC GJ mite-field-02).
- Sound, a second shooter, more enemy kinds, blocks that fall or turn toxic, mites that collide with each other, swipe or tap on the canvas, WASD and a gamepad.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, the bridge `KEYS` allowlist, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Skins and the light/dark toggle (the `skin-designer` agent adds them after `/spec-impl-game`).
- Auth and a score validation service.
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:mite-field` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`):

```ts
{
  id: "mite-field",
  title: "Mite Field",
  category: "Shooter",
  tagline: "Shoot the mite apart before it reaches you.",
  description:
    "A segmented mite winds down through a field of spore pods, turning at every pod it meets. Hit a middle segment and it splits in two, and every hit segment leaves a new pod behind. Hold the bottom band against the mite and the jumper bug, and each cleared wave brings a longer, faster mite.",
  accent: "green",
  src: "/games/mite-field/index.html",
  aspect: "4 / 3",
  controls: "Arrows to move · SPACE to fire (hold to keep firing) · P to pause",
  touch: {
    move: [
      { code: "ArrowUp", label: "▲", name: "Move up" },
      { code: "ArrowLeft", label: "◀", name: "Move left" },
      { code: "ArrowRight", label: "▶", name: "Move right" },
      { code: "ArrowDown", label: "▼", name: "Move down" },
    ],
    a: { code: "Space", label: "A", name: "Fire, start or restart" },
    b: { code: "KeyP", label: "B", name: "Pause" },
  },
  difficulty: 3,
  plays: "3.9K",
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1981"],
}
```

`plays` is mock data, as for every game. `RETRO 1981` is the year the genre took shape in arcades; neither the tags nor any text names the arcade classic. The tag is `KEYBOARD` and not `KEYBOARD / TOUCH`, because the canvas reads no touch input; the pad is the platform's, as for `snake`.

The `touch` config is the SPEC 12 pad. The shooter moves while an arrow is held (key state, not one step per keydown), and holding Space keeps firing, so no button needs `repeat`: the host sends `keydown` on press and `keyup` on release. `A` sends `Space` (fire, start, restart) and `B` sends `KeyP` (pause). All six codes are already in the bridge `KEYS` allowlist, and `game.js` reads them through `e.code`, so `lib/games.test.ts` finds them.

### Screen

The canvas is 800×600 (`aspect: "4 / 3"`), a grid of 32 columns by 24 rows of 25 px cells. Coordinates are canvas pixels, y down; a cell `(c, r)` covers x `25c` to `25c + 25` and y `25r` to `25r + 25`.

| Zone  | Rows     | Area         | What it holds                                                                      |
| ----- | -------- | ------------ | ---------------------------------------------------------------------------------- |
| HUD   | 0        | y 0 to 25    | Score on the left, `WAVE n` in the centre, one shooter icon per life on the right. |
| Field | 1 to 18  | y 25 to 475  | Spore pods, the mite, the shot.                                                    |
| Band  | 19 to 23 | y 475 to 600 | The shooter, the jumper bug, and the mite once it gets down there.                 |

- **Shooter.** A circle of radius 10 for collisions. Its centre stays inside x 12 to 788 and y 487 to 588.
- **Band line.** A faint dashed line at y = 475 shows where the band starts.

### Globals (`public/games/mite-field/game.js`, top-level `let`/`const` of a classic script)

```js
const W = 800,
  H = 600,
  CELL = 25,
  COLS = 32,
  ROWS = 24;
const BAND_TOP = 19; // rows 19 to 23 are the shooter band
const SHIP_R = 10,
  SHIP_SPEED = 300; // px, px per second
const SHOT_SPEED = 900; // px per second, one shot on screen at a time
const POD_HP = 3,
  START_PODS = 30;
const JUMPER_R = 12,
  JUMPER_VY = 220; // px, px per second
const DEAD_TIME = 1.5,
  CLEAR_TIME = 1.5,
  RESTART_LOCK = 0.8; // seconds
const LIFE_EVERY = 10000,
  MAX_LIVES = 6;
let state = "ready"; // 'ready' | 'playing' | 'paused' | 'dead' | 'waveclear' | 'gameover'
let score = 0,
  lives = 3,
  level = 1; // level = wave
let nextLife = LIFE_EVERY; // score at which the next extra life is given
let ship = { x: 400, y: 575 }; // shooter centre
let shot = null; // { x, y } or null
let pods = new Map(); // key r * COLS + c -> hp 1 to 3
let mites = []; // [{ segs: [{ c, r, pc, pr }], dir: 1 | -1, vdir: 1 | -1, inBand: false }], segs[0] is the head
let stepAcc = 0; // seconds accumulated towards the next mite step
let jumper = null; // { x, y, vx, vy } or null
let jumperIn = 0; // seconds until the next jumper enters
let timer = 0; // seconds left of the dead pause, the wave clear screen or the restart lock
let clearBonus = 0; // points shown on the wave clear screen
let keys = {}; // held keys by e.code
```

The reader uses only `score`, `lives`, `level` and `state`. `pc` and `pr` are the cell a segment was in before the last step, used to draw it between two cells and to know which way it was going.

### Waves

For wave `L` (`level`), set when the wave starts:

| Value                     | Formula                                                     | Wave 1 | Cap                 |
| ------------------------- | ----------------------------------------------------------- | ------ | ------------------- |
| Mite segments             | `min(16, 9 + L)`                                            | 10     | 16 from wave 7      |
| Mite steps (cells/second) | `min(16, 7 + L)`                                            | 8      | 16 from wave 9      |
| Jumper delay (s)          | random from `d` to `d + 3`, `d = max(2, 6 - 0.4 × (L - 1))` | 6 to 9 | 2 to 5 from wave 11 |
| Jumper speed `vx` (px/s)  | `min(240, 110 + 10 × L)`                                    | 120    | 240 from wave 13    |
| Wave clear bonus          | `200 × L`                                                   | 200    | none                |

These are game-jam starting values and can be tuned in step 4; the table is the only place to change them.

### Rules

- **Start.** `ready` shows the title `MITE FIELD`, the controls and "SPACE to start". Space or Enter starts the run: `score = 0`, `lives = 3`, `level = 1`, `nextLife = 10000`, a new pod field, the shooter at `(400, 575)`, and wave 1 starts.
- **Pod field.** At a run start, `START_PODS` pods with `POD_HP` hit points are placed on random free cells of rows 2 to 17. Row 1 starts empty, so the mite can enter. Pods stay from wave to wave; only a new run builds a new field.
- **Wave start.** One mite of the wave's segment count enters on row 1 from a random side: from the left the head is at column 0 moving right (`dir = 1`) and the body sits off screen at columns -1, -2, …; from the right the head is at column 31 with `dir = -1` and the body at 32, 33, …. `vdir = 1` and `inBand = false`. Off-screen segments are not drawn and cannot be hit. `stepAcc = 0`, the shot and the jumper are cleared, and `jumperIn` gets a new delay.
- **Mite steps.** Every `1 / steps` seconds (from the table), each mite takes one step. Every segment first copies its cell into `pc`, `pr`. The head then tries the cell `(c + dir, r)`:
  - if that column is inside 0 to 31 and the cell has no pod, the head moves there;
  - otherwise it turns: it moves to `(c, r + vdir)` and `dir = -dir`. Before that move, if `r + vdir` is above `BAND_TOP` while `inBand` is true, or below row 23, `vdir` flips first. The vertical move ignores pods.
  - When a head reaches row 23, `inBand = true` and `vdir = -1`, so from then on that mite winds up and down inside the band.
  - Every body segment moves to the old cell of the segment in front of it.
- **Drawing the mite.** A segment is drawn between `(pc, pr)` and `(c, r)` at the fraction `stepAcc × steps` of the step, so it glides instead of jumping. Collisions with the shooter use this drawn centre.
- **Moving the shooter.** While `playing`, a held arrow moves the shooter at `SHIP_SPEED`; two arrows at once move it diagonally at the same speed (the vector is normalised). It is clamped to its zone. Pods block it: x and y are moved one after the other, and a move that makes the shooter circle overlap a pod cell is undone on that axis.
- **Firing.** While Space is held and `state === 'playing'`, a shot starts at `(ship.x, ship.y - 14)` whenever `shot === null`. There is one shot on screen at a time, so holding Space fires again as soon as the last shot is gone.
- **The shot.** It moves up at `SHOT_SPEED`, in substeps of at most 10 px so it cannot skip a cell. At each substep it checks, in this order, and stops at the first hit:
  1. the jumper, if the shot is within `JUMPER_R` of its centre;
  2. a mite segment whose cell `(c, r)` is the cell of the shot point;
  3. a pod in the cell of the shot point.

  A shot that reaches y < 25 (the HUD) is removed.

- **Hitting the mite.** The hit segment is removed. It scores 100 if it was a head (`segs[0]`) and 10 if it was a body segment. A pod with full hit points appears in its cell, unless that cell overlaps the shooter circle. Then the mite is rebuilt from what is left:
  - a hit head: the next segment becomes the head, with the same `dir`, `vdir` and `inBand`;
  - a hit tail: the mite is one segment shorter;
  - a hit middle segment: the mite **splits** in two. The front part keeps its head and its values. The back part becomes a new mite whose head is the segment right behind the hit one, with `dir = sign(c - pc)` of that segment (or the old `dir` if its last move was vertical), and the same `vdir` and `inBand`.
  - A mite with no segment left is removed.
- **Hitting a pod.** The pod loses one hit point and is drawn smaller. At 0 it is removed and adds 5.
- **Jumper bug.** While `playing` and `jumper === null`, `jumperIn` counts down. At 0 a jumper enters from a random side (x = -15 moving right, or x = 815 moving left) at a random y inside the band, with the wave `vx` and `vy = ±JUMPER_VY`. It bounces between y 487 and 588 by flipping `vy`, ignores pods, and is removed when it leaves the other side, after which `jumperIn` gets a new delay.
- **Shooting the jumper.** It is removed and scores by its distance to the shooter centre at the moment of the hit: 600 within 75 px, 400 within 150 px, 200 farther away. `jumperIn` gets a new delay.
- **Losing a life.** While `playing`, if a mite segment's drawn centre is within `SHIP_R + 10` of the shooter centre, or the jumper's centre is within `SHIP_R + JUMPER_R`, `lives` drops by 1:
  - if `lives` is now 0, `state = 'gameover'` at once;
  - otherwise `state = 'dead'` for `DEAD_TIME` (`timer`): nothing moves and the shooter is drawn as a short burst. Then the mites are replaced by one mite with the same total number of segments, entering on row 1 as at a wave start; the shot and the jumper are cleared; `jumperIn` gets a new delay; the shooter goes back to `(400, 575)` and any pod whose cell overlaps it is removed; and `state = 'playing'`. The wave number does not change.
- **Extra lives.** Every time the score passes `nextLife`, `lives` grows by 1 up to `MAX_LIVES`, and `nextLife += LIFE_EVERY`.
- **Wave clear.** When `mites` is empty during `playing`, `clearBonus = 200 × level` is added at once and the state becomes `waveclear` for `CLEAR_TIME`. The screen shows `WAVE n CLEAR` and `+bonus`. The shot and the jumper are cleared. Then `level++` and the next wave starts in `playing`.
- **Ending.** When `lives` reaches 0 the mites, the shot and the jumper stop where they are, and the end screen shows `GAME OVER`, the score, the wave reached and "SPACE to play again". For `RESTART_LOCK` seconds no key restarts. After it, Space or Enter resets every global and starts wave 1 in `playing`. The game is endless: losing the last life is the only way a run ends, and there is no win.
- **Pausing.** P (`KeyP`) switches between `playing` and `paused` and shows `PAUSED`. It is ignored in every other state. In `paused` nothing moves and no other input counts. The game does not pause on `blur`, so there is no conflict with the host pause.
- **Keys.** The `keydown` handler calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`, always, whatever the state. It does not call it for `Enter` or `KeyP`. `keyup` clears the held key. A start or restart reacts to a `keydown` that is not `e.repeat`, so a held Space from the last run does not start the next one.
- **Time.** All motion and timers advance by the delta between two loop frames from `performance.now()`, capped at 50 ms, so the host pause freezes them and a long frame does not teleport anything.
- **HUD.** Drawn on the canvas in row 0: `SCORE` with the score on the left, `WAVE n` in the centre, one small shooter icon per life on the right. All text is in English, and `lang="en"`.

Score bound: a wave is worth at most 16 heads × 100 (every segment can become a head before it is hit) plus its pods and the wave bonus, but a player can farm the jumper for as long as they survive, so the score has no natural ceiling. Every addition goes through `addScore(n)`, which sets `score = Math.min(9999999, score + n)` and then checks `nextLife`. Every value is a whole number, so the score is always an integer.

Look (original art, drawn on the canvas, no sprites from any source):

- **Background.** A dark green-black, `#040a06`, with a faint dot at every cell corner, painted once into an offscreen canvas.
- **Spore pods.** Rounded hexagons in teal-green with three darker spore dots. A pod with 2 hit points is drawn at 75 % size with a crack line, and one with 1 hit point at 50 %. No cap, stem or mushroom shape.
- **Mite.** Body segments are round green (`#6dff7a`) discs with a darker ring and two short leg ticks on each side that swap every step. The head is a lighter yellow-green disc with two curved mandibles pointing the way it moves and two thin antennae.
- **Jumper bug.** A magenta oval body with two long bent hind legs, drawn folded when it goes up and stretched when it comes down.
- **Shooter.** A small yellow dome with a short nozzle on top. The shot is a yellow 2×10 px line.
- **Glow.** The pods (one image per hit-point level), the mite head (one image per direction), the body segment, the jumper (two poses) and the shooter are painted once into offscreen canvases, with their glow, and copied each frame with `drawImage`. No `shadowBlur` in the frame loop.
- **Performance (SPEC 14).** Font strings and colors are constants built once, not inside the loop. Dead objects are removed from their arrays, and the pods live in a `Map`, so nothing grows over a long run.
- **Branding.** No text, comment, tag or file name in the game or its catalog entry names the arcade classic, and no text says "mushroom", "flea", "spider" or "scorpion".

Bridge reader (`public/games/bridge.js`). The only ending is `gameover`; `dead` and `waveclear` are not endings. `over` turns false again when a new run starts, so each run is saved on its own:

```js
"mite-field": function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

The key is quoted because the id has a hyphen, as for `brick-buster`. The bridge's `/* global … */` comment does not change: `score`, `lives`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on the page wrapper to `Math.min(1, innerWidth / 800, innerHeight / 600)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.

Migration (`supabase/migrations/<version>_add_mite_field_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('mite-field', 'Mite Field', 'Shooter', 'green');
```

No earlier migration ever inserted or deleted a `mite-field` row, so this insert does not conflict.

Cover art (`app/globals.css`, `.av-cover-mite-field` and `::after`, no image file):

- A dark green-to-`var(--void)` gradient background with a faint dot grid made with a `radial-gradient` and `background-size`.
- A wavy chain of six round `var(--green)` segments across the upper half, made with `radial-gradient` layers and `background-position`, with a lighter head at one end.
- Four or five small teal spore pods scattered around it, as smaller radial dots with a darker centre.
- A small `var(--yellow)` dome at the bottom centre and a thin yellow shot line above it.
- A `drop-shadow` glow in green.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase kebab-case `mite-field` in the route, `av-cover-mite-field`, the bridge key (quoted) and `arcade-vault:scores:mite-field`.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is the only way a run ends.
- `GAMES` order: the entry goes at the end of the array (after `froggy`, or after any game-jam game implemented before this one), so Asteroids stays the first landing tile and the default Hall of Fame tab.
- Pause: P is the in-game pause and the bridge pause freezes the loop and every timer. The game does not pause on `blur`.

File layout:

```
public/games/mite-field/index.html                      new, loads ../bridge.js (data-game="mite-field"), game.js
public/games/mite-field/game.js                         new
public/games/bridge.js                                  adds readers["mite-field"]
lib/games.ts                                            adds the entry at the end, updates the comment above GAMES
app/globals.css                                         adds av-cover-mite-field
supabase/migrations/<version>_add_mite_field_game.sql   inserts the games row (new)
references/implemented-games.md                         adds the mite-field row
CLAUDE.md                                               documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/mite-field/` does not exist. Manual test: the migrations listed match `supabase/migrations/`, `public.games` matches `GAMES` and has no `mite-field` row, and both commands pass. If not, stop and report.
2. **Folder, loop and field.** Create `public/games/mite-field/` with `index.html` (bridge tag, 800×600 canvas, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop with the capped delta, the cached background, the pod images, the pod field, the HUD, the band line and the title screen. Manual test: open `/games/mite-field/index.html` directly; the title screen shows over 30 pods in rows 2 to 17, row 1 is empty, and a reload gives a different field.
3. **Shooter, keys and shot.** Add the held-key movement with the pod blocking, the `preventDefault` on the keys, the start key, the shot with its substeps and the pod hits. Manual test: Space starts; the arrows move the shooter smoothly inside the band and stop at its edges and at pods; a diagonal is not faster; a held Space fires one shot at a time and fires again as soon as it is gone; a pod shrinks on each hit and disappears on the third, adding 5; the page does not scroll.
4. **Mite.** Add the wave start, the mite steps, the turns, the band rule, the gliding draw, the segment hits, the pods left behind and the split. Manual test: wave 1 brings a 10-segment mite from row 1 at 8 cells per second; it turns down and back at each pod and wall; a head hit adds 100, a body hit adds 10 and leaves a pod; a middle hit makes two mites that go their own ways; once a head reaches row 23 it stays in rows 19 to 23. Tune the wave table by play if a wave is impossible or trivial.
5. **Jumper, lives and waves.** Add the jumper, its scoring, the life loss with the `dead` pause and the respawn, the extra lives and the wave clear. Manual test: a jumper enters 6 to 9 s into wave 1 and bounces inside the band; shooting it up close adds 600, farther 400 or 200; touching it or a segment costs a life and, after 1.5 s, a single mite with the same number of segments enters again; clearing the mite shows `WAVE 1 CLEAR +200` and wave 2 brings 11 segments at 9 cells per second; reaching 10,000 points adds a life.
6. **Ending, restart and pause.** Add the end screen, the restart lock, the reset and the P pause. Manual test: when the last life goes the game stops on `GAME OVER` with the score and the wave; Space pressed or held during the first 0.8 s does nothing; Space or Enter after it starts wave 1 with score 0 and 3 lives; P pauses and resumes during play and does nothing on other screens.
7. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/mite-field/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
8. **Bridge reader.** Add `readers["mite-field"]`. Manual test: in the host console, `message` events with `game: "mite-field"` carry a changing `score`, `lives` dropping from 3 on each hit, a `level` that rises after each wave clear, `over: false` during the `dead` pause, and `over: true` at game over.
9. **Cover art.** Add `av-cover-mite-field`. Manual test: the cover renders on a temporary card at desktop and at 375 px, and it shows in `/library` after step 10.
10. **Catalog entry.** Add the entry at the end of `GAMES` and update the comment above it. Manual test: `/library` lists the new card, `/game/mite-field` shows the detail with the `KEYBOARD` tag, the `Shooter` filter lists Asteroids and Mite Field, and on a touch device (or touch emulation) the pad shows the four arrows, `A` and `B`, and holding `A` keeps firing.
11. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has the `mite-field` row, and there is no new advisor warning about `games` or `scores`.
12. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, touch codes in `game.js` and in the allowlist) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `mite-field`.
13. **Play and rank.** In `/game/mite-field/play`, finish a run and save the score, once signed in and once as a guest. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'mite-field'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Mite Field` and not under another game;
    - host Pause freezes the mite, the jumper and the shot, and Resume continues them.

    Delete the test rows afterwards.

14. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: one more game, and SPEC GJ mite-field-01 added Mite Field as a new game, not from the archive;
    - the `supabase/migrations/` bullet: one more migration, `add_mite_field_game`;
    - the `public/games/<id>/` bullet: `mite-field` is an 800×600 game with `fitToFrame()`, all art drawn on the canvas, and a P pause.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/mite-field/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/mite-field/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="mite-field"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies, no image or audio file, and no `shadowBlur` inside the frame loop.
- [ ] A run starts with score 0, `lives` 3, `level` 1, the shooter at `(400, 575)` and 30 pods in rows 2 to 17, with row 1 empty.
- [ ] The arrows move the shooter only inside x 12 to 788 and y 487 to 588, pods block it, and a diagonal moves no faster than a single arrow.
- [ ] There is never more than one shot on screen, and holding Space fires a new one as soon as the last one is gone.
- [ ] A pod takes exactly 3 hits, and its removal adds exactly 5.
- [ ] Wave `L` brings one mite of `min(16, 9 + L)` segments that steps `min(16, 7 + L)` cells per second and enters on row 1.
- [ ] The mite turns down one row and reverses at every pod and every wall, and a mite whose head reached row 23 never goes above row 19 again.
- [ ] A hit head adds exactly 100, a hit body segment adds exactly 10, and each hit segment leaves a pod in its cell unless the cell overlaps the shooter.
- [ ] A hit middle segment splits the mite into two mites, and the back one has its own head.
- [ ] A jumper only moves inside the band, and a hit on it adds exactly 600, 400 or 200 by its distance to the shooter (75 px and 150 px limits).
- [ ] Touching a mite segment or the jumper lowers `lives` by exactly 1; after a 1.5 s pause one mite with the same number of segments enters again, and the wave number stays.
- [ ] Every 10,000 points add one life, up to 6.
- [ ] Clearing every segment adds exactly `200 × L`, shows `WAVE n CLEAR`, and raises `level` by 1.
- [ ] When the last life goes, `state` is `gameover`, nothing moves, and Space or Enter restarts only after 0.8 s, with score 0, 3 lives and level 1.
- [ ] P pauses and resumes during play only, and the game does not pause when the iframe loses focus.
- [ ] The score never goes above 9,999,999, because every addition goes through `addScore`.
- [ ] `grep -riE "centipede|mushroom|flea|spider|scorpion"` finds nothing in `public/games/mite-field/` or in the `mite-field` entry of `lib/games.ts`.
- [ ] `GAMES` has exactly one entry with `id: "mite-field"`, `src: "/games/mite-field/index.html"`, `aspect: "4 / 3"`, `accent: "green"`, `category: "Shooter"`, `difficulty: 3` and the `touch` config above, placed last.
- [ ] `/library` lists Mite Field with its rendered cover, and the other games are unchanged.
- [ ] `/game/mite-field` shows the title, description, controls `Arrows to move · SPACE to fire (hold to keep firing) · P to pause`, `SHOOTER` and the `KEYBOARD` tag.
- [ ] `/game/mite-field/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page.
- [ ] On a touch device, the pad arrows move the shooter while held, holding `A` keeps firing and `B` pauses.
- [ ] At 1530×772 and at 375×812 the whole 800×600 canvas is visible inside the frame, and the game document does not overflow.
- [ ] The host receives `state` messages with `game: "mite-field"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` only at game over (not during the `dead` pause or the wave clear).
- [ ] Pause and resume from the host freeze and resume the game and its timers through the bridge.
- [ ] `public.games` has the row `('mite-field', 'Mite Field', 'Shooter', 'green')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'mite-field'` and appears in `/hall-of-fame` under `Mite Field` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `mite-field`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, the bridge `KEYS` table, the other games' folders and the other covers have no edits (`git diff` is empty for them).
- [ ] `references/implemented-games.md` and `CLAUDE.md` document Mite Field, its migration and the `public/games/mite-field/` folder.

---

## Decisions

- **Yes:** a fixed shooter in a spore field, where a segmented mite winds down through spore blocks and splits when a middle segment is hit, and a jumper bug harasses the bottom zone (user decisions). **No:** any other genre or a restore of an archived Shooter.
- **Yes:** the id `mite-field`, the title `Mite Field` and the category `Shooter` (user decisions).
- **Yes:** the arrows move the shooter inside the bottom band, and Space fires (user decisions). Up and down inside the band, holding Space to keep firing, one shot on screen at a time, and Enter as a second start key are game-jam decisions. **No:** WASD, a gamepad, or tap and swipe on the canvas.
- **Yes:** 800×600 and `aspect: "4 / 3"` (user decision), as a 32×24 grid of 25 px cells with a 5-row band (game-jam decision).
- **Yes:** the green accent, knowing it repeats `snake` (user decision).
- **Yes:** original names and art, and no branding of the arcade classic (user decision). The mite, pod, jumper and shooter shapes and the palette are game-jam decisions.
- **Yes:** a hit segment leaves a pod, and the back part of a split gets its own head (game-jam decisions). These follow the classic closely; dropping the pod left behind is a one-rule change at review if the user wants more distance from it.
- **Yes:** pods take 3 hits and are worth 5; a head is worth 100 and a body segment 10; the jumper is worth 600, 400 or 200 by distance; a wave clear is worth `200 × L` (game-jam decisions). **No:** points for the pods left in the band at the end of a wave.
- **Yes:** pods block the shooter, and the mite moves through them only when it turns down (game-jam decisions).
- **Yes:** 3 lives, an extra life every 10,000 points up to 6, and an endless game whose only ending is losing the last life (game-jam decisions). `lives` is the lives left and `level` is the wave. **No:** a win.
- **Yes:** after a lost life the remaining segments enter again as one mite and the wave stays (game-jam decision). **No:** restoring damaged pods for points.
- **Yes:** the wave table (segments, steps, jumper delay and speed, bonus), tunable in step 4 (game-jam decision).
- **Yes:** a P pause and `B` = `KeyP` on the pad (game-jam decisions): `lib/games.test.ts` needs a `B` with a code different from `A`, and pausing is the useful second action. **No:** pausing on `blur`, the cause of the Brick Buster resume issue (SPEC 10).
- **Yes:** a 0.8 s restart lock after game over, and starts only on a fresh keydown (game-jam decisions), because Space is both fire and restart.
- **Yes:** difficulty 3, `plays: "3.9K"`, the tagline, the description, the controls string and the tags `1 PLAYER`, `KEYBOARD`, `RETRO 1981` (game-jam decisions). `KEYBOARD` because the canvas reads no touch input.
- **Yes:** the entry goes at the end of `GAMES` (game-jam decision), so Asteroids keeps the first landing tile.
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09, SPEC 10 and SPEC 11. **No:** changing `CRTScreen`.
- **Yes:** the leaderboard uses what SPEC 08 and SPEC 15 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.
- **Yes:** the extension (golden pods and pollen power-ups) is its own spec, SPEC GJ mite-field-02 (game-jam decision).

---

## Risks

| Risk                                                                                                           | Mitigation                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.              | The globals follow the contract names and the key is quoted. `report()` swallows the error, so step 8 checks the messages by hand; `lib/games.test.ts` checks the reader exists. |
| `over` is not true for every way the run ends, so the score is never saved.                                    | The only ending is `gameover`, reached when the last life goes; `dead` and `waveclear` are not endings. Step 13 plays a full run to the end.                                     |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                | Every value is a whole number, and `addScore` clamps at 9,999,999 because the jumper can be farmed in an endless run (see the score bound above).                                |
| The game has its own pause and conflicts with the host pause.                                                  | The P pause is a game state, and the host pause freezes `performance.now()` under it, so either order resumes cleanly. No pause on `blur`. Step 6 and step 13 check it.          |
| The `games` row is missing, so the foreign key rejects every score.                                            | Step 11, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                                              |
| The game reads as a copy of the 1981 arcade classic.                                                           | Own names, shapes and palette, no mushrooms, flea, spider or scorpion, and the `grep` criterion. The rules that follow the classic are listed in Decisions for review.           |
| A mite gets stuck: a head boxed in by pods on both sides turns every step and never leaves its column.         | The vertical move ignores pods and `vdir` flips at the band edges, so a boxed head always moves down or up a row. Step 4 builds a boxed case with pods set in the console.       |
| The shot skips a cell at a long frame and passes through a segment.                                            | Substeps of at most 10 px and the 50 ms delta cap.                                                                                                                               |
| Many split mites and many pods make late waves slow without a GPU.                                             | At most 16 segments per wave, cached images, no `shadowBlur` in the loop, pods in a `Map`. The `game-performance-booster` agent can measure it later.                            |
| The band fills with pods left by segments hit near the shooter, and the shooter is boxed in.                   | No pod appears where it would overlap the shooter, a respawn clears the pods under it, and pods can be shot. Step 5 plays a long wave in the band.                               |
| Holding Space at the end restarts at once and skips the end screen.                                            | The 0.8 s restart lock, and starts only on a fresh keydown.                                                                                                                      |
| The wave numbers make the game impossible or trivial.                                                          | They are game-jam starting values. Step 4 tunes them by play; the table is the only place to change.                                                                             |
| Two green games sit side by side in the library.                                                               | Accepted, user decision. The covers differ in shape (an L-shaped snake against a wavy chain with pods).                                                                          |
| Another game-jam spec lands first and also appends to `GAMES` and adds a migration.                            | The entry goes at the end whatever is there, and step 1 compares `list_migrations` with the folder before writing the new file.                                                  |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit. | Same behavior as Asteroids, Snake and Froggy. Any credit change is a separate spec.                                                                                              |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                               | Accepted, as in SPEC 09, SPEC 10 and SPEC 11.                                                                                                                                    |

---

## What is **not** in this spec

- Golden pods and power-ups (SPEC GJ mite-field-02).
- Sound, more enemy kinds, falling or toxic pods, a second shooter, tap or swipe on the canvas, WASD or a gamepad.
- Skins and the light/dark toggle.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol, the `KEYS` allowlist or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
