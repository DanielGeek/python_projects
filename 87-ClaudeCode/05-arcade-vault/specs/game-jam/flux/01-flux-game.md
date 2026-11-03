# SPEC GJ flux-01 — Flux game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-11-02
> **Objective:** Add a new pipe-routing puzzle, written from scratch, to the vault as a playable catalog entry with id `flux`, ranked in the global leaderboard: place queued pipe pieces with the arrows and Space ahead of an energy flow, score per segment crossed plus a loop bonus, clear a level at the length target and end the run on a leak.

---

## Why this spec exists

The `game-planner` backlog has the idea "Flux": a pipe-routing race on a 4:3 grid. The player places queued pipe pieces with the arrows and Space before the energy flow reaches the open end of the route. Every segment the flow crosses scores, and a loop earns a bonus. The run ends on a leak, and reaching the length target moves to the next level. The backlog also fixes `lives: null`, a green accent, and no "Pipe Mania" branding. It notes that the flow timing makes it slightly costlier than the other puzzles.

There is no reference game for it, so the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill, with the standard globals `score`, `lives`, `level` and `state`.

Platform checks, flagged and not redesigned:

- **No match in the catalog or the archive.** No game in `GAMES` (`asteroids`, `drop`, `brick-buster`, `snake`, `froggy`) or `ARCHIVED_GAMES` (`serpent`, `muncher`, `invaders`, `rocks`, `pixel-duel`) routes pipes, so nothing is restored. The id `flux` is free in `GAMES`, `ARCHIVED_GAMES`, `public/games/` and `specs/game-jam/`.
- **Puzzle balance.** Flux would be the second Puzzle in `GAMES` after `drop`. The drafts `prism` and `surge` are Puzzle too, so if all three land, Puzzle holds four games. Recorded in Risks for the user to weigh.
- **Green accent.** Green is already used by `snake`. The backlog asks for green, so this spec keeps it.
- **Name.** The game, its copy, its cover and its code never use the names of the commercial games this genre is known for ("Pipe Mania", "Pipe Dream") or their words for the liquid. Only generic words (pipe, segment, flow, energy, source, leak) are used.
- **SPEC 18.** SPEC 18 (Approved, not implemented on this date) adds a `not null` column `games.max_score`. If it lands before this spec, the `games` insert below must carry `max_score` too. The value is in the Data model.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The `touch` config is part of the catalog entry, because `lib/games.test.ts` fails without it.

---

## Scope

**In:**

- New folder `public/games/flux/` with `index.html` and `game.js`, written for this spec. All art is drawn on the canvas: no image, no audio, no third-party asset.
- `index.html` loads `../bridge.js` with `data-game="flux"` before `game.js`, has `lang="en"` and an 800×600 canvas inside a `#stage` wrapper.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, and `preventDefault` on the arrow keys and Space.
- The rules of the Data model: a 10×7 grid, a source, a queue of five pieces, a cursor, placing and replacing pieces, the start countdown, the flow, segments, loops, the length target, levels, the leak, pause and restart.
- A HUD bar on top (score, level, length, flow countdown), a queue panel on the left and a key-hint line at the bottom, drawn inside the canvas.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake`.
- A `readers["flux"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` after the last entry, with a `touch` config and the comment above `GAMES` updated.
- Cover art: an `av-cover-flux` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_flux_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md` (the `games.ts`, `supabase/migrations/` and `public/games/<id>/` bullets).

**Out of scope (for future specs):**

- Board hazards and special cells such as blocked cells or reservoirs (SPEC GJ flux-02 adds them).
- A key to release the flow early or to speed it up, bonuses for unused pieces, and any rule not listed in the Data model.
- Sound and music.
- Skins and the light/dark toggle. They are added to the games the user names with the `skin-designer` agent, which `/spec-impl-game` runs after the last step.
- Swipe or tap-to-place controls, and layout work for phones beyond `fitToFrame()` and the `touch` config; the `mobile-porter` agent does the rest.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Auth and a score validation service (see SPEC 08 and SPEC 18).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:flux` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`, after the last entry):

```ts
{
  id: "flux",
  title: "Flux",
  category: "Puzzle",
  tagline: "Lay the pipe faster than the energy flows.",
  description:
    "Energy is about to leave the source. Move the cursor and place the queued pipe pieces to build a route ahead of it, swapping any piece the flow has not reached. Every segment the flow crosses scores, and running it twice through a cross piece closes a loop for a bonus. Reach the length target to move on, but one leak ends the run.",
  accent: "green",
  src: "/games/flux/index.html",
  aspect: "4 / 3",
  controls: "Arrows to move · SPACE to place · P to pause",
  touch: {
    move: [
      { code: "ArrowUp", label: "▲", name: "Cursor up", repeat: true },
      { code: "ArrowLeft", label: "◀", name: "Cursor left", repeat: true },
      { code: "ArrowRight", label: "▶", name: "Cursor right", repeat: true },
      { code: "ArrowDown", label: "▼", name: "Cursor down", repeat: true },
    ],
    a: { code: "Space", label: "A", name: "Place, start or restart" },
    b: { code: "KeyP", label: "B", name: "Pause" },
  },
  difficulty: 3,
  plays: "4.8K",
  tags: ["1 PLAYER", "KEYBOARD", "ROUTING"],
}
```

`plays` is mock data, as for every game. The description lists only what the rules below do.

Game globals (`public/games/flux/game.js`, top-level `let`/`const` of a classic script):

```js
const COLS = 10,
  ROWS = 7,
  CELL = 60; // grid of 600×420 px
const GRID_X = 170,
  GRID_Y = 100; // top-left corner of the grid on the 800×600 canvas
const N = 1,
  E = 2,
  S = 4,
  W = 8; // opening bits of a cell
const PIECES = [10, 5, 3, 6, 12, 9, 15]; // masks: ─ │ └ ┌ ┐ ┘ ┼  (E|W, N|S, N|E, E|S, S|W, W|N, all four)
const QUEUE_SIZE = 5;
const MAX_SCORE = 9999999;
let state = "ready"; // 'ready' | 'playing' | 'cleared' | 'paused' | 'gameover'
let grid = []; // ROWS arrays of COLS cells; a cell is null or { kind, mask, flow }
let queue = []; // QUEUE_SIZE masks from PIECES; queue[0] is the piece Space places
let cursor = { col: 0, row: 0 };
let source = null; // { col, row, dir }, dir is the opening bit the flow leaves by
let flow = null; // null before it starts; then { col, row, inBit, outBit, progress }, progress 0..1
let waitMs = 0; // milliseconds left before the flow leaves the source
let fillMs = 0; // milliseconds the flow takes to cross one segment on this level
let crossed = 0; // segments the flow has completed on this level
let goal = 0; // segments needed to clear this level
let leak = null; // { col, row } where the flow spilled, or null
let rejectMs = 0; // milliseconds left of the red cursor flash after a rejected placement
let clearMs = 0; // milliseconds left of the LEVEL CLEAR banner
let endedAt = 0; // performance.now() when the run ended, for the restart lockout
let score = 0,
  level = 1;
const lives = null; // the game has no lives
```

A cell is `{ kind, mask, flow }`. `kind` is `'source'` or `'pipe'`. `mask` holds the opening bits of the cell. `flow` holds the opening bits the energy has already used. Every routine that places, enters or draws a cell reads `kind` and `mask`, so a cell is not tied to the seven pieces. SPEC GJ flux-02 relies on that.

Rules:

- **Grid.** 10 columns by 7 rows of 60 px cells at (170, 100). Row 0 is the top row. Openings use the bits `N`, `E`, `S` and `W`, and `opposite(N) = S`, `opposite(E) = W`.
- **Pieces.** Seven pieces: horizontal, vertical, the four elbows and the cross. Each new queue entry is one of the seven with equal chance. The queue holds 5 pieces and is drawn top to bottom in the left panel, with `queue[0]` framed and labelled `NEXT`.
- **Board.** At the start of each level the grid is empty except for the source. The source cell is random with `col` from 1 to 8 and `row` from 1 to 5, so it never touches the edge, and `dir` is one of the four bits at random. It is stored as `{ kind: 'source', mask: dir, flow: dir }` and drawn as a round green core with one spout towards `dir`. The cursor starts on the cell next to the source in direction `dir`. The queue is refilled with 5 new pieces.
- **Level values.** `goal = min(30, 10 + 2 × (level - 1))`: 10 at level 1, 30 from level 11. `fillMs = max(600, 2000 - 120 × (level - 1))`: 2000 ms at level 1, 600 ms from level 13. `waitMs` starts at `max(4000, 14000 - 1000 × (level - 1))`: 14 s at level 1, 4 s from level 11. `crossed`, `flow`, `leak` and `rejectMs` are reset.
- **Cursor.** The arrows move the cursor one cell and stop at the edges of the grid (no wrap). A held arrow repeats through the browser key repeat. The cursor can move in `playing` only.
- **Placing.** Space (not a key repeat) tries to place `queue[0]` on the cursor cell:
  - an empty cell gets `{ kind: 'pipe', mask: queue[0], flow: 0 }`;
  - a `pipe` cell with `flow === 0` is replaced by the new piece, and the old piece is discarded;
  - the source, and any cell with `flow !== 0` (the flow has entered it), reject the placement: nothing changes, the queue does not move and the cursor flashes red for 200 ms (`rejectMs`).
  - After a placement, `queue` shifts by one and a new random piece is added at the end.
- **Countdown.** In `playing`, `waitMs` goes down by the frame delta. The HUD shows `FLOW IN n`, with `n = ceil(waitMs / 1000)`. When it reaches 0 the flow leaves the source and the HUD shows `FLOWING`.
- **Entering a cell.** The flow moves from a cell through its `outBit` to the neighbour in that direction. The side of the neighbour it enters is `inBit = opposite(outBit)`. The entry is valid only when the neighbour is inside the grid, is a `pipe`, has `inBit` in its `mask`, and does not have `inBit` in its `flow`. On a valid entry, `flow` becomes `{ col, row, inBit, outBit, progress: 0 }` for the neighbour, its `outBit` is `opposite(inBit)` for the cross and `mask` minus `inBit` for every other piece, and `inBit` is added to the cell's `flow` at once, so the cell is locked against replacement.
- **Leak.** An entry that is not valid is a leak: `leak` is set to the neighbour cell (or to the edge position just outside the grid), `state = 'gameover'` and `endedAt = performance.now()`. The leak is the only way a run ends.
- **Crossing a segment.** While the flow is in a cell, `progress` grows by `delta / fillMs` each frame, with each delta capped at 100 ms, so the host pause freezes it. The filled part is drawn as a bright line growing from the entry side to the exit side along the pipe (a straight line, or a quarter arc of radius 30 px for an elbow). When `progress` reaches 1, `outBit` is added to the cell's `flow`, `crossed` goes up by 1, and the flow tries to enter the next cell at once.
- **Scoring.** Each completed segment adds `10 × level`. A cross piece crossed twice is a loop: when the flow completes the second pass through a cross (its `flow` now holds all four bits), it adds a loop bonus of `100 × level` on top of the segment points. Both passes count as segments for `crossed`. `score = Math.min(MAX_SCORE, score + points)` on every addition. Nothing else scores, and nothing takes points away.
- **Length target.** When `crossed` reaches `goal`, the level is cleared at once: the flow stops, `state = 'cleared'` and `clearMs = 1500`. The banner `LEVEL CLEAR` shows over the grid, and all input is ignored. When `clearMs` reaches 0, `level` goes up by 1, the next board is built with the level values above and `state` returns to `playing`. `score` carries over.
- **Start.** `ready` shows the title `FLUX` and "SPACE to start". Space or Enter starts the run with score 0, level 1 and a new board.
- **Restart.** The end screen keeps the grid visible, draws a spill mark on the leak cell, and shows `LEAK`, `GAME OVER`, the score and "SPACE to play again". Space or Enter resets every global and starts level 1. Both are ignored for 500 ms after the run ends (measured from `endedAt` with `performance.now()`), so a Space pressed to place a piece does not restart the run by accident.
- **Pausing.** P switches between `playing` and `paused` and shows `PAUSED`. P is ignored on `ready`, `cleared` and `gameover`. The game does not pause on `blur`, so there is no conflict with the host pause.
- **Keys.** The `keydown` handler is on `document`, as the bridge dispatches its synthetic keys there. It calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`. Space ignores `e.repeat`; the arrows accept it.
- **Layout.** HUD bar from y 0 to 80: `SCORE`, `LEVEL`, `LENGTH crossed/goal` and the flow status. Queue panel from x 30 to 130 and y 100 to 520, five slots of 60 px with 20 px between them. Key hints on y 560: `ARROWS move · SPACE place · P pause`. All text is drawn with the canvas font, in English.
- **Drawing.** The seven empty pipe sprites, the source, and the full-flow sprites (one per piece, plus one per axis of the cross) are drawn once into offscreen canvases when the script loads and copied with `drawImage`. Only the segment being filled is stroked each frame. The frame loop never calls `shadowBlur`, never builds gradients and never allocates arrays or font strings (the rules learnt in SPEC 14).

Score bound: a level has at most 30 segments, worth `30 × 10 × level`, and at most 15 loops, because each loop uses two of those segments, worth `15 × 100 × level`. So a level is worth at most `1,800 × level`, and a run to level 20 stays under 400,000. The clamp to 9,999,999 guarantees the bound in any case. The score is always an integer.

Bridge reader (`public/games/bridge.js`). `over` is true only after a leak, and turns false again when Space starts a new run, so each run is saved on its own. A level clear does not end the run:

```js
flux: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on `#stage` to `Math.min(1, innerWidth / canvas.width, innerHeight / canvas.height)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.

Migration (`supabase/migrations/<version>_add_flux_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('flux', 'Flux', 'Puzzle', 'green');
```

If SPEC 18 is already implemented, the column list gains `max_score` and the tuple gains `250000`, still on one line: `values ('flux', 'Flux', 'Puzzle', 'green', 250000);`. The value follows the SPEC 18 rule: a strong run to level 20 with three loops per level is about 121,600 points, times a margin of 2, rounded up.

Cover art (`app/globals.css`, `.av-cover-flux` and `::after`, no image file):

- A dark green-to-void gradient background with a faint grid made with repeating linear gradients.
- A route of thick `var(--green)` pipe bands: a horizontal band from the left edge to the middle, then a vertical band down to the bottom, built with linear-gradient layers and `background-position`, as in `av-cover-snake`.
- A round source core on the left end (radial gradient) and a bright energy front partway along the route (a smaller radial gradient in white over green).
- A `drop-shadow` glow in green.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `flux` in the route, `av-cover-flux`, the bridge key and `arcade-vault:scores:flux`.
- `score` is an integer from 0 to 9,999,999. `over` is true after a leak, the only ending.
- `GAMES` order puts `flux` last, so Asteroids stays the first landing tile and the default Hall of Fame tab.
- `touch` codes: `ArrowUp`, `ArrowLeft`, `ArrowRight`, `ArrowDown`, `Space` and `KeyP`. All appear in `game.js` and in the bridge `KEYS` allowlist. `A` and `B` are different codes. The four arrows have `repeat: true`, because a synthetic `keydown` does not auto-repeat and the cursor moves once per keydown.

File layout:

```
public/games/flux/index.html                       new, loads ../bridge.js (data-game="flux"), game.js
public/games/flux/game.js                          new
public/games/bridge.js                             adds readers["flux"]
lib/games.ts                                       adds the entry last, updates the comment above GAMES
app/globals.css                                    adds av-cover-flux
supabase/migrations/<version>_add_flux_game.sql    inserts the games row (new)
references/implemented-games.md                    adds the flux row
CLAUDE.md                                          documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/flux/` does not exist, and whether SPEC 18 has added `games.max_score`. Manual test: the rows of `public.games` match the ids in `GAMES`, the migration files match `list_migrations`, and both commands pass. If not, stop and report.
2. **Folder, grid and drawing.** Create `public/games/flux/` with `index.html` (bridge tag, 800×600 canvas in `#stage`, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop, the offscreen sprites, the HUD bar, the queue panel, the grid, the source, the hint line and the title screen. Manual test: open `/games/flux/index.html` directly, and the title, the grid and the panels are drawn. Filling `grid` from the console with each of the seven masks shows seven different pipes with openings on the right sides.
3. **Cursor, queue and placing.** Add the board build, the cursor, the queue, placing, replacing, the rejection flash and the `preventDefault` on the keys. Manual test: the arrows move the cursor and stop at the edges; Space places `queue[0]` and the queue shifts; Space on an unflowed pipe replaces it; Space on the source flashes red and leaves the queue as it was; a held Space places only one piece; the page does not scroll.
4. **Countdown and flow.** Add `waitMs`, the flow entry rule, the per-segment fill with the growing line, `crossed` and the leak. Manual test: `FLOW IN 14` counts down at level 1; the flow then fills one segment every 2 s along straights and elbows; a pipe the flow has entered can no longer be replaced; a route that ends in an empty cell, a wrong opening, a filled channel or the grid edge leaks and shows `GAME OVER`.
5. **Score, loops and levels.** Add the scoring, the loop bonus, the length target, the `cleared` banner and the next board. Manual test: each segment at level 1 adds 10; a second pass through a cross adds 10 + 100; after 10 segments `LEVEL CLEAR` shows for 1.5 s, then level 2 has a new source, `goal` 12, `fillMs` 1880 and a 13 s countdown, and the score carries over.
6. **Start, restart and pause.** Add the title start, the end screen with the spill mark, the 500 ms restart lockout and the P pause. Manual test: Space within 500 ms of the leak does nothing and afterwards starts a clean level 1; Enter does the same; P pauses the countdown and the flow, and is ignored during `LEVEL CLEAR`.
7. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/flux/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
8. **Bridge reader.** Add `readers["flux"]`. Manual test: in the host console, `message` events with `game: "flux"` carry a changing `score` and `level`, `lives: null`, `over: false` through a level clear, `over: true` after a leak, and `false` again after the restart.
9. **Cover art.** Add `av-cover-flux`. Manual test: the cover renders on a temporary card at desktop and at 375 px. It shows in `/library` after step 10.
10. **Catalog entry.** Add the entry, with `touch`, to `lib/games.ts` last and update the comment above `GAMES`. Manual test: `/library` shows one more card, `/game/flux` shows the detail with the `PUZZLE` category, and the `Puzzle` filter lists Drop and Flux (plus any other Puzzle game already implemented). On a touch emulation, the pad shows all four directions, holding ◀ keeps moving the cursor, `A` places and `B` pauses.
11. **Migration.** Write the SQL file (with `max_score` only if step 1 found the column) and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has the `flux` row, and there is no new advisor warning about `games` or `scores`.
12. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, touch codes) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `flux`.
13. **Play and rank.** In `/game/flux/play`, clear level 1, then let the flow leak, and save. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'flux'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Flux` and not under another game.

    Delete the test row afterwards.

14. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: Flux added by SPEC GJ flux-01 as a new game, with its `touch` config;
    - the `supabase/migrations/` bullet: one more migration, `add_flux_game`;
    - the `public/games/<id>/` bullet: `flux` is an 800×600 game with a 10×7 grid of 60 px cells, `fitToFrame()`, canvas art only, `lives: null`, `over` only after a leak, and `repeat` on the four arrows of its pad.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/flux/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/flux/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="flux"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies and no image or audio file.
- [ ] The grid has 10 columns and 7 rows, and the source is never on the outer ring of cells.
- [ ] The queue shows 5 pieces, and every piece is one of the seven masks of `PIECES`.
- [ ] The arrows move the cursor one cell and stop at the edges of the grid.
- [ ] Space places `queue[0]` on an empty cell or on a pipe the flow has not entered, and the queue shifts by one. A held Space places one piece only.
- [ ] Space on the source or on a pipe the flow has entered changes nothing and flashes the cursor red.
- [ ] The flow leaves the source after `max(4000, 14000 - 1000 × (level - 1))` ms and fills one segment every `max(600, 2000 - 120 × (level - 1))` ms.
- [ ] Each completed segment adds exactly `10 × level`, and the second pass through a cross adds `100 × level` more.
- [ ] The flow entering an empty cell, a side without an opening, an already used channel or the grid edge ends the run with `GAME OVER` and a spill mark, and nothing else ends it.
- [ ] When `crossed` reaches `min(30, 10 + 2 × (level - 1))`, `LEVEL CLEAR` shows for 1.5 s, then the level rises by 1 with a new board and the score kept.
- [ ] Space or Enter on the end screen starts a new run with score 0, level 1 and a new board, and is ignored during the first 500 ms after the run ends.
- [ ] P pauses and resumes the countdown and the flow. The game does not pause on its own when the iframe loses focus.
- [ ] The score never exceeds 9,999,999 and is always an integer.
- [ ] `GAMES` has exactly one entry with `id: "flux"`, `src: "/games/flux/index.html"`, `aspect: "4 / 3"`, `accent: "green"`, `category: "Puzzle"` and `difficulty: 3`, placed last, with the `touch` config of the Data model.
- [ ] The words "Pipe Mania" and "Pipe Dream" appear nowhere in `public/games/flux/`, the `GAMES` entry, the cover rule or `CLAUDE.md`.
- [ ] `/library` lists Flux with its rendered cover, and the other games are unchanged.
- [ ] `/game/flux` shows the title, description, controls `Arrows to move · SPACE to place · P to pause` and `PUZZLE`.
- [ ] `/game/flux/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page.
- [ ] At 1530×772 and at 375×812 the whole 800×600 canvas is visible inside the frame, and the game document does not overflow.
- [ ] On a touch device the pad moves the cursor in four directions (with repeat), `A` places and `B` pauses.
- [ ] The host receives `state` messages with `game: "flux"` carrying `score`, `lives: null`, `level` and `over`, and `over` is `true` after a leak and `false` during a level clear.
- [ ] Pause and resume from the host freeze and resume the countdown and the flow through the bridge.
- [ ] `public.games` has the row `('flux', 'Flux', 'Puzzle', 'green')` (plus `max_score` 250000 if SPEC 18 is in), and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'flux'` and appears in `/hall-of-fame` under `Flux` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `flux`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, the bridge protocol, the other games' folders and `references/` (except `implemented-games.md`) have no edits (`git diff` is empty for them).
- [ ] `CLAUDE.md` and `references/implemented-games.md` document Flux, its migration and the `public/games/flux/` folder.

---

## Decisions

- **Yes:** a new game called Flux, a pipe-routing race on a 4:3 grid where queued pieces are placed with the arrows and Space before the energy flow reaches the open end (user decision, from the backlog). **No:** changing any of those rules.
- **Yes:** score per segment crossed plus a loop bonus, the run ends on a leak, reaching the length target moves to the next level, and `lives: null` (user decisions). **No:** lives, a timer ending or a second way to end the run.
- **Yes:** category Puzzle, a green accent and no "Pipe Mania" branding (user decisions). **No:** another accent to balance against `snake`.
- **Yes:** the id `flux` and the title `Flux` (user decisions). Difficulty 3, the tagline, description, `plays` and tags (`1 PLAYER`, `KEYBOARD`, `ROUTING`) are game-jam decisions. **No:** a `RETRO` year tag, which would point at the commercial game.
- **Yes:** a 10×7 grid of 60 px cells on an 800×600 canvas with `aspect: "4 / 3"`, and a queue of 5 pieces in a left panel (game-jam decisions). **No:** a bigger grid, where the cells would be too small at 375 px.
- **Yes:** seven pieces with equal chance: two straights, four elbows and a cross (game-jam decision). **No:** weighted pieces or a bag, kept simple until play shows a need.
- **Yes:** the level clears the moment `crossed` reaches `goal` (game-jam decision, reading "reaching the length target moves to the next level" literally). **No:** letting the flow run on past the target, which would make a later leak end the run after the target was met.
- **Yes:** a loop is the second pass of the flow through a cross piece, worth `100 × level` on top of the segment points, and both passes count as segments (game-jam decision on what "loop" means). **No:** detecting closed rings of pipes, which the flow cannot cross twice anyway.
- **Yes:** `10 × level` per segment (game-jam decision). **No:** a level-clear bonus or a penalty for replaced or unused pieces, which the description does not ask for.
- **Yes:** replacing a piece the flow has not entered, with no point cost (game-jam decision): the cost is the lost piece and the time. **No:** replacing a piece the flow is in or has crossed.
- **Yes:** level values `goal = min(30, 10 + 2 × (level - 1))`, `fillMs = max(600, 2000 - 120 × (level - 1))` and a countdown of `max(4000, 14000 - 1000 × (level - 1))` ms (game-jam decisions). **No:** obstacles in the base game; they come with SPEC GJ flux-02.
- **Yes:** the source is random, away from the edge, with a random direction, and the cursor starts in front of its spout (game-jam decision). **No:** a fixed source, which would make every level 1 the same.
- **Yes:** a 500 ms restart lockout after the leak (game-jam decision), because Space is also the place key. **No:** a restart key different from Space.
- **Yes:** arrows, Space and P, with Enter also starting and restarting (game-jam decision), and no pause on `blur`, the cause of the Brick Buster resume issue (SPEC 10).
- **Yes:** `touch` with all four arrows on `repeat`, `A` Space and `B` KeyP (game-jam decision). **No:** tapping a cell to place, which needs pointer code and is out of scope.
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09 and SPEC 10. **No:** changing `CRTScreen`.
- **Yes:** pipe sprites and full-flow sprites drawn once into offscreen canvases, and only the filling segment stroked per frame (game-jam decision, from SPEC 14).
- **Yes:** `max_score` 250000 if SPEC 18 lands first (game-jam decision, by the SPEC 18 rule). **No:** adding `max_score` when the column does not exist yet.
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.

---

## Risks

| Risk                                                                                                                    | Mitigation                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.                       | The globals follow the contract names. Step 8 checks the messages by hand, and `lib/games.test.ts` checks the reader exists.                                                                         |
| `over` is not true for every way the run ends, so the score is never saved.                                             | The only ending is the leak, and a level clear keeps `over` false on purpose. Steps 4 and 13 play a leak to the end, and the criteria check both states.                                             |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                         | Every term is an integer, and `Math.min(MAX_SCORE, …)` caps it on each addition (see the score bound above).                                                                                         |
| The game has its own pause and conflicts with the host pause.                                                           | The P pause only switches `state`. The countdown and the flow advance with `performance.now()` deltas inside `requestAnimationFrame`, so the bridge freezes them. The game does not pause on `blur`. |
| The `games` row is missing, so the foreign key rejects every score.                                                     | Step 11, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                                                                  |
| SPEC 18 lands before this spec and the insert without `max_score` fails on the `not null` column.                       | Step 1 checks for the column, and the Data model gives the one-line tuple with `250000`.                                                                                                             |
| The flow timing is the costly part: the progress, the entry rule and the leak are easy to get wrong at segment borders. | The flow is one object with `progress` from 0 to 1, and the entry check runs only when a segment completes. Step 4 tests every leak case and step 5 tests a loop.                                    |
| A large frame delta (tab in the background, slow device) skips a whole segment and the leak check.                      | Each delta is capped at 100 ms, below the 600 ms minimum `fillMs`, so a frame never completes more than one segment.                                                                                 |
| The genre resembles well-known commercial games, and the name or look could imply a copy.                               | The name is Flux, the art is original and drawn on the canvas, and the criteria check that "Pipe Mania" and "Pipe Dream" appear in no shipped file. The mechanics of a genre are not protected.      |
| Puzzle grows heavier than the other categories: Drop and Flux, plus Prism and Surge if those drafts land.               | Kept as the backlog describes it. The user can reorder or drop specs at review.                                                                                                                      |
| Green is shared with Snake, so two library cards use the same accent.                                                   | User decision. The cover (pipe route against a snake body) tells them apart.                                                                                                                         |
| A random source next to an unlucky queue makes level 1 harder in one run than in another.                               | Accepted. The 14 s countdown and replacing pieces leave room to recover. Weighted pieces can be a balance spec.                                                                                      |
| Space ends a run with a placement and then restarts it at once.                                                         | Space ignores `e.repeat`, and Space and Enter are ignored for 500 ms after the leak. Step 6 tests it.                                                                                                |
| A synthetic `keydown` from the touch pad does not auto-repeat, so the cursor would move once per tap.                   | `repeat: true` on the four arrows, and step 10 tests holding ◀.                                                                                                                                      |
| At 375 px the 60 px cells shrink to about 28 px after `zoom`, and the pipes are small.                                  | The pipes are thick strokes with a bright flow, readable at that size. A phone layout is for `mobile-porter` or its own spec.                                                                        |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                                        | Accepted, as in SPEC 09 and SPEC 10.                                                                                                                                                                 |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit.          | Same behavior as Asteroids and Snake. Any credit change is a separate spec.                                                                                                                          |
| The game has no skins, while the other games may have them.                                                             | Skins are added by the `skin-designer` agent, which `/spec-impl-game` runs after the last step.                                                                                                      |

---

## What is **not** in this spec

- Blocked cells, reservoirs or any other special cell.
- A key to release or speed up the flow, bonuses for unused pieces, or penalties.
- Sound or music.
- Skins and a light/dark toggle.
- Tap-to-place or swipe controls, or layout work for phones beyond `fitToFrame()` and the `touch` config.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
