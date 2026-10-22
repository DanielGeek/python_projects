# SPEC GJ froggy-01 — Froggy core game

> **Status:** Approved
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-10-20
> **Objective:** Bring `froggy` back from `lib/games-archive.ts` as a new lane-crossing game, written from scratch with original art, and add it to the vault as a playable catalog entry with id `froggy`, ranked in the global leaderboard.

---

## Why this spec exists

The user described a lane crosser: hop across roads and over river logs to fill 5 pads before the timer ends. Score comes from each forward hop, each pad and the time left. There are 3 lives, and the level rises for each cleared set of pads. The look and the name must be original, not a copy of the arcade classic it resembles. The controls are the arrows plus swipe, on a 4:3 screen.

`froggy` is already in `lib/games-archive.ts`: `src: null`, no folder in `public/games/froggy/` (checked), the cover `av-cover-froggy` in `app/globals.css`, and no `games` row (SPEC 08 deleted it). This is a comeback with the same id, not a new id, and the game is written from scratch for this spec. It follows `contract.md` of the `/add-game` skill. There is no reference game.

Two things from the archived entry change, both by user decision:

- The accent was `green`, which now repeats `snake`. The new accent is `yellow` (see Decisions).
- The entry had `src: null` and the controls "Arrow keys to hop". Its text is rewritten for the real game.

The existing `av-cover-froggy` rule is green and cyan. It is rewritten in yellow, so it is an edit of an existing rule and not a new one.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The fit to the frame reuses the `fitToFrame()` pattern of SPEC 09 (`drop`), SPEC 10 and SPEC 11.

The game has touch controls (swipe), so it carries the `TOUCH` tag. Swipe is new for the vault: no other game has it. The arrows still call `preventDefault`, so the host page does not scroll. Since SPEC 12, every playable catalog entry also needs a `touch` config (the on-screen pad under the CRT frame, which `lib/games.test.ts` checks), so the entry carries one next to the swipe: the pad and the swipe both work on a phone.

---

## Scope

**In:**

- New folder `public/games/froggy/` with `index.html` and `game.js`, written for this spec. No image, no audio, no font file: all art is drawn on the canvas.
- `index.html` has `lang="en"`, loads `../bridge.js` with `data-game="froggy"` before `game.js`, and holds one 800×600 canvas.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, `preventDefault` on the arrow keys and Space, and swipe handling with pointer events.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake`.
- A `readers["froggy"]` entry in `public/games/bridge.js`.
- Move the `froggy` entry from `ARCHIVED_GAMES` to `GAMES` in `lib/games.ts` (after `snake`), with the new accent, text, `src` and a `touch` config. Remove it from `lib/games-archive.ts` and update its header comment.
- Update the id list in `lib/games.test.ts` (`ARCHIVED_GAMES` keeps the games removed by SPEC 08 that have not come back).
- Rewrite `av-cover-froggy` in `app/globals.css` with the yellow accent, CSS only.
- Migration `supabase/migrations/<version>_add_froggy_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md`.

**Out of scope (for future specs):**

- Anything beyond the base game: bonus items, sinking logs and other hazards are in SPEC GJ froggy-02.
- Sound, a gamepad, a pause key, and keys other than the arrows, Space and Enter.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Auth and a score validation service (the name is still free text, see SPEC 08).
- Restoring or changing any other archived game (`serpent`, `muncher`, `invaders`, `rocks`, `pixel-duel`).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:froggy` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`, moved from `lib/games-archive.ts`):

```ts
{
  id: "froggy",
  title: "Froggy",
  category: "Arcade",
  tagline: "Dodge the traffic, ride the logs, fill every pad.",
  description:
    "Hop a five-lane highway and ride drifting logs across the river to fill all five pads before the clock runs out. Every forward hop, every pad and every second left on the timer scores. Three lives, and each cleared set of pads speeds everything up.",
  accent: "yellow",
  src: "/games/froggy/index.html",
  aspect: "4 / 3",
  controls: "Arrows or swipe to hop · SPACE to start",
  touch: {
    move: [
      { code: "ArrowUp", label: "▲", name: "Up" },
      { code: "ArrowLeft", label: "◀", name: "Left" },
      { code: "ArrowRight", label: "▶", name: "Right" },
      { code: "ArrowDown", label: "▼", name: "Down" },
    ],
    a: { code: "Space", label: "A", name: "Start or restart" },
    b: { code: "Enter", label: "B", name: "Start or restart" },
  },
  difficulty: 3,
  plays: "6.4K",
  tags: ["1 PLAYER", "KEYBOARD / TOUCH", "RETRO 1985"],
}
```

`plays` is mock data, kept from the archived entry. The tags are the archived ones: `KEYBOARD / TOUCH` is the `TOUCH` tag for the swipe controls.

The `touch` config is the SPEC 12 pad: the four arrows hop, and `A` and `B` both start or restart the run, because Froggy has only one action and `lib/games.test.ts` requires an `A` and a `B` with different codes that `game.js` handles (`Space` and `Enter`). There is no `repeat`, so one press on a pad button is one hop, as with a key. The swipe stays as the second touch control.

### Board

The canvas is 800×600 (`aspect: "4 / 3"`), a grid of 16 columns by 12 rows of 50 px cells. Rows from the top:

| Row    | Zone   | What it holds                                                  |
| ------ | ------ | -------------------------------------------------------------- |
| 0      | Goal   | Hedge with 5 pads. Pad centres at x = 100, 250, 400, 550, 700. |
| 1 - 4  | River  | One lane of logs per row. Water is deadly.                     |
| 5      | Median | Safe strip.                                                    |
| 6 - 10 | Road   | One lane of vehicles per row. Vehicles are deadly.             |
| 11     | Start  | Safe strip. The frog starts at x = 400. The HUD is drawn here. |

### Globals (`public/games/froggy/game.js`, top-level `let`/`const` of a classic script)

```js
const W = 800,
  H = 600,
  CELL = 50;
const PAD_X = [100, 250, 400, 550, 700]; // pad centres in the goal row
const PAD_HALF = 30; // a landing counts when |frog.x - PAD_X[i]| <= PAD_HALF
const TIME_LIMIT = 30; // seconds per attempt
let state = "ready"; // 'ready' | 'playing' | 'dead' | 'cleared' | 'gameover'
let score = 0,
  lives = 3,
  level = 1;
let frog = { x: 400, row: 11, fx: 400, frow: 11, hop: 1 }; // logical cell; fx, frow, hop only animate the drawing
let bestRow = 11; // highest row reached in this attempt, for the hop points
let timeLeft = TIME_LIMIT; // seconds
let pads = [false, false, false, false, false]; // filled pads of the current set
let lanes = []; // [{ row, kind, dir, speed, len, gap, items: [x] }]
let pause = 0; // seconds left of the dead / cleared screen
```

### Lanes

Each lane is a row of identical items that wrap around the screen. `len` is the item length in cells, `gap` the distance in px between the starts of two items, and `speed` is in px per second at level 1. `dir` is `1` (right) or `-1` (left). Item positions are the left edge `x`; an item that leaves one side re-enters on the other. The numbers are the game-jam starting values and can be tuned in step 2.

| Row | Kind  | Item    | `dir` | `speed` | `len` | `gap` |
| --- | ----- | ------- | ----- | ------- | ----- | ----- |
| 1   | river | log     | -1    | 110     | 3     | 330   |
| 2   | river | log     | 1     | 75      | 2     | 220   |
| 3   | river | log     | -1    | 90      | 4     | 380   |
| 4   | river | log     | 1     | 60      | 3     | 300   |
| 6   | road  | van     | 1     | 100     | 2     | 330   |
| 7   | road  | scooter | -1    | 150     | 1     | 280   |
| 8   | road  | truck   | 1     | 70      | 3     | 400   |
| 9   | road  | van     | -1    | 120     | 2     | 300   |
| 10  | road  | scooter | 1     | 90      | 1     | 250   |

The speed at level `L` is `speed × min(2.2, 1 + 0.12 × (L - 1))`: 1.00 at level 1 and the cap at level 11.

### Rules

- **Start.** `ready` shows the title screen with the controls. Space or Enter, or a tap, starts the run: `score = 0`, `lives = 3`, `level = 1`, no pad filled, `state = 'playing'`.
- **Attempt.** The frog stands at x = 400 in row 11 with `timeLeft = 30`. The timer counts down in `playing` only, from the `performance.now()` deltas of the loop, so the host pause freezes it.
- **Hopping.** Each arrow press (not a key repeat) or swipe moves the frog one cell: up and down change the row by 1, left and right change `x` by 50. Left and right are ignored when `x` would leave 25 to 775. Down is ignored in row 11. The move is logical and instant; the drawing tweens it in 90 ms. Input is ignored in any state but `playing`.
- **Forward hop points.** A hop up that reaches a row above `bestRow` (rows 10 down to 1) adds 10 and sets `bestRow`. Hopping back and forward again scores nothing until `bestRow` is beaten. Row 0 scores as a pad, not as a hop. `bestRow` resets to 11 on every new attempt.
- **Road.** In a road row, the frog dies when its box (36 px wide, centred on `frog.x`) overlaps a vehicle. The check runs every frame and at every landing.
- **River.** In a river row, the frog is safe only when `frog.x` lies inside a log (`item.x <= frog.x <= item.x + len × 50`). On a log it is carried at the log's speed, so `frog.x` changes between hops. It dies when no log is under it (drowned) or when `frog.x` leaves 0 to 800 (carried off the screen).
- **Median and start rows.** Safe. In row 5 and row 11 nothing moves the frog.
- **Pads.** Hopping up into row 0 lands on a pad when some `|frog.x - PAD_X[i]| <= PAD_HALF` and that pad is empty. The pad fills, and the score adds `100` plus `10 × floor(timeLeft)` (the time bonus). Landing anywhere else in row 0, or on a filled pad, is a death.
- **Death.** Vehicle, drowning, carried off the screen, a landing outside an empty pad, or `timeLeft` reaching 0. Each one sets `state = 'dead'`, subtracts 1 from `lives` at once and shows the frog's fate for 0.9 s (`pause`). Then, if `lives > 0`, a new attempt starts in `playing`; if `lives === 0`, `state = 'gameover'`.
- **Cleared set.** Filling the fifth pad sets `state = 'cleared'` for 1.4 s with `SET CLEARED` on screen. Then `level++`, `pads` resets to all empty, the lanes speed up, and a new attempt starts. No extra points for clearing a set; the level counts the sets.
- **Ending.** The run ends only when the last life is lost: `state = 'gameover'`, with `GAME OVER`, the score and "SPACE to play again". Space, Enter or a tap resets every global and goes to `playing`.
- **Keys.** The `keydown` handler calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`, always, whatever the state. It does not call it for `Enter`.
- **Swipe.** The canvas has `touch-action: none`. A `pointerdown` stores the start point (in client pixels). The first `pointermove` that moves 30 px or more from the start, on the axis with the larger movement, makes one hop in that direction and ends the gesture (one hop per swipe). A `pointerup` that did not reach 30 px is a tap: it hops up while `playing`, and starts or restarts the run on `ready` and `gameover`. Mouse drags work the same through pointer events. The `pointermove` and `touchmove` default is prevented so the host page does not scroll.
- **HUD.** Drawn on the canvas, in the start row: score on the left, level and lives (frog icons) on the right, and the timer as a bar across the bottom that turns magenta under 8 s. All text is in English, and `lang="en"`.

Score bound: a clean attempt is worth at most 100 (ten forward hops) + 100 (pad) + 290 (time bonus) = 490 points, and a set holds 5 attempts, so a set is worth at most 2,450. Reaching 9,999,999 would need more than 4,000 sets. The score is always an integer, because the time bonus uses `floor`.

Original art (drawn with canvas paths and gradients only, no sprites):

- **Froggy.** A round yellow tree frog with a lighter belly, two big dark eyes with a white glint, and long back legs that fold when it hops. It looks up, left, right or down with the hop.
- **Vehicles.** Rounded neon capsules in cyan and magenta with glowing lights: a one-cell scooter, a two-cell van and a three-cell truck. No cars drawn from the classic's look.
- **Logs.** Dark teal planks with pale growth rings and a soft glow, over water with moving ripple lines.
- **Pads.** Pink lotus rings in the hedge. A filled pad shows a small sitting frog.
- **Palette.** Dark void background, with the yellow and magenta accents of the vault.

Bridge reader (`public/games/bridge.js`). Every ending is `gameover`, and `over` turns false again when a new run starts, so each run is saved on its own:

```js
froggy: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `lives`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on the page wrapper to `Math.min(1, innerWidth / 800, innerHeight / 600)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.
- Swipe distances are read in client pixels, so zoom does not change the 30 px threshold.

Migration (`supabase/migrations/<version>_add_froggy_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('froggy', 'Froggy', 'Arcade', 'yellow');
```

The seed of `20261019092211_games_and_scores.sql` had `('froggy', 'Froggy', 'Arcade', 'green')`, and `20261019103546_save_scores.sql` deleted it, so this insert does not conflict.

Cover art (`app/globals.css`, `.av-cover-froggy` and `::after`, rewritten, no image file):

- A dark gradient background from deep blue at the top (river) to `var(--void)`, with a faint horizontal band pattern in the lower half for the road.
- Two rows of rounded blocks in `var(--cyan)` and `var(--magenta)` for the traffic, and a row of dark teal bars for the logs, made with `linear-gradient` layers and `background-position`.
- A round `var(--yellow)` frog with two small dark eyes in front, built with radial gradients.
- A `drop-shadow` glow in yellow.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `froggy` in the route, `av-cover-froggy`, the bridge key and `arcade-vault:scores:froggy`.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is the only way a run ends.
- `GAMES` order is `asteroids`, `drop`, `brick-buster`, `snake`, `froggy`, so Asteroids stays the first landing tile and the default Hall of Fame tab.
- Pause: the bridge pause freezes the loop and the timer. The game has no pause key of its own and does not pause on `blur`.

File layout:

```
public/games/froggy/index.html                      new, loads ../bridge.js (data-game="froggy"), game.js
public/games/froggy/game.js                         new
public/games/bridge.js                              adds readers["froggy"]
lib/games.ts                                        adds the entry after snake, updates the comment above GAMES
lib/games-archive.ts                                removes the froggy entry, updates the header comment
lib/games.test.ts                                   removes "froggy" from the ARCHIVED_GAMES id list
app/globals.css                                     rewrites av-cover-froggy
supabase/migrations/<version>_add_froggy_game.sql   inserts the games row (new)
references/implemented-games.md                     adds the froggy row
CLAUDE.md                                           documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/froggy/` does not exist. Manual test: there are six migrations, `public.games` has `asteroids`, `drop`, `brick-buster` and `snake`, and both commands pass. If not, stop and report.
2. **Folder, loop and lanes.** Create `public/games/froggy/` with `index.html` (bridge tag, 800×600 canvas, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop, the lane table and the drawing of the board, vehicles and logs. Manual test: open `/games/froggy/index.html` directly, and the traffic and the logs move at different speeds in both directions and wrap around without gaps in the pattern.
3. **Frog and hops.** Add the frog, the hop tween, the arrow keys with `preventDefault` and the start screen. Manual test: Space starts, each arrow moves one cell, left and right stop at the edges, down stops in row 11, a held key does not repeat, and the page does not scroll.
4. **Collisions and river.** Add the vehicle hit, the log carry, the drowning and the off-screen death. Manual test: touching a vehicle kills the frog, standing on a log moves it with the log, hopping between two logs works, hopping into water kills it, and riding a log off the edge kills it.
5. **Timer, pads, score and levels.** Add the timer, the pad landing, the three score sources, the set clear and the level speed-up. Manual test: forward hops score 10 only for a new best row, a pad adds `100 + 10 × floor(timeLeft)`, a landing beside a pad or on a filled pad kills, the fifth pad shows `SET CLEARED` and raises `level` to 2, and the lanes are faster.
6. **Lives and ending.** Add the lives, the death screen, the respawn, the end screen and the restart. Manual test: each death costs a life and shows the cause for 0.9 s, the timer reaching 0 kills, the third death shows `GAME OVER`, and Space or Enter restarts with score 0, 3 lives and level 1.
7. **Swipe.** Add the pointer handling on the canvas with `touch-action: none`. Manual test: with touch emulation at 375 px, a swipe in each direction hops once, a short tap hops up, a tap starts the run on the title screen and restarts it on the end screen, and the page behind does not scroll.
8. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/froggy/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
9. **Bridge reader.** Add `readers["froggy"]`. Manual test: in the host console, `message` events with `game: "froggy"` carry a changing `score`, `lives` going 3, 2, 1, 0, a `level` that rises after a cleared set, and `over: true` at game over.
10. **Cover art.** Rewrite `av-cover-froggy` in yellow. Manual test: the cover renders on a temporary card at desktop and at 375 px, and it shows in `/library` after step 11.
11. **Catalog.** Move the entry from `lib/games-archive.ts` to `lib/games.ts` with the new fields, update both header comments and the id list in `lib/games.test.ts`. Manual test: `/library` shows five cards, `/game/froggy` shows the detail with the `KEYBOARD / TOUCH` tag, and the `Arcade` filter lists Brick Buster, Snake and Froggy.
12. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has five rows, including `froggy`, and there is no new advisor warning about `games` or `scores`.
13. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, archive list) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `froggy`.
14. **Play and rank.** In `/game/froggy/play`, finish a run, type a name and save. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'froggy'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Froggy` and not under another game.

    Delete the test row afterwards.

15. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: five games, and SPEC GJ froggy-01 brought Froggy back from the archive;
    - the `games-archive.ts` bullet: five games left (serpent, muncher, invaders, rocks, pixel-duel);
    - the `supabase/migrations/` bullet: seven migrations, `add_froggy_game`;
    - the `public/games/<id>/` bullet: `froggy` is an 800×600 game with `fitToFrame()` and swipe controls, written from scratch with canvas art only.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/froggy/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/froggy/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="froggy"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies and no image or audio file.
- [x] The frog starts each attempt at x = 400 in row 11 with 30 s on the timer, and the timer does not run in `dead`, `cleared` or `ready`.
- [ ] Each arrow press moves the frog exactly one cell, and left and right never take it outside 25 to 775.
- [x] A forward hop to a row above `bestRow` adds exactly 10, and a hop to a row already reached adds nothing.
- [x] Touching a vehicle, landing on water, riding a log off the screen, a landing outside an empty pad and the timer reaching 0 each cost exactly one life.
- [x] On a log, the frog moves with the log's speed.
- [x] Landing on an empty pad adds exactly `100 + 10 × floor(timeLeft)` and fills that pad.
- [x] Filling the fifth pad raises `level` by 1, empties the pads and makes the lanes faster, with no extra points.
- [x] The third death sets `state = 'gameover'`, and Space, Enter or a tap starts a new run with score 0, 3 lives and level 1.
- [x] A swipe of 30 px or more hops once in the dominant direction, a shorter tap hops up while playing, and a tap starts and restarts the run.
- [x] `GAMES` has exactly one entry with `id: "froggy"`, `src: "/games/froggy/index.html"`, `aspect: "4 / 3"`, `accent: "yellow"`, `category: "Arcade"`, `difficulty: 3` and a `touch` config, placed after `snake`, and `ARCHIVED_GAMES` has no `froggy`.
- [x] `/library` lists Froggy with its rendered yellow cover, and the other four games are unchanged.
- [x] `/game/froggy` shows the title, description, controls `Arrows or swipe to hop · SPACE to start`, `ARCADE` and the `KEYBOARD / TOUCH` tag.
- [x] `/game/froggy/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page, and a swipe on the canvas does not scroll it either.
- [x] At 1530×772 and at 375×812 the whole 800×600 canvas is visible inside the frame, and the game document does not overflow.
- [x] The host receives `state` messages with `game: "froggy"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` only at game over.
- [x] Pause and resume from the host freeze and resume the game and its timer through the bridge.
- [ ] `public.games` has the row `('froggy', 'Froggy', 'Arcade', 'yellow')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'froggy'` and appears in `/hall-of-fame` under `Froggy` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `froggy`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `components/ui/game.tsx`, the other games' folders and the other covers have no edits (`git diff` is empty for them).
- [ ] `references/implemented-games.md` and `CLAUDE.md` document Froggy, the seven migrations and the `public/games/froggy/` folder.

---

## Decisions

- **Yes:** `froggy` comes back from the archive with the same id (user decision: "archived comeback"). The game is written from scratch, because the archived entry never had a folder. **No:** a new id.
- **Yes:** the name stays `Froggy` and the art is original: a yellow frog, neon capsule vehicles, teal logs and lotus pads, all drawn on the canvas (user decision). **No:** sprites, third-party assets, or a green frog on grey cars in the style of the classic it resembles.
- **Yes:** the game is a static canvas page in `public/games/froggy/`, wired with the bridge, as every other playable game. **No:** a React component in `components/games/`, a play page of its own, or a score insert written in the game page: the player and `lib/leaderboard.ts` already do all of that.
- **Yes:** the game is new and follows `contract.md`, with the standard globals `score`, `lives`, `level` and `state` (user decision for lives and levels).
- **Yes:** hop across roads and river logs to fill 5 pads (user decision). **No:** other lane types, such as diving turtles or crocodiles (SPEC GJ froggy-02 has a sinking log instead).
- **Yes:** score from each forward hop, each pad and the time left (user decision). The numbers are 10 per new best row, 100 per pad and 10 per full second left (game-jam decision). **No:** a bonus for clearing a set, because the user listed none.
- **Yes:** 3 lives, and the level rises for each cleared set of 5 pads (user decision). **No:** extra lives, because the user listed none.
- **Yes:** the timer is per attempt (one frog), 30 s, and reaching 0 costs a life (game-jam decision, from "before the timer ends" and "time bonus"). **No:** one timer for the whole set. Flagged for review.
- **Yes:** a landing in row 0 outside an empty pad, or on a filled pad, is a death (game-jam decision).
- **Yes:** the lanes table, the speeds and the speed-up `min(2.2, 1 + 0.12 × (L - 1))` (game-jam decision), tunable in step 2.
- **Yes:** the accent is `yellow` (user decision: switch from green to magenta or yellow; the choice of yellow is a game-jam decision). The current catalog is cyan twice, magenta once and green once, so yellow is the only unused accent.
- **Yes:** 800×600 canvas, `aspect: "4 / 3"`, a 16×12 grid of 50 px cells (user decision for 4:3; the grid is a game-jam decision).
- **Yes:** arrows plus swipe (user decision), Space or Enter to start and restart, a tap too. **No:** WASD and a pause key, because the user did not ask for them. The host pause is the only pause.
- **Yes:** `tags` with `TOUCH` (`KEYBOARD / TOUCH`) because swipe is a real control (game-jam decision, from the user's swipe). The other two tags are kept from the archive.
- **Yes:** a `touch` config with the four arrows, `A` = `Space` and `B` = `Enter`, both "Start or restart" (user decision, taken while implementing, because `lib/games.test.ts` requires a `touch` config for every playable game). The swipe stays. **No:** `repeat` on the arrows, a pause button, or extra pills.
- **Yes:** difficulty 3, category `Arcade`, the tagline, the catalog copy and `plays: "6.4K"` kept from the archive (game-jam decisions).
- **Yes:** one hop per swipe, a 30 px threshold and a tap that hops up (game-jam decisions).
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09, SPEC 10 and SPEC 11. **No:** changing `CRTScreen`.
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.
- **Yes:** the extension (bonuses and hazards) is its own spec, SPEC GJ froggy-02.

---

## Risks

| Risk                                                                                                           | Mitigation                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.              | The globals follow the contract names. `report()` swallows the error, so step 9 checks the messages by hand; `lib/games.test.ts` checks the reader exists. |
| `over` is not true for every way the run ends, so the score is never saved.                                    | The only ending is `gameover`, reached from the last death. Step 14 plays a full run to the end.                                                           |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                | The time bonus uses `floor`, and the score stays far below the bound (see the score bound above).                                                          |
| The game has its own pause and conflicts with the host pause.                                                  | It has none. The timer and the lanes advance from loop deltas of `performance.now()`, so the bridge freezes them. Step 9 and the criteria check it.        |
| The `games` row is missing, so the foreign key rejects every score.                                            | Step 12, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                        |
| Swipe is new in the vault, and the iframe or the host page scrolls with the gesture.                           | `touch-action: none` on the canvas plus `preventDefault` on the move. Step 7 checks it with touch emulation. A real phone test is left to the user.        |
| A held key or a fast swipe produces several hops per intent.                                                   | Key repeats are ignored and a swipe ends its gesture after one hop.                                                                                        |
| The frog is carried by a log into a wrap seam and dies unfairly.                                               | A log is one item with one `x`; the wrap moves it only after it is fully off-screen. Step 4 rides a log across the whole screen.                           |
| The lane numbers make the game impossible or trivial.                                                          | They are starting values (game-jam decisions). Step 2 and step 5 tune them by play; the table is the only place to change.                                 |
| The art looks like the arcade classic it resembles.                                                            | Own palette (yellow frog, neon capsules, teal logs, lotus pads), own lane mix and no sprites. The user reviews the look in step 14.                        |
| An archived `froggy` entry is left in `lib/games-archive.ts`, so the id is in two lists.                       | Step 11 removes it, and `lib/games.test.ts` checks that archived ids are not in `GAMES`.                                                                   |
| The cover keeps the old green look because `av-cover-froggy` is edited, not added.                             | Step 10 rewrites the rule, and the criterion checks the rendered yellow cover in `/library`.                                                               |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit. | Same behavior as Asteroids and Snake. Any credit change is a separate spec.                                                                                |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                               | Accepted, as in SPEC 09, SPEC 10 and SPEC 11.                                                                                                              |

---

## What is **not** in this spec

- Bonus items, sinking logs or any hazard beyond vehicles and water (SPEC GJ froggy-02).
- Sound, a gamepad, a pause key, WASD or extra lives.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Auth or protection against forged scores.
- Restoring or changing any other archived game.
- Any other game.

Each one of those, if it lands, goes in its own spec.
