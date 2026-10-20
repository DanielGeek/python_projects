# SPEC 11 — Snake game

> **Status:** Approved
> **Depends on:** SPEC 05, SPEC 08, SPEC 09
> **Date:** 2026-10-19
> **Objective:** Add a new Snake game, written from scratch with the fruit sprites in `references/source-assets/snake-assets/`, to the vault as a playable catalog entry with id `snake`, ranked in the global leaderboard.

---

## Why this spec exists

There is no reference game for Snake. The only source material is `references/source-assets/snake-assets/`:

- `fruits.png`: a 3790×442 transparent sheet with three rows of fruit (flat, pixel-art and realistic).
- `sprites.js`: a `window.SPRITE_ATLAS` that maps the pixel-art middle row.

So the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill.

The archive already holds a Snake: `serpent` in `lib/games-archive.ts`, with `src: null`, no folder and the cover `av-cover-serpent`. By user decision this spec does not restore it. It adds a new id `snake` with its own folder, reader, cover and score table. `serpent` stays archived, untouched.

Two problems in the assets are fixed in the vault copy and nowhere else:

- The names in `sprites.js` do not match the picture. The sprite at x=34 is an apple, but the atlas calls it `banana`, and every name after it is shifted the same way.
- `sources.fruits` points to `snake-assets/fruits.png`, a path that does not exist inside `public/games/snake/`.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The fit to the frame reuses the `fitToFrame()` pattern of SPEC 09 (`drop`).

---

## Scope

**In:**

- New folder `public/games/snake/` with `index.html`, `game.js`, `sprites.js` and `fruits.png`, written for this spec. Only `fruits.png` is copied unchanged from `references/source-assets/snake-assets/`.
- `sprites.js` in the vault keeps the coordinates of the reference atlas. Its fruit names are fixed to match the image, and its source path becomes `fruits.png`.
- `index.html` loads `../bridge.js` with `data-game="snake"` before `sprites.js` and `game.js`.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, and `preventDefault` on the arrow keys and Space.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `drop`.
- A `readers["snake"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` after `brick-buster`, with the comment above `GAMES` updated.
- Cover art: an `av-cover-snake` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_snake_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `CLAUDE.md`: the `games.ts`, `supabase/migrations/` (six migrations) and `public/games/<id>/` bullets.

**Out of scope (for future specs):**

- Sound, touch or swipe controls, a gamepad, extra modes, power-ups, obstacles, wrap-around walls, and fruits with different point values.
- Restoring or deleting `serpent`, or changing `av-cover-serpent` and `lib/games-archive.ts`.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Capping the height of the CRT frame for square games.
- Replacing the third-party sprites with original art.
- The flat and realistic rows of `fruits.png`.
- Auth and a score validation service (the name is still free text, see SPEC 08).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:snake` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`):

```ts
{
  id: "snake",
  title: "Snake",
  category: "Arcade",
  tagline: "Eat the fruit, grow longer, never bite yourself.",
  description:
    "Guide a pixel snake around a walled 20×20 grid and eat the fruit that pops up. Every five fruits the level rises, the snake speeds up and each bite is worth more. Hit a wall or your own tail and the run is over.",
  accent: "green",
  src: "/games/snake/index.html",
  aspect: "1 / 1",
  controls: "Arrows or WASD to steer · P to pause · SPACE to start",
  difficulty: 2,
  plays: "9.1K",
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1976"],
}
```

`plays` is mock data, as for every game. `RETRO 1976` refers to Blockade, the arcade origin of the genre.

Game globals (`public/games/snake/game.js`, top-level `let`/`const` of a classic script):

```js
const COLS = 20,
  ROWS = 20,
  CELL = 30; // 600×600 canvas
let state = "ready"; // 'ready' | 'playing' | 'paused' | 'gameover'
let won = false; // true when the snake fills the grid
let snake = []; // [{ x, y }], head first, grid cells
let dir,
  queue = []; // current direction and up to 2 queued turns
let fruit = null; // { x, y, sprite }, sprite is a SPRITE_ATLAS.fruits key
let score = 0,
  level = 1,
  eaten = 0;
```

Rules:

- **Start.** The snake starts with 3 cells in the middle row, moving right. `ready` shows a title screen, and Space or Enter starts the run.
- **Moving.** It moves one cell per tick. The tick rate is `min(20, 7 + level)` cells per second: 8 at level 1, up to a cap of 20 from level 13. The loop is a `requestAnimationFrame` loop that adds `performance.now()` deltas into an accumulator and steps once per tick, so the host pause freezes it.
- **Turning.** Arrows and WASD queue turns: at most 2, applied one per tick. A turn to the opposite direction of the last queued one is ignored.
- **Eating.** When the head enters the fruit cell:
  - `score += 10 * level`, the snake grows by one, and `eaten++`;
  - every 5 fruits `level++`;
  - a new fruit appears on a random free cell, with a random sprite from the atlas.
- **Ending.** Entering a wall or a body cell (except the tail cell that moves away this tick) sets `state = 'gameover'`. Filling all 400 cells sets `won = true` and `state = 'gameover'`. The end screen shows `GAME OVER` or `YOU WIN`, the score, and "SPACE to play again". Space or Enter resets every global and goes to `playing`.
- **Pausing.** P switches between `playing` and `paused` and shows `PAUSED`. The game does not pause on `blur`, so there is no conflict with the host pause.
- **Keys.** The `keydown` handler calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`.
- **HUD.** Inside the canvas: score and level on top, drawn with the canvas font. All text is in English, and `lang="en"`.

Score bound: at most 397 fruits can be eaten, so the score stays far below 9,999,999 (about 3.2 × 10⁵ at most). The score is always an integer.

Bridge reader (`public/games/bridge.js`). It ends the run for a loss and for a win, and `over` turns false again when Space starts a new run, so each run is saved on its own:

```js
snake: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `level` and `state` are already in it.

Sprite atlas (`public/games/snake/sprites.js`):

- It keeps the same `window.SPRITE_ATLAS` shape and the coordinates of the 22 sprites of the middle row (`y: 136`, `h: 160`).
- It sets `sources.fruits` to `'fruits.png'`.
- It renames the keys left to right to what the image shows: `apple`, `banana`, `pineapple`, `grape`, `pumpkin`, `turnip`, `eggplant`, `strawberry`, `cherry`, `carrot`, `mushroom`, `broccoli`, `watermelon`, `pepper`, `kiwi`, `lemon`, `orange`, `peach`, `peanut`, `raspberry`, `tomato`, `salad`.
- The header comment keeps the source credit.

The game draws a fruit with `drawImage` scaled to fit one 30 px cell, keeping its proportions, with `imageSmoothingEnabled = false`.

fitToFrame (`game.js`):

- It sets `zoom` on the page wrapper to `Math.min(1, innerWidth / 600, innerHeight / 600)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.

Migration (`supabase/migrations/<version>_add_snake_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('snake', 'Snake', 'Arcade', 'green');
```

Cover art (`app/globals.css`, `.av-cover-snake` and `::after`, no image file):

- A dark green-to-void gradient background with a faint grid made with repeating linear gradients.
- An L-shaped body of square `var(--green)` blocks, built with linear-gradient layers and `background-position`, as in `av-cover-serpent`.
- A small pixel-art red fruit made of gradient squares in front of the head.
- A `drop-shadow` glow in green.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `snake` in the route, `av-cover-snake`, the bridge key and `arcade-vault:scores:snake`.
- `score` is an integer from 0 to 9,999,999. `over` is true after a crash into a wall, after a bite and after a full grid.
- `GAMES` order is `asteroids`, `drop`, `brick-buster`, `snake`, so Asteroids stays the first landing tile and the default Hall of Fame tab.

File layout:

```
public/games/snake/index.html                       new, loads ../bridge.js (data-game="snake"), sprites.js, game.js
public/games/snake/game.js                          new
public/games/snake/sprites.js                       from the reference atlas, names and source path fixed
public/games/snake/fruits.png                       copied unchanged from references/source-assets/snake-assets/
public/games/bridge.js                              adds readers["snake"]
lib/games.ts                                        adds the entry after brick-buster, updates the comment above GAMES
app/globals.css                                     adds av-cover-snake
supabase/migrations/<version>_add_snake_game.sql    inserts the games row (new)
CLAUDE.md                                           documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Manual test: there are five migrations, `public.games` has `asteroids`, `drop` and `brick-buster`, and both commands pass. If not, stop and report.
2. **Folder and atlas.** Create `public/games/snake/`. Copy `fruits.png`, write `sprites.js` with the fixed names and path, and write `index.html` with the bridge tag and a 600×600 canvas. Manual test: open `/games/snake/index.html` directly, and a temporary console loop drawing every atlas key shows the fruit its name says.
3. **Board and movement.** Write the `game.js` globals, the rAF loop with the tick accumulator, the drawing of the grid, the snake and the HUD, the turn queue and the `preventDefault` on the keys. Manual test: the snake moves at 8 cells per second, turns with the arrows and WASD, ignores reversing, and the page does not scroll.
4. **Fruit, score, levels, end.** Add eating, growth, scoring, levels, speed, the wall and self collisions, the win, the end screen, the restart, and the P pause. Manual test: each fruit adds `10 × level`, the level rises after 5 fruits and the snake gets faster, a wall or a bite shows `GAME OVER`, Space starts a clean run, and P pauses and resumes.
5. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/snake/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, and opening the file directly in a large window keeps it at scale 1.
6. **Bridge reader.** Add `readers["snake"]`. Manual test: in the host console, `message` events with `game: "snake"` carry a changing `score` and `level`, `lives: null`, and `over: true` at game over.
7. **Cover art.** Add `av-cover-snake`. Manual test: the cover renders on a temporary card at desktop and at 375 px. It shows in `/library` after step 8.
8. **Catalog entry.** Add the entry to `lib/games.ts` and update the comment above `GAMES`. Manual test: `/library` shows four cards, `/game/snake` shows the detail, and the `Arcade` filter lists Brick Buster and Snake.
9. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has four rows, including `snake`, and there is no new advisor warning about `games` or `scores`.
10. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `snake`.
11. **Play and rank.** In `/game/snake/play`, finish a run, type a name and save. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'snake'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Snake` and not under another game.

    Delete the test row afterwards.

12. **Docs.** Update `CLAUDE.md`:
    - the `games.ts` bullet: four games, and SPEC 11 added Snake as a new game, not from the archive;
    - the `supabase/migrations/` bullet: six migrations, `add_snake_game`;
    - the `public/games/<id>/` bullet: `snake` is a square 600×600 game with `fitToFrame()`, and it uses third-party sprites.

---

## Acceptance criteria

- [x] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [x] `public/games/snake/` contains exactly `index.html`, `game.js`, `sprites.js` and `fruits.png`.
- [x] `public/games/snake/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="snake"` before `sprites.js` and `game.js`.
- [x] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls and no dependencies.
- [x] Each key of `SPRITE_ATLAS.fruits` in `public/games/snake/sprites.js` draws the fruit its name says, and `sources.fruits` is `'fruits.png'`.
- [x] The snake starts with 3 cells, moving right, at 8 cells per second. Reversing into itself is ignored.
- [x] Eating a fruit adds exactly `10 × level` points and one cell, and a new fruit never appears on the snake.
- [x] After every 5 fruits the level rises by 1 and the tick rate is `min(20, 7 + level)` cells per second.
- [x] Hitting a wall or the body ends the run with `GAME OVER`. Filling the grid ends it with `YOU WIN`.
- [x] Space or Enter on the end screen starts a new run with score 0, level 1 and 3 cells.
- [x] P pauses and resumes in-game. The game does not pause on its own when the iframe loses focus.
- [x] `GAMES` has exactly one entry with `id: "snake"`, `src: "/games/snake/index.html"`, `aspect: "1 / 1"`, `accent: "green"`, `category: "Arcade"` and `difficulty: 2`, placed after `brick-buster`.
- [x] `/library` lists Snake with its rendered cover, and the other three games are unchanged.
- [x] `/game/snake` shows the title, description, controls `Arrows or WASD to steer · P to pause · SPACE to start` and `ARCADE`.
- [x] `/game/snake/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [x] While playing, the arrow keys and Space do not scroll the host page.
- [x] At 1530×772 and at 375×812 the whole 600×600 canvas is visible inside the frame, and the game document does not overflow.
- [x] The host receives `state` messages with `game: "snake"` carrying `score`, `lives: null`, `level` and `over`, and `over` is `true` after a wall crash, a bite and a win.
- [x] Pause and resume from the host freeze and resume the game through the bridge.
- [x] `public.games` has the row `('snake', 'Snake', 'Arcade', 'green')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [x] A finished run shows `SCORE SAVED`, is stored with `game_id = 'snake'` and appears in `/hall-of-fame` under `Snake` only.
- [x] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [x] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `snake`.
- [x] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, `av-cover-serpent`, the other games' folders and `references/` have no edits (`git diff` is empty for them).
- [x] `CLAUDE.md` documents Snake, the six migrations and the `public/games/snake/` folder.

---

## Decisions

- **Yes:** a new id `snake` (user decision, asked because `serpent` is an archived Snake). **No:** restoring `serpent`. It had no code anyway, and it stays archived with its cover.
- **Yes:** the game is new and follows `contract.md`, with the standard globals `score`, `level` and `state`. **No:** a reference game, because none exists.
- **Yes:** a 600×600 canvas with a 20×20 grid of 30 px cells and `aspect: "1 / 1"` (user decision). **No:** 800×600 with 4:3, where the fruits would be smaller.
- **Yes:** walls kill, and there is one life (`lives: null`) (user decision). **No:** wrap-around walls.
- **Yes:** 10 × level per fruit, a level every 5 fruits, speed `min(20, 7 + level)` (user decision). **No:** per-fruit point values, which would need a table to maintain.
- **Yes:** filling the grid is a win, and it ends the run with `over: true`, so the score is saved.
- **Yes:** arrows plus WASD, P to pause, and Space or Enter to start (user decision). **No:** touch, so no `TOUCH` tag. **No:** pausing on `blur`, the cause of the Brick Buster resume issue (SPEC 10).
- **Yes:** a turn queue of 2, so two quick keys in one tick are not lost and cannot reverse the snake into itself.
- **Yes:** the pixel-art middle row of `fruits.png` (user decision), drawn unsmoothed. **No:** the realistic row, or shapes drawn without sprites.
- **Yes:** fix the atlas names and path in the vault copy only. **No:** editing `references/source-assets/`.
- **Yes:** use the third-party sprites and record the licensing risk (user decision). **No:** a fallback drawing for a missing PNG.
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09 and SPEC 10. **No:** changing `CRTScreen`.
- **Yes:** green accent, difficulty 2, the catalog copy above, and a CSS cover with an L-shaped snake plus a fruit (user decisions).

---

## Risks

| Risk                                                                                                              | Mitigation                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist, and the bridge reports nothing.                                    | The new globals follow the contract names. Step 6 checks the messages by hand, and `lib/games.test.ts` checks the reader exists.                         |
| `over` is not true for every ending, so the score is never saved.                                                 | Step 11 plays a full run. The criteria check a wall crash, a bite and a win (the win can be tested by setting `snake` in the console).                   |
| The `games` row is missing, so the foreign key rejects every score.                                               | Step 9, and the test in `lib/leaderboard.test.ts`.                                                                                                       |
| The sprites are rips of Google Snake from spriters-resource, served publicly from `public/`.                      | Accepted by the user. The source is credited in `sprites.js`. Replacing them with original art is its own spec.                                          |
| The atlas coordinates do not frame the sprite exactly, and a neighbour bleeds into the cell.                      | Step 2 draws every key. A wrong box is fixed in the vault `sprites.js`.                                                                                  |
| A `1 / 1` frame at desktop width can be taller than the viewport, so the bottom of the frame needs a page scroll. | The game itself fits its iframe. Step 5 looks at it at 1530×772. Capping the frame height is out of scope and is reported for its own spec if it is bad. |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit.    | Same behavior as Asteroids. Any credit change is a separate spec.                                                                                        |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                                  | Accepted, as in SPEC 09 and SPEC 10.                                                                                                                     |
| Two Snake entries exist in the code (`snake` in `GAMES`, `serpent` in the archive).                               | Recorded in `CLAUDE.md`. Restoring `serpent` would need its own spec.                                                                                    |

---

## What is **not** in this spec

- Sound, touch controls, wrap-around walls, power-ups or per-fruit points.
- Restoring, deleting or changing `serpent`.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol or the CRT frame.
- Original art in place of the third-party sprites.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
