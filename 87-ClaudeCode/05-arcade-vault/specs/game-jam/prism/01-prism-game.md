# SPEC GJ prism-01 — Prism game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-10-23
> **Objective:** Add a new falling-gem puzzle game, written from scratch, to the vault as a playable catalog entry with id `prism`, ranked in the global leaderboard: vertical triplets you cycle with ↑ and drop, lines of three or more in any direction clear with chain combos, and the run ends when the well overflows.

---

## Why this spec exists

The `game-planner` backlog has the idea "Prism": a falling-block puzzle where each piece is a vertical triplet of gems. The player moves it, cycles the order of its three gems with ↑ and drops it. Three or more gems of the same color in a row clear, in any direction, diagonals included. After a clear the gems above fall, and a new line formed by the fall is a chain. The run has no lives and ends when the well overflows. The backlog also fixes `lives: null`, a narrow well that needs `fitToFrame()` and a side panel, a yellow or green accent, and no "Columns" branding.

There is no reference game for it, so the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill, with the standard globals `score`, `lives`, `level` and `state`.

Platform clashes, flagged and not redesigned:

- **Overlap with `drop`.** `drop` (SPEC 09) is already a falling-block puzzle, and the library has only one other Puzzle game. The backlog itself says novelty is low. The two differ in the rules (a triplet of colored gems that matches in lines of any direction against tetrominoes that clear full rows), but they share the genre and the "pieces fall" loop. This spec keeps the idea as described; the overlap is recorded in Risks for the user to weigh when reviewing.
- **Narrow well.** The well is six cells wide. On a 4:3 canvas it needs a side panel to use the frame, and the whole canvas needs `fitToFrame()` as in SPEC 10 and SPEC 11. Both are in the scope below.
- **Name.** The game, its copy, its cover and its code never use the name of the commercial game this genre is known for. Only generic words (gem, well, triplet, chain) are used.

No archived game matches (`serpent`, `muncher`, `invaders`, `rocks`, `pixel-duel`), so nothing is restored. The id `prism` is free in `GAMES`, `ARCHIVED_GAMES`, `public/games/` and `specs/game-jam/`.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The `touch` config is part of the catalog entry, because `lib/games.test.ts` fails without it.

---

## Scope

**In:**

- New folder `public/games/prism/` with `index.html` and `game.js`, written for this spec. All art is drawn on the canvas: no image, no audio, no third-party asset.
- `index.html` loads `../bridge.js` with `data-game="prism"` before `game.js`, has `lang="en"` and an 800×600 canvas inside a `#stage` wrapper.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, and `preventDefault` on the arrow keys and Space.
- The rules of the Data model: a 6×13 well, falling triplets, move, cycle, soft drop, hard drop, matches of 3 or more in four directions, gravity, chains, scoring, levels, overflow, pause and restart.
- A side panel on both sides of the well (score, level, gems cleared, next piece, key hints), drawn inside the canvas.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake`.
- A `readers["prism"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` after `froggy`, with a `touch` config and the comment above `GAMES` updated.
- Cover art: an `av-cover-prism` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_prism_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md` (the `games.ts`, `supabase/migrations/` and `public/games/<id>/` bullets).

**Out of scope (for future specs):**

- Special gems, power-ups, garbage rows, extra modes and any rule not listed in the Data model (SPEC GJ prism-02 adds one special gem).
- Sound and music.
- Skins and the light/dark toggle. They are added to the games the user names with the `skin-designer` agent, which `/spec-impl-game` runs after the last step.
- Layout work for phones beyond `fitToFrame()` and the `touch` config; the `mobile-porter` agent does the rest.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Auth and a score validation service (the name is still free text, see SPEC 08).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:prism` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`, after `froggy`):

```ts
{
  id: "prism",
  title: "Prism",
  category: "Puzzle",
  tagline: "Line up three gems in any direction and chain the rest.",
  description:
    "Triplets of gems fall into a narrow six-column well. Cycle their order, drop them and line up three or more of the same color in any direction, diagonals included. Cleared gems let the ones above fall, so one drop can chain into more clears. The fall speeds up every level, and the run ends when the well fills to the top.",
  accent: "yellow",
  src: "/games/prism/index.html",
  aspect: "4 / 3",
  controls: "← → to move · ↑ to cycle · ↓ to soft drop · SPACE to drop · P to pause",
  touch: {
    move: [
      { code: "ArrowLeft", label: "◀", name: "Move left", repeat: true },
      { code: "ArrowRight", label: "▶", name: "Move right", repeat: true },
      { code: "ArrowDown", label: "▼", name: "Soft drop", repeat: true },
    ],
    a: { code: "Space", label: "A", name: "Drop, start or restart" },
    b: { code: "ArrowUp", label: "B", name: "Cycle gems" },
    extra: [{ code: "KeyP", label: "PAUSE", name: "Pause" }],
  },
  difficulty: 3,
  plays: "5.2K",
  tags: ["1 PLAYER", "KEYBOARD", "MATCH-3"],
}
```

`plays` is mock data, as for every game. The description lists only what the rules below do.

Game globals (`public/games/prism/game.js`, top-level `let`/`const` of a classic script):

```js
const COLS = 6,
  ROWS = 13,
  CELL = 40; // well of 240×520 px
const WELL_X = 280,
  WELL_Y = 40; // top-left corner of the well on the 800×600 canvas
const COLORS = 5; // gem colors 0..4
let state = "ready"; // 'ready' | 'playing' | 'resolving' | 'paused' | 'gameover'
let grid = []; // ROWS arrays of COLS numbers; -1 is empty, 0..4 is a gem color; row 0 is the top
let piece = null; // { col, row, gems: [a, b, c] }, gems top to bottom, row is the row of gems[0]
let nextPiece = null; // { gems: [a, b, c] }
let marks = []; // [{ r, c }] gems flashing before they are cleared
let phase = "flash"; // while resolving: 'flash' | 'settle'
let phaseMs = 0; // milliseconds spent in the current phase
let fallMs = 0; // milliseconds since the piece last moved down
let chain = 0; // chain step of the current drop, 0 when no clear has happened yet
let score = 0,
  level = 1,
  cleared = 0; // cleared counts gems removed in the run
const lives = null; // the game has no lives
```

`piece.gems` is an array and every piece-related routine (collision, drawing, locking) loops over its length, so a piece is not tied to three gems. SPEC GJ prism-02 relies on that.

Rules:

- **Well.** 6 columns by 13 rows of 40 px cells at (280, 40). Row 0 is the top row. Gems are one of 5 colors: cyan, magenta, yellow, green and violet. Each color has its own shape drawn on the gem (diamond, circle, triangle, square, hexagon), so colors are not the only cue.
- **Pieces.** A piece is a vertical triplet of three gems. Each gem takes a random color, independent of the other two, so a triplet can be all one color. `nextPiece` is drawn when the current piece spawns and shown in the side panel.
- **Spawn.** A piece appears in column 2 (the third column), with its gems in rows 0, 1 and 2. If any of those three cells is occupied, the piece does not appear and the run ends.
- **Moving.** ← and → move the piece one column when the target column is free for all its gems. A held key repeats through the browser key repeat. The key state is read from `keydown` events only; no `keyup` is needed for these two.
- **Cycling.** ↑ rotates the gem order: the bottom gem goes to the top, the other two move down one place (`[a, b, c]` becomes `[c, a, b]`). It always goes the same direction. A held ↑ does not repeat (`e.repeat` is ignored).
- **Falling.** The piece moves down one row every `fallInterval` milliseconds, where `fallInterval = max(100, 800 - 55 × (level - 1))`: 800 ms at level 1, 140 ms at level 13, 100 ms from level 14. The loop adds `performance.now()` deltas (each capped at 100 ms) into `fallMs`, so the host pause freezes it.
- **Soft drop.** While ↓ is held, the interval is `min(fallInterval, 50)`. Each row the piece falls on a soft-drop tick adds 1 point. ↓ is tracked with `keydown` and `keyup`, and cleared on `blur` and when the state leaves `playing`.
- **Hard drop.** Space drops the piece to the lowest free position and locks it at once. It adds 2 points per row fallen. A held Space does not repeat (`e.repeat` is ignored).
- **Locking.** When a tick cannot move the piece down, it locks: its gems are written into `grid` and `chain` is set to 0. There is no extra lock delay: the tick that fails is the lock.
- **Matching.** After a lock the game scans the grid. A match is a run of 3 or more gems of the same color in a row, in any of four directions: horizontal, vertical, diagonal down-right and diagonal down-left. Every gem that belongs to at least one run is marked once, even when it belongs to several. Diagonal runs may start and end anywhere, and they do not wrap around the well.
- **Resolving.** When the scan finds marks, `chain` goes up by 1 and the state becomes `resolving`. Phase `flash` lasts 280 ms and the marked gems blink. The marked gems are then removed, the gems above each removed cell fall straight down to the lowest free cell of their column (all at once), and phase `settle` lasts 160 ms. The grid is then scanned again: if there are new marks the cycle repeats with `chain` + 1, which is how a chain builds. All input is ignored while resolving.
- **Scoring.** For each chain step: `points = marks.length × 10 × chain × level`, with `level` read before that step's level-up. `score += points` for each step, plus the soft drop and hard drop points. `score` is clamped to 9,999,999. Examples at level 1: a 3-gem clear is 30; a 4-gem clear that falls out of it as chain 2 is 80.
- **Levels.** `cleared` counts gems removed. `level = 1 + floor(cleared / 30)`, updated as soon as the gems are removed, so the next piece already falls faster. The banner `CHAIN ×N` shows over the top of the well during `resolving` when `chain` is 2 or more.
- **Ending (overflow).** When a scan finds no marks, the chain is over. The run ends (`state = 'gameover'`) if any gem is in row 0 of the well, or if the next piece cannot spawn (see Spawn). Otherwise the next piece appears and `state` returns to `playing`. This is the only way a run ends. The end screen shows `GAME OVER`, the score and "SPACE to play again".
- **Restart.** Space or Enter on the end screen resets every global and goes to `playing`. To avoid a held hard drop restarting the run by accident, Space and Enter are ignored for 500 ms after the run ends (measured with `performance.now()`).
- **Start.** `ready` shows the title `PRISM` and "SPACE to start". Space or Enter starts the run with score 0, level 1 and an empty well.
- **Pausing.** P switches between `playing` and `paused` and shows `PAUSED`. P is ignored on `ready`, `resolving` and `gameover`. The game does not pause on `blur`, so there is no conflict with the host pause.
- **Keys.** The `keydown` handler is on `document`, as the bridge dispatches its synthetic keys there. It calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`.
- **Panels.** Left of the well: `SCORE`, `LEVEL` and `GEMS` (the value of `cleared`). Right of the well: `NEXT` with the three gems of `nextPiece`, and a list of the five key hints. All text is drawn with the canvas font, in English.
- **Drawing.** The five gem sprites are drawn once into offscreen canvases when the script loads and copied with `drawImage`. The frame loop never calls `shadowBlur`, never builds gradients and never allocates arrays or font strings (the rules learnt in SPEC 14).

Score bound: the best case is bounded by the 78 cells of the well per step and by the level, so a realistic run stays far below 9,999,999. The clamp above guarantees it. The score is always an integer.

Bridge reader (`public/games/bridge.js`). `over` is true only for the overflow, and turns false again when Space starts a new run, so each run is saved on its own:

```js
prism: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on `#stage` to `Math.min(1, innerWidth / canvas.width, innerHeight / canvas.height)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.

Migration (`supabase/migrations/<version>_add_prism_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('prism', 'Prism', 'Puzzle', 'yellow');
```

Cover art (`app/globals.css`, `.av-cover-prism` and `::after`, no image file):

- A dark yellow-to-void gradient background with a faint vertical grid made with repeating linear gradients, narrower in the middle to suggest the narrow well.
- A vertical triplet of rounded gradient squares in the centre (`var(--yellow)`, `var(--cyan)`, `var(--magenta)`), built with linear-gradient layers and `background-position`, as in `av-cover-snake`.
- A diagonal trio of three smaller `var(--green)` squares to the right, to show the diagonal match.
- A `drop-shadow` glow in yellow.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `prism` in the route, `av-cover-prism`, the bridge key and `arcade-vault:scores:prism`.
- `score` is an integer from 0 to 9,999,999. `over` is true when the well overflows, the only ending.
- `GAMES` order puts `prism` last, so Asteroids stays the first landing tile and the default Hall of Fame tab.
- `touch` codes: `ArrowLeft`, `ArrowRight`, `ArrowDown`, `Space`, `ArrowUp` and `KeyP`. All appear in `game.js` and in the bridge `KEYS` allowlist. `A` and `B` are different codes. `ArrowLeft`, `ArrowRight` and `ArrowDown` have `repeat: true`, because a synthetic `keydown` does not auto-repeat and the game moves once per keydown.

File layout:

```
public/games/prism/index.html                       new, loads ../bridge.js (data-game="prism"), game.js
public/games/prism/game.js                          new
public/games/bridge.js                              adds readers["prism"]
lib/games.ts                                        adds the entry after froggy, updates the comment above GAMES
app/globals.css                                     adds av-cover-prism
supabase/migrations/<version>_add_prism_game.sql    inserts the games row (new)
references/implemented-games.md                     adds the prism row
CLAUDE.md                                           documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/prism/` does not exist. Manual test: there are seven migrations, `public.games` has five rows (`asteroids`, `drop`, `brick-buster`, `snake`, `froggy`), and both commands pass. If not, stop and report.
2. **Folder, well and drawing.** Create `public/games/prism/` with `index.html` (bridge tag, 800×600 canvas in `#stage`, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop, the offscreen gem sprites, the drawing of the well, the two side panels and the title screen. Manual test: open `/games/prism/index.html` directly, and the well, the panels and the title are drawn. Temporarily filling `grid` from the console shows all five colors with five different shapes.
3. **Piece, movement and falling.** Add spawn, `nextPiece`, ← →, the cycle on ↑, the fall interval, the soft drop, the hard drop, locking and the `preventDefault` on the keys. Manual test: the triplet falls at one row per 0.8 s, ← → stop at the walls and at gems, ↑ turns `[a, b, c]` into `[c, a, b]` and does not repeat when held, ↓ falls faster and adds 1 point per row, Space locks at once and adds 2 points per row, and the page does not scroll.
4. **Matching and chains.** Add the scan in four directions, the flash, the removal, the gravity, the settle and the chain loop. Manual test, setting `grid` from the console: a horizontal, a vertical, a down-right and a down-left run of 3 clear; a run of 5 clears whole; a gem shared by two runs is cleared once; a clear that leaves a new run produces `CHAIN ×2`; two runs that only touch at a corner of different colors do not match.
5. **Score, levels and ending.** Add the scoring, the level from `cleared`, the speed, the overflow check, the end screen, the restart lockout, the start and restart keys and the P pause. Manual test: a 3-gem clear at level 1 adds 30 and a chain-2 clear of 4 adds 80; `level` becomes 2 after 30 gems and the fall is 745 ms; filling the stack to row 0, or to the spawn cells, shows `GAME OVER`; Space within 500 ms of the end does nothing and afterwards starts a clean run; P pauses and resumes.
6. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/prism/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
7. **Bridge reader.** Add `readers["prism"]`. Manual test: in the host console, `message` events with `game: "prism"` carry a changing `score` and `level`, `lives: null`, and `over: true` at game over and `false` again after the restart.
8. **Cover art.** Add `av-cover-prism`. Manual test: the cover renders on a temporary card at desktop and at 375 px. It shows in `/library` after step 9.
9. **Catalog entry.** Add the entry, with `touch`, to `lib/games.ts` and update the comment above `GAMES`. Manual test: `/library` shows six cards, `/game/prism` shows the detail with the `PUZZLE` category, and the `Puzzle` filter lists Drop and Prism. On a touch emulation, the pad shows ◀ ▶ ▼ as active, `A` drops, `B` cycles and `PAUSE` pauses; holding ◀ keeps moving the piece.
10. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has six rows, including `prism`, and there is no new advisor warning about `games` or `scores`.
11. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, touch codes) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `prism`.
12. **Play and rank.** In `/game/prism/play`, play until the well overflows, type a name and save. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'prism'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Prism` and not under another game.

    Delete the test row afterwards.

13. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: six games, and SPEC GJ prism-01 added Prism as a new game;
    - the `supabase/migrations/` bullet: eight migrations, `add_prism_game`;
    - the `public/games/<id>/` bullet: `prism` is an 800×600 game with a narrow 6×13 well, `fitToFrame()`, canvas art only and the `touch` config with `repeat` on the move keys.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/prism/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/prism/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="prism"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies and no image or audio file.
- [ ] The well has 6 columns and 13 rows, and a new piece appears in column 2 with its gems in rows 0, 1 and 2.
- [ ] ← and → move the piece one column and stop at the walls and at gems. ↑ turns `[a, b, c]` into `[c, a, b]` and does not repeat when held.
- [ ] The piece falls one row every `max(100, 800 - 55 × (level - 1))` ms. Holding ↓ makes the interval at most 50 ms and adds 1 point per row.
- [ ] Space drops the piece to the lowest free position, locks it at once and adds 2 points per row. A held Space does not drop the next piece.
- [ ] Runs of 3 or more gems of one color clear in the horizontal, vertical, down-right and down-left directions. A gem in two runs is cleared once.
- [ ] After a clear, the gems above fall to the lowest free cell of their column, and a new run formed by the fall clears as the next chain step.
- [ ] Each chain step adds `marks.length × 10 × chain × level` points, using the level before that step's level-up.
- [ ] `level` is `1 + floor(cleared / 30)`, and the score never exceeds 9,999,999.
- [ ] The run ends with `GAME OVER` when a gem is in row 0 after the chains finish or the next piece cannot spawn, and not otherwise.
- [ ] Space or Enter on the end screen starts a new run with score 0, level 1 and an empty well, and is ignored during the first 500 ms after the run ends.
- [ ] P pauses and resumes in-game. The game does not pause on its own when the iframe loses focus.
- [ ] All input is ignored while gems are flashing or settling.
- [ ] `GAMES` has exactly one entry with `id: "prism"`, `src: "/games/prism/index.html"`, `aspect: "4 / 3"`, `accent: "yellow"`, `category: "Puzzle"` and `difficulty: 3`, placed after `froggy`, with the `touch` config of the Data model.
- [ ] The word "Columns" appears nowhere in `public/games/prism/`, the `GAMES` entry, the cover rule or `CLAUDE.md`.
- [ ] `/library` lists Prism with its rendered cover, and the other five games are unchanged.
- [ ] `/game/prism` shows the title, description, controls `← → to move · ↑ to cycle · ↓ to soft drop · SPACE to drop · P to pause` and `PUZZLE`.
- [ ] `/game/prism/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page.
- [ ] At 1530×772 and at 375×812 the whole 800×600 canvas is visible inside the frame, and the game document does not overflow.
- [ ] On a touch device the pad moves the piece (with repeat on ◀ ▶ ▼), `A` drops, `B` cycles and `PAUSE` pauses.
- [ ] The host receives `state` messages with `game: "prism"` carrying `score`, `lives: null`, `level` and `over`, and `over` is `true` when the well overflows.
- [ ] Pause and resume from the host freeze and resume the game through the bridge.
- [ ] `public.games` has the row `('prism', 'Prism', 'Puzzle', 'yellow')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'prism'` and appears in `/hall-of-fame` under `Prism` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `prism`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, the bridge protocol, the other games' folders and `references/` (except `implemented-games.md`) have no edits (`git diff` is empty for them).
- [ ] `CLAUDE.md` and `references/implemented-games.md` document Prism, the eight migrations and the `public/games/prism/` folder.

---

## Decisions

- **Yes:** a new game called Prism, a falling vertical triplet puzzle with lines of 3+ in any direction (diagonals too), chain combos, `lives: null` and a run that ends when the well overflows (user decision, from the backlog). **No:** changing any of those rules.
- **Yes:** ↑ cycles the triplet and a drop locks it (user decision). The cycle direction (bottom gem goes to the top), the move keys ← →, soft drop on ↓ and hard drop on Space are game-jam decisions.
- **Yes:** a narrow well with a side panel, and `fitToFrame()` (user decision, from the backlog). The size, 6 columns by 13 rows, on an 800×600 canvas with `aspect: "4 / 3"`, with a panel on each side, is a game-jam decision. **No:** a 600×600 canvas, where the side panels would be cramped.
- **Yes:** a yellow accent (user decision: yellow or green; the pick of yellow is a game-jam decision, since green already has Snake and yellow has Froggy, and yellow reads as light through a prism). **No:** green.
- **Yes:** the title `Prism` and no "Columns" branding (user decision). No name, art or wording from that game is used.
- **Yes:** the id `prism`, category `Puzzle` and difficulty 3 (game-jam decisions). The tagline, description, `plays` and tags (`1 PLAYER`, `KEYBOARD`, `MATCH-3`) are game-jam decisions. **No:** a `TOUCH` tag, since the swipe is not supported and the pad is the same as for `drop`.
- **Yes:** 5 gem colors, each with its own shape (game-jam decision), so the game is playable without telling the colors apart. **No:** 4 colors (too many accidental matches) or 6 (too few).
- **Yes:** a match is a run of 3+ in four directions, and every gem in a run clears (user decision for the directions; the rest is a game-jam decision). **No:** clearing only the first three gems of a longer run.
- **Yes:** scoring `10 × gems × chain × level` per step, 1 point per soft-drop row and 2 per hard-drop row, a level every 30 gems and a fall interval `max(100, 800 - 55 × (level - 1))` (game-jam decisions). **No:** per-color values.
- **Yes:** the well overflows when a gem rests in the top row after the chains, or when the next piece cannot spawn (game-jam decision on how "overflow" is measured). **No:** a countdown or a lives system.
- **Yes:** a 280 ms flash and a 160 ms settle between chain steps, with input locked (game-jam decision), so the chain can be read. **No:** instant chains.
- **Yes:** a 500 ms restart lockout after the run ends (game-jam decision), because Space is also the hard drop. **No:** a restart key different from Space.
- **Yes:** arrows, Space and P (game-jam decision), with P to pause and no pause on `blur`, the cause of the Brick Buster resume issue (SPEC 10). Enter also starts and restarts.
- **Yes:** `touch` with `repeat` on ◀ ▶ ▼ (game-jam decision), `A` Space and `B` ArrowUp, plus a `PAUSE` pill. **No:** swipe.
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09 and SPEC 10. **No:** changing `CRTScreen`.
- **Yes:** gem sprites drawn once into offscreen canvases, no `shadowBlur` in the loop (game-jam decision, from SPEC 14).
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.

---

## Risks

| Risk                                                                                                                              | Mitigation                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.                                 | The globals follow the contract names. Step 7 checks the messages by hand, and `lib/games.test.ts` checks the reader exists.                                                    |
| `over` is not true for every way the run ends, so the score is never saved.                                                       | The only ending is the overflow. Step 5 and step 12 play it to the end, and the criteria check `over`.                                                                          |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                                   | Every term is an integer, and `score` is clamped to 9,999,999 on each addition.                                                                                                 |
| The game has its own pause and conflicts with the host pause.                                                                     | The P pause only switches `state`. The loop uses `requestAnimationFrame` and `performance.now()`, so the bridge freezes it. The game does not pause on `blur`. Step 5 and the host pause criterion check both. |
| The `games` row is missing, so the foreign key rejects every score.                                                               | Step 10, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                                             |
| Prism overlaps `drop`: both are falling-block puzzles, and Puzzle would hold two of six games. The backlog already rates novelty low. | Kept as the user described it. The rules differ (colored triplets, matches in four directions, chains), and the user can drop the spec at review. No archived game is touched.   |
| The genre resembles a well-known commercial game, and the name or look could imply a copy.                                        | The name is Prism, the art is original and drawn on the canvas, and "Columns" appears in no shipped file. The mechanics of a genre are not protected, and the criteria check the word.     |
| A held Space hard-drops piece after piece, or restarts the run the moment it ends.                                                | `e.repeat` is ignored for Space and ↑, and Space and Enter are ignored for 500 ms after the run ends. Step 5 tests both.                                                        |
| A synthetic `keydown` from the touch pad does not auto-repeat, so ◀ ▶ ▼ would move once per tap.                                 | `repeat: true` on those three buttons, and step 9 tests holding ◀.                                                                                                              |
| The well is 240 px wide on an 800 px canvas, so after `zoom` at 375 px it is about 110 px wide and the gems are small.            | The shapes make the gems readable at small sizes. If it is still too small, the fix is a layout change for phones, reported for `mobile-porter` or its own spec.                  |
| A long chain keeps the player locked out of input, and a bug could loop forever.                                                  | Each step removes at least 3 gems from a 78-cell grid, so a chain has at most 26 steps. Step 4 tests a long chain built from the console.                                       |
| The diagonal scan miscounts at the edges of the well and a run wraps around.                                                      | The scan only reads cells inside the grid and starts a run only where the previous cell in that direction is not the same color. Step 4 tests both edges.                       |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                                                  | Accepted, as in SPEC 09 and SPEC 10.                                                                                                                                            |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit.                    | Same behavior as Asteroids and Snake. Any credit change is a separate spec.                                                                                                     |
| The game has no skins, while the other games may have them.                                                                       | Skins are added by the `skin-designer` agent, which `/spec-impl-game` runs after the last step.                                                                                 |

---

## What is **not** in this spec

- Special gems, power-ups, garbage rows, extra modes or levels with goals.
- Sound or music.
- Skins and a light/dark toggle.
- Swipe controls, or layout work for phones beyond `fitToFrame()` and the `touch` config.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
