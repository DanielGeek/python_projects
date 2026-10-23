# SPEC GJ surge-01 — Surge game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-10-23
> **Objective:** Add Surge, a new collapse-style puzzle written from scratch on a square canvas, to the vault as a playable catalog entry with id `surge`, ranked in the global leaderboard.

---

## Why this spec exists

The idea comes from the `game-planner` backlog. The user described a collapse-style grid on a square canvas: a cursor moves with the arrows, Space clears a group of 2 or more same-color blocks, and the blocks above fall by gravity. A new row rises from below on a timer, and the run ends when a column reaches the top. A group of n blocks scores n², there are no lives, and the level is the rise speed. The name and the look must be original. The accent is cyan and the category is Puzzle.

There is no reference game and no archived match: `lib/games-archive.ts` holds `serpent`, `muncher`, `invaders`, `rocks` and `pixel-duel`, and `surge` is not in `GAMES`, in `public/games/` or in `specs/game-jam/` (checked). So the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill, with the standard globals `score`, `lives`, `level` and `state`.

`drop` is the only other Puzzle game. Both have a stack that grows toward the top, but the play is different: Drop places falling pieces, Surge clears groups from a rising stack with a cursor. Surge also puts a second game in the Puzzle filter, which until now holds only Drop.

Two points are flagged for review, without changing the design:

- **Accent.** Cyan is the user's choice, and it is already used by `asteroids` and `brick-buster`. Surge makes it three cyan games out of six, while magenta, yellow and green have one each. The spec keeps cyan.
- **Square frame.** A `1 / 1` CRT frame at desktop width can be taller than the viewport, as SPEC 11 found with Snake. The game fits its iframe with `fitToFrame()`. Capping the frame height is out of scope.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The fit to the frame reuses the `fitToFrame()` pattern of SPEC 09, SPEC 10 and SPEC 11. Since SPEC 12, every playable entry also needs a `touch` config for the on-screen pad, which `lib/games.test.ts` checks.

---

## Scope

**In:**

- New folder `public/games/surge/` with `index.html` and `game.js`, written for this spec. No image, no audio, no font file: all art is drawn on the canvas.
- `index.html` has `lang="en"`, loads `../bridge.js` with `data-game="surge"` before `game.js`, and holds one 600×600 canvas.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, and `preventDefault` on the arrow keys and Space.
- The rules below: cursor, group clear with flood fill, gravity, the rising row, the level, the ending and the restart.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake`.
- A `readers["surge"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` after `froggy`, with a `touch` config, and the comment above `GAMES` updated.
- Cover art: an `av-cover-surge` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/YYYYMMDDHHMMSS_add_surge_game.sql` (the version Supabase assigns) that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md`.

**Out of scope (for future specs):**

- Special blocks (bombs, rise stoppers): SPEC GJ surge-02.
- Sound, a pause key, swipe or tap on the canvas, column shifting when a column empties, a manual "raise now" key, more or fewer colors per level, and combo or chain bonuses.
- Skins and the light/dark toggle: the `skin-designer` agent adds them after implementation (`/spec-impl-game`).
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Capping the height of the CRT frame for square games.
- Auth and a score validation service (the name is still free text, see SPEC 08).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:surge` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`):

```ts
{
  id: "surge",
  title: "Surge",
  category: "Puzzle",
  tagline: "Clear the colors before the grid surges to the top.",
  description:
    "Move the cursor over a grid of charged cells and clear any group of two or more of the same color; the cells above fall into the gap. A new row rises from below on a timer, and every level makes it rise faster. A group of n cells is worth n² points, and the run ends when a column is pushed past the top.",
  accent: "cyan",
  src: "/games/surge/index.html",
  aspect: "1 / 1",
  controls: "Arrows to move · SPACE or ENTER to clear a group · SPACE to start",
  touch: {
    move: [
      { code: "ArrowUp", label: "▲", name: "Cursor up", repeat: true },
      { code: "ArrowLeft", label: "◀", name: "Cursor left", repeat: true },
      { code: "ArrowRight", label: "▶", name: "Cursor right", repeat: true },
      { code: "ArrowDown", label: "▼", name: "Cursor down", repeat: true },
    ],
    a: { code: "Space", label: "A", name: "Clear, start or restart" },
    b: { code: "Enter", label: "B", name: "Clear, start or restart" },
  },
  difficulty: 2,
  plays: "4.8K",
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
}
```

`plays` is mock data, as for every game. `RETRO 1985` refers to Chain Shot!, the 1985 origin of the collapse genre. The tags have no `TOUCH`, because the game has no touch control of its own; the SPEC 12 pad is a host feature, as for Snake.

The `touch` config is the SPEC 12 pad. The cursor moves one cell per `keydown`, so the four arrows have `repeat: true`, as in `drop`. `A` and `B` do the same thing, because the game has one action and `lib/games.test.ts` needs an `A` and a `B` with different codes that `game.js` handles (`Space` and `Enter`, as in `froggy`).

### Board

The canvas is 600×600 (`aspect: "1 / 1"`), split in bands of 50 px:

| Band        | y (px)    | What it holds                                                               |
| ----------- | --------- | --------------------------------------------------------------------------- |
| HUD         | 0 - 50    | Score on the left, level on the right.                                      |
| Board       | 50 - 550  | 12 columns × 10 rows of 50 px cells. Row 0 is the top, row 9 the bottom.    |
| Preview row | 550 - 600 | The next row, drawn dimmed, with a rise bar that fills until the next rise. |

### Globals (`public/games/surge/game.js`, top-level `let`/`const` of a classic script)

```js
const COLS = 12,
  ROWS = 10,
  CELL = 50; // 600×600 canvas, board from y = 50 to y = 550
const COLORS = 4; // color indexes 0..3
const START_ROWS = 4; // filled rows at the start of a run
const MAX_SCORE = 9999999;
let state = "ready"; // 'ready' | 'playing' | 'gameover'
let score = 0,
  lives = null,
  level = 1;
let grid = []; // grid[row][col]: a color index 0..3, or -1 for empty
let next = []; // next[col]: the preview row, color indexes 0..3
let cursor = { col: 5, row: 9 };
let riseClock = 0; // seconds since the last rise, advanced by loop deltas in 'playing' only
let rises = 0; // rows risen in this run, feeds the level
```

### Rules

- **Start.** `ready` shows the title `SURGE`, the controls and "SPACE to start". Space or Enter starts the run: `score = 0`, `level = 1`, `rises = 0`, `riseClock = 0`, rows 6 to 9 filled with random colors, rows 0 to 5 empty, a new random `next`, the cursor at column 5, row 9, and `state = 'playing'`.
- **Cursor.** Each arrow `keydown` moves the cursor one cell and stops at the board edges. Native key repeat moves it too, so a held arrow keeps moving. The cursor can sit on an empty cell. Input is ignored in any state but `playing`, except Space and Enter on `ready` and `gameover`.
- **Clear.** Space or Enter (not a key repeat) runs a 4-neighbour flood fill from the cursor cell over cells of the same color. The fill is iterative (an explicit stack), not recursive. When the group has `n >= 2` cells, every cell of the group becomes empty and `score = Math.min(MAX_SCORE, score + n * n)`. A single cell or an empty cell clears nothing, scores nothing and only shakes the cursor for 150 ms.
- **Gravity.** Right after a clear, in every column the blocks fall down to fill the empty cells below them, keeping their order. Columns never shift sideways. The move is logical and instant; the drawing tweens each falling block at 1,200 px per second.
- **Rise.** The rise interval is `riseEvery = Math.max(2, 8 - 0.5 * (level - 1))` seconds: 8 s at level 1, down to 2 s from level 13. `riseClock` adds the loop delta only in `playing`, so the host pause freezes it. When it reaches `riseEvery`:
  - if any column has a block in row 0, the run ends (see Ending);
  - otherwise every block moves up one row, `next` becomes row 9, a new random `next` is made, the cursor moves up one row (it stays on the same block, and stops at row 0), `rises++` and `riseClock = 0`.
- **Level.** `level = 1 + Math.floor(rises / 10)`: one level per 10 risen rows. The level only sets the rise speed.
- **Danger.** While any column has a block in row 0, the top edge of the board glows magenta and pulses, so the player knows the next rise ends the run.
- **Ending.** A rise while a column has a block in row 0 sets `state = 'gameover'`. That is the only way a run ends. The end screen shows `GAME OVER`, the score and "SPACE to play again". Space or Enter resets every global as in Start and goes to `playing`.
- **Pause.** There is no pause key, and the game does not pause on `blur`. The host pause is the only pause.
- **Keys.** The `keydown` handler calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`, always, whatever the state. It does not call it for `Enter`.
- **HUD.** Drawn on the canvas: score on the left of the HUD band, `LEVEL n` on the right, and the rise bar in the preview row, which turns magenta in its last second. All text is in English, and `lang="en"`.

Score bound: the board holds 120 cells, so one clear is worth at most 120² = 14,400. Every point needs blocks that the rises brought in, at most 12 per rise. Reaching 9,999,999 would take thousands of rises of perfect play, and `Math.min(MAX_SCORE, …)` caps the score anyway. The score is always an integer.

Original look (drawn with canvas paths and gradients only, no sprites):

- **Cells.** Each color is a rounded "charge cell": a dark glass square with a bright inner core and a glyph, so the colors also read without color vision. Cyan with a ring, magenta with a diamond, yellow with a triangle, green with a bar.
- **Board.** A dark circuit-board background with faint traces between the cells. The cursor is a cyan bracket frame with corner ticks.
- **Clear.** For 180 ms, short lightning arcs jump between the cleared cells, then fade. The effect is drawing only and does not block input.
- **Palette.** Dark void background with the vault accents. Cyan leads: the HUD, the cursor and the rise bar.

Performance (SPEC 14 rules): the four cell sprites, the cursor and the board background are painted once into offscreen canvases and copied with `drawImage`. `shadowBlur` is used only while building those sprites, never in the frame loop. Gradients, font strings and arrays are not rebuilt inside the frame loop; the flood fill reuses one stack array.

Bridge reader (`public/games/bridge.js`). The only ending is `gameover`, and `over` turns false again when Space starts a new run, so each run is saved on its own:

```js
surge: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on the page wrapper to `Math.min(1, innerWidth / 600, innerHeight / 600)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.

Migration (`supabase/migrations/YYYYMMDDHHMMSS_add_surge_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('surge', 'Surge', 'Puzzle', 'cyan');
```

Cover art (`app/globals.css`, `.av-cover-surge` and `::after`, no image file):

- A dark navy-to-`var(--void)` gradient background with a faint circuit grid made with repeating linear gradients.
- Columns of square cells of different heights in `var(--cyan)`, `var(--magenta)`, `var(--yellow)` and `var(--green)`, built with `linear-gradient` layers and `background-position`.
- A cyan bracket frame around a pair of cyan cells, for the cursor.
- A thin magenta line along the top, for the danger edge.
- A `drop-shadow` glow in cyan.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `surge` in the route, `av-cover-surge`, the bridge key and `arcade-vault:scores:surge`.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is the only way a run ends.
- `GAMES` order is `asteroids`, `drop`, `brick-buster`, `snake`, `froggy`, `surge`, so Asteroids stays the first landing tile and the default Hall of Fame tab.
- Pause: the bridge pause freezes the loop, the rise timer and the tweens. The game has no pause key and does not pause on `blur`.

File layout:

```
public/games/surge/index.html                            new, loads ../bridge.js (data-game="surge"), game.js
public/games/surge/game.js                               new
public/games/bridge.js                                   adds readers["surge"]
lib/games.ts                                             adds the entry after froggy, updates the comment above GAMES
app/globals.css                                          adds av-cover-surge
supabase/migrations/YYYYMMDDHHMMSS_add_surge_game.sql    inserts the games row (new)
references/implemented-games.md                          adds the surge row
CLAUDE.md                                                documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/surge/` does not exist. Manual test: there are seven migrations, `public.games` has `asteroids`, `drop`, `brick-buster`, `snake` and `froggy`, and both commands pass. If not, stop and report.
2. **Folder, loop and board.** Create `public/games/surge/` with `index.html` (bridge tag, 600×600 canvas, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop, the cached sprites and the drawing of the HUD, the board, the cells and the preview row. Manual test: open `/games/surge/index.html` directly, the title screen shows, and Space shows rows 6 to 9 filled with four colors, each with its glyph, and a preview row below.
3. **Cursor and keys.** Add the cursor, the arrow keys and `preventDefault`. Manual test: each arrow press moves the cursor one cell, a held arrow keeps moving, the cursor stops at all four edges, and the page does not scroll.
4. **Clear, gravity and score.** Add the flood fill, the clear, the gravity tween, the lightning effect and the score. Manual test: clearing a group of 3 adds 9 and a group of 5 adds 25, a single cell or an empty cell adds nothing and shakes the cursor, the blocks above fall into the gap, and no column shifts sideways.
5. **Rise, level and ending.** Add the rise timer, the rise bar, the level, the danger edge, the end screen and the restart. Manual test: a row rises after 8 s at level 1, the cursor stays on the same block, `level` is 2 after 10 rises and the interval is 7.5 s, the top edge glows when a block is in row 0, the next rise shows `GAME OVER`, and Space or Enter starts a clean run with score 0 and level 1.
6. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/surge/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
7. **Bridge reader.** Add `readers["surge"]`. Manual test: in the host console, `message` events with `game: "surge"` carry a changing `score` and `level`, `lives: null`, and `over: true` at game over.
8. **Cover art.** Add `av-cover-surge`. Manual test: the cover renders on a temporary card at desktop and at 375 px, and it shows in `/library` after step 9.
9. **Catalog entry.** Add the entry with its `touch` config to `lib/games.ts` after `froggy`, and update the comment above `GAMES`. Manual test: `/library` shows six cards, `/game/surge` shows the detail, and the `Puzzle` filter lists Drop and Surge.
10. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has six rows, including `surge`, and there is no new advisor warning about `games` or `scores`.
11. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, touch config) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `surge`.
12. **Play and rank.** In `/game/surge/play`, play a run to the end, type a name and save. Manual test:
    - the pad arrows move the cursor and repeat while held, and `A` and `B` clear a group;
    - host Pause stops the rise bar, and Resume continues it from the same point;
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'surge'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Surge` and not under another game.

    Delete the test row afterwards.

13. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: six games, SPEC GJ surge-01 added Surge as a new game, and `CATEGORIES` is unchanged;
    - the `supabase/migrations/` bullet: eight migrations, `add_surge_game`;
    - the `public/games/<id>/` bullet: `surge` is a square 600×600 game with `fitToFrame()`, written from scratch with canvas art only, with `lives: null` and `over` only at `gameover`.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/surge/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/surge/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="surge"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies and no image or audio file.
- [ ] A new run starts with rows 6 to 9 filled, rows 0 to 5 empty, score 0, level 1 and the cursor at column 5, row 9.
- [ ] Each arrow press moves the cursor exactly one cell, and the cursor never leaves the 12×10 board.
- [ ] Clearing a group of `n >= 2` same-color cells adds exactly `n²` points, and a single or empty cell adds nothing.
- [ ] After a clear, every column has no empty cell below a block, the order of the blocks in each column is kept, and no column moves sideways.
- [ ] At level `L` a row rises every `max(2, 8 - 0.5 × (L - 1))` seconds, and the cursor stays on the same block.
- [ ] `level` equals `1 + floor(rises / 10)`.
- [ ] A rise while a column has a block in row 0 sets `state = 'gameover'`, and no other event ends the run.
- [ ] Space or Enter on the end screen starts a new run with score 0 and level 1.
- [ ] The rise timer does not advance in `ready` or `gameover`.
- [ ] `GAMES` has exactly one entry with `id: "surge"`, `src: "/games/surge/index.html"`, `aspect: "1 / 1"`, `accent: "cyan"`, `category: "Puzzle"`, `difficulty: 2` and a `touch` config, placed after `froggy`.
- [ ] `/library` lists Surge with its rendered cover, the `Puzzle` filter lists Drop and Surge, and the other five games are unchanged.
- [ ] `/game/surge` shows the title, description, controls `Arrows to move · SPACE or ENTER to clear a group · SPACE to start` and `PUZZLE`.
- [ ] `/game/surge/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page.
- [ ] At 1530×772 and at 375×812 the whole 600×600 canvas is visible inside the frame, and the game document does not overflow.
- [ ] The host receives `state` messages with `game: "surge"` carrying `score`, `lives: null`, `level` and `over`, and `over` is `true` only at game over.
- [ ] Pause and resume from the host freeze and resume the game and its rise timer through the bridge.
- [ ] `public.games` has the row `('surge', 'Surge', 'Puzzle', 'cyan')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'surge'` and appears in `/hall-of-fame` under `Surge` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `surge`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, the `KEYS` table of `bridge.js`, the other games' folders and the other covers have no edits (`git diff` is empty for them).
- [ ] `references/implemented-games.md` and `CLAUDE.md` document Surge, the eight migrations and the `public/games/surge/` folder.

---

## Decisions

- **Yes:** a new game with id `surge` and title `Surge`, original name and look (user decision). **No:** a reference game or an archived entry, because none matches.
- **Yes:** category `Puzzle` and accent `cyan` (user decisions). Cyan becomes the accent of three games out of six; this is flagged for review and kept.
- **Yes:** a 600×600 canvas with `aspect: "1 / 1"` (user decision). A 12×10 board of 50 px cells, with a HUD band on top and a preview row below (game-jam decision).
- **Yes:** the cursor moves with the arrows and Space clears a group of 2 or more same-color cells, which then fall by gravity (user decision). Enter clears too, so the pad `B` has a real action (game-jam decision). **No:** WASD, mouse or tap, because the user did not ask for them.
- **Yes:** a group of `n` cells scores `n²` (user decision). The `Math.min` cap at 9,999,999 is a game-jam decision. **No:** a penalty for a single cell, combo bonuses or a bonus for an empty board, because the user listed none.
- **Yes:** gravity only drops blocks down inside their column (user decision, "fall by gravity"). **No:** shifting columns left when one empties, because the rising rows refill every column.
- **Yes:** a new row rises on a timer and `level` is the rise speed (user decision). The interval `max(2, 8 - 0.5 × (level - 1))` s and one level per 10 risen rows are game-jam decisions, tunable in step 5.
- **Yes:** "a column reaches the top" means a column has a block in row 0, and the run ends at the next rise, which would push it out (game-jam decision). The danger edge warns the player first. **No:** ending the moment a block enters row 0, which gives no time to react. Flagged for review.
- **Yes:** `lives: null`, one run per game (user decision), and the standard globals `score`, `lives`, `level` and `state` of `contract.md`.
- **Yes:** four colors for the whole run, each with its own glyph (game-jam decision). **No:** more colors at higher levels, because the user made the level the rise speed only.
- **Yes:** the next row is shown in the preview band (game-jam decision), so a rise is never a surprise.
- **Yes:** no pause key and no pause on `blur`; the host pause is the only pause (game-jam decision, as in Froggy). **No:** a P key, which the user did not ask for.
- **Yes:** a `touch` config with the four arrows on `repeat: true`, `A` = `Space` and `B` = `Enter` (game-jam decision, required by SPEC 12 and `lib/games.test.ts`). **No:** the `TOUCH` tag, because the game itself has no touch control.
- **Yes:** difficulty 2, the tagline, the description, the controls string, `plays: "4.8K"` and the tags `1 PLAYER`, `KEYBOARD`, `RETRO 1985` (game-jam decisions).
- **Yes:** cached sprites and no `shadowBlur` in the frame loop, following the SPEC 14 rules (game-jam decision).
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09, SPEC 10 and SPEC 11. **No:** changing `CRTScreen`.
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.
- **Yes:** special blocks are their own spec, SPEC GJ surge-02 (game-jam decision).

---

## Risks

| Risk                                                                                                              | Mitigation                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.                 | The globals follow the contract names. `report()` swallows the error, so step 7 checks the messages by hand; `lib/games.test.ts` checks the reader exists. |
| `over` is not true for every way the run ends, so the score is never saved.                                       | The only ending is `gameover`, reached from a rise with a block in row 0. Step 12 plays a full run to the end.                                             |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                   | `n²` is an integer, and `Math.min(MAX_SCORE, …)` caps it (see the score bound above).                                                                      |
| The game has its own pause and conflicts with the host pause.                                                     | It has none. The rise timer and the tweens advance from loop deltas of `performance.now()`, so the bridge freezes them. Step 12 checks it.                 |
| The `games` row is missing, so the foreign key rejects every score.                                               | Step 10, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                        |
| Cyan is the accent of three games, so the catalog looks unbalanced.                                               | User decision, kept. Flagged in Why this spec exists for review; changing it later is one field, one cover rule and one migration.                         |
| A `1 / 1` frame at desktop width can be taller than the viewport, so the bottom of the frame needs a page scroll. | The game fits its iframe. Step 6 looks at it at 1530×772. Capping the frame height is out of scope, as in SPEC 11.                                         |
| A recursive flood fill or a full redraw with glow every frame makes the game slow on a phone.                     | The fill uses an explicit stack, and the sprites are cached (SPEC 14 rules). The `game-performance-booster` agent can measure it later.                    |
| The drawn tween and the logical grid disagree, so a clear hits a block that looks elsewhere.                      | The grid changes at once and the tween is drawing only. Step 4 clears groups while blocks are still falling.                                               |
| Random rows leave a board with few groups, and the run feels unfair.                                              | Four colors on 12 columns give many pairs. The color count and the start rows are constants, tunable in step 5.                                            |
| The four colors are hard to tell apart for color-blind players.                                                   | Each color has its own glyph (ring, diamond, triangle, bar).                                                                                               |
| The game looks too close to Drop, the other Puzzle game.                                                          | Different play (cursor and group clear, no falling pieces), a square board and its own circuit look.                                                       |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit.    | Same behavior as Asteroids, Snake and Froggy. Any credit change is a separate spec.                                                                        |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                                  | Accepted, as in SPEC 09, SPEC 10 and SPEC 11.                                                                                                              |

---

## What is **not** in this spec

- Special blocks such as bombs or rise stoppers (SPEC GJ surge-02).
- Sound, a pause key, swipe or tap on the canvas, column shifting, a "raise now" key, extra colors or combo bonuses.
- Skins and the light/dark toggle (the `skin-designer` agent, after implementation).
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
