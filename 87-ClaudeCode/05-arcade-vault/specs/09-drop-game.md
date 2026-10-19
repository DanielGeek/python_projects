# SPEC 09 — Restore the Drop game

> **Status:** Implemented
> **Depends on:** SPEC 05, SPEC 06, SPEC 08
> **Date:** 2026-10-19
> **Objective:** Bring the archived `drop` (the Tetris game) back into the catalog as a playable game next to Asteroids, fitted to its CRT frame at any size and with its row in `public.games` so the scores it saves reach the global leaderboard.

---

## Why this spec exists

`references/started-games/03-tetris/` is a plain Tetris of 332 lines. The `drop` game that SPEC 08 archived descends from it, but it is not a copy: `public/games/drop/game.js` has 1290 lines and adds hold, power-ups, skills, challenge modes, skins, local records and more piece types. The two are different games.

By user decision this spec restores `drop`, not the reference. The reference stays untouched in `references/` and is not copied into the vault. The vault's `drop` folder is the source of truth, exactly as it has been on disk since SPEC 08.

Restoring needs little because SPEC 08 left everything in place on purpose: the folder `public/games/drop/` (its `index.html` already loads `../bridge.js` with `data-game="drop"`), the `readers.drop` entry in `public/games/bridge.js` and the `av-cover-drop` rule in `app/globals.css`. What is missing is the catalog entry and the `games` row, because `scores.game_id` has a foreign key to it (SPEC 06, SPEC 08). The player and the leaderboard need no change: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`.

Checking the game against the contract found two things to fix and one to correct. The keydown handler only calls `preventDefault` for `Space`, so the arrow keys can scroll the host page from inside the iframe. The archived entry lists the tag `KEYBOARD / TOUCH`, but the game has no touch handlers. And the game does not fit its frame, which step 6 measured: the page has a natural height of 656 px (title, gap and a 602 px board) and never adapts to the iframe. At 1530 px wide the 4:3 frame is 840×630, so the bottom 26 px of the board, almost the last row, are cut and the iframe shows its own scrollbar. At 375 px the frame is 319×239 and only about a third of the game is visible. Nothing in this branch caused it, and `drop` was embedded the same way before SPEC 08. By user decision it is fixed here, by scaling the game inside its iframe, so the frame, `aspect` and Asteroids stay as they are.

---

## Scope

**In:**

- Move the `drop` entry from `ARCHIVED_GAMES` (`lib/games-archive.ts`) to `GAMES` (`lib/games.ts`), right after `asteroids`, with the tags changed to `["1 PLAYER", "KEYBOARD", "RETRO 1985"]`. Everything else in the entry stays as archived.
- Update `lib/games-archive.ts`: remove the `drop` entry, and fix the header comment that says `drop` still has its folder on disk.
- Migration `supabase/migrations/<version>_add_drop_game.sql` that inserts the `drop` row in `public.games`, applied with the Supabase MCP `apply_migration`.
- Two changes to `public/games/drop/game.js`: `preventDefault` on the arrow keys, so they do not scroll the host page, and a `fitToFrame()` function that scales the game down to fit its iframe, so the whole board, both side panels and the start menu are always visible. Found in step 6.
- Update the list of archived ids in `lib/games.test.ts` (seven ids instead of eight).
- In `lib/scores.test.ts`, the tests of `purgeRemovedGameScores` use `drop` as their example of a game that is not in `GAMES`. Replace that key with an invented id, `retired-game`, so they keep testing the purge. Found in step 5; test data only, `lib/scores.ts` is not edited.
- Update `CLAUDE.md`: the `games.ts` and `games-archive.ts` bullets, the `supabase/migrations/` bullet (four migrations) and the `public/games/<id>/` bullet.

**Out of scope (for future specs):**

- Copying `references/started-games/03-tetris/` into the vault, or syncing `drop` with it.
- Changes to mechanics, balance, sound, skins, challenge modes or any feature of `drop`.
- Touch controls.
- The in-game TOP 5 records and name form of `drop`. They keep saving to the game's own `localStorage` keys (`tetris-records`, `tetris-name`) and are not connected to the global leaderboard.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol or `public/games/bridge.js`.
- Changes to the host frame (`CRTScreen` in `components/ui/game.tsx`, the CRT rules in `app/globals.css`) or to the `aspect` of `drop`, which stays `"4 / 3"`. Asteroids and every other game keep their frame.
- Scaling the game up above its natural size, moving the fixed toolbar (skin picker and theme button), and a responsive or touch redesign of `drop` for phones.
- Redesigning the landing rail or the library for two games. Only the check in the plan.
- Restoring any other archived game (`brick-buster`, `rocks`, `serpent`, `muncher`, `invaders`, `froggy`, `pixel-duel`).
- Auth, protection against forged scores and the static marketing copy of the landing.

---

## Data model

No new persistence. `drop` enters through the existing `Game` type, the existing local score table (`arcade-vault:scores:drop`) and the existing `scores` table in Supabase.

Catalog entry (`lib/games.ts`), as archived except `tags`:

```ts
{
  id: "drop",
  title: "Drop",
  category: "Puzzle",
  tagline: "Fit the pieces before the ceiling crushes you.",
  description:
    "Geometric pieces descend from the dark. Rotate them, lock them in and clear lines to survive. The speed ramps up mercilessly every 10 lines.",
  accent: "magenta",
  src: "/games/drop/index.html",
  aspect: "4 / 3",
  controls: "← → to move · ↑ or X to rotate · ↓ to soft drop · SPACE to hard drop · C to hold",
  difficulty: 4,
  plays: "31.8K",
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
}
```

Bridge reader. It already exists in `public/games/bridge.js` and is not edited. `drop` has no lives, and `gameOver` becomes true both on losing and on completing a challenge, so `over` covers every way a run ends:

```js
drop: function () { return { score: score || 0, lives: null, level: level, over: !!gameOver }; },
```

`score` is always an integer: every addition in `game.js` is an integer and the back-to-back bonus uses `Math.floor`. A run cannot realistically reach 9,999,999, the limit of `toScoreRow` and the insert policy.

Change to the vault copy of `game.js`:

| Where                                                  | Today                                                                                            | Vault after this spec                                                                                                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `document.addEventListener('keydown', …)` in `game.js` | Only `Space` calls `preventDefault`, inside the switch and after the paused and game-over return | `preventDefault()` when `e.code` is `ArrowLeft`, `ArrowRight`, `ArrowUp` or `ArrowDown`, placed after the `e.target === nameInput` guard and before the early returns. The existing `Space` call stays. The rest is unchanged. |

The guard on `nameInput` stays first so the arrow keys still move the caret while the player types a name inside the game.

Second change to the vault copy of `game.js`, the fit to the frame. `fitToFrame()` is a new function with this behavior:

- It works on the `.wrapper` element (the title and the play area). The fixed toolbar with the skin picker and the theme button is outside it and is not scaled.
- It resets `zoom` on `.wrapper`, measures its natural size (`scrollWidth` and `scrollHeight`, so an overlay or menu taller than the board counts) and sets `.wrapper.style.zoom` to `Math.min(1, innerWidth / width, innerHeight / height)`.
- It runs on load, on `resize`, and each time an overlay or menu opens, because the start menu can be taller than the board.
- The scale never goes above 1, so in a window larger than the game, such as `/games/drop/index.html` opened directly, the game keeps its natural size.
- It changes nothing else: not the canvas sizes, not the game state, not the frame and not `aspect`.

Migration (`supabase/migrations/<version>_add_drop_game.sql`). The values are the same as the SPEC 06 seed row. Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes: the SPEC 08 insert policy accepts any `game_id` that exists in `games`.

```sql
insert into public.games (id, title, category, accent)
values ('drop', 'Drop', 'Puzzle', 'magenta');
```

Cover art: `av-cover-drop` already exists in `app/globals.css` (a purple radial background and six colored blocks). It is not edited.

Conventions:

- The id stays `drop`, so the saved scores keep `game_id = 'drop'` and the local key stays `arcade-vault:scores:drop`.
- `GAMES` order is `asteroids`, `drop`: Asteroids stays the first tile of the landing rail and the default tab of `/hall-of-fame`.
- `CATEGORIES` is built from `GAMES`, so it becomes `All`, `Shooter`, `Puzzle` without an edit.
- The migration file name uses the version that Supabase assigns when it is applied (check `list_migrations`), as in SPEC 06 and SPEC 08.

File layout:

```
lib/games.ts                                            adds the drop entry after asteroids, updates the comment above GAMES
lib/games-archive.ts                                    removes the drop entry, fixes the header comment
lib/games.test.ts                                       archived ids list: seven instead of eight
lib/scores.test.ts                                      purge tests use the invented id `retired-game` instead of drop
public/games/drop/game.js                               preventDefault on the arrow keys, fitToFrame()
supabase/migrations/<version>_add_drop_game.sql         inserts the games row (new)
CLAUDE.md                                               documents the above
```

---

## Implementation plan

1. **Inspect before changing.** With `list_migrations` and `list_tables`, confirm the project is at the state SPEC 08 left it. Manual test: three migrations (`games_and_scores`, `save_scores`, `least_privilege_grants`), and `public.games` has one row, `asteroids`. If not, stop and report.
2. **Confirm the baseline.** Run `npm test` and `npm run build` on the clean tree. Manual test: both pass before any change, so a later failure belongs to this spec.
3. **Migration.** Create `supabase/migrations/<version>_add_drop_game.sql` with the insert from the data model and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports. Run `get_advisors` (security). Manual test: `public.games` has exactly two rows, `asteroids` and `drop`, and the advisors show no new warning about `games` or `scores`.
4. **Arrow keys.** Add the `preventDefault` to `public/games/drop/game.js` as described in the data model. Manual test: open `/games/drop/index.html` directly; pieces move, rotate and soft-drop, `Space` hard-drops, `P` pauses, and typing a name after a game over still moves the caret with the arrow keys.
5. **Catalog.** Move the entry from `lib/games-archive.ts` to `lib/games.ts` with the new tags, update the comment above `GAMES` and the header comment of the archive. Update the ids list in `lib/games.test.ts`. Manual test: `npm test` passes, including `lib/games.test.ts` (file, bridge `data-game`, reader and cover for `drop`) and `lib/leaderboard.test.ts` (the `games` table after the migrations equals `GAMES`).
6. **Play it in the platform.** Open `/game/drop` and `/game/drop/play`. Manual test: the detail shows the title, description, controls and `PUZZLE`; the game starts in the CRT frame and spends one credit; the arrow keys and `Space` do not scroll the host; pause and resume from the host freeze and resume the game; `state` messages with `game: "drop"` carry `score`, `level` and `over`. Measure the 600 px board against the 4:3 frame at desktop width and at 375 px. Step 6 found that it does not fit (see Risks), and step 7 fixes it.
7. **Fit the game to its frame.** Add `fitToFrame()` to `public/games/drop/game.js` as described in the data model. Manual test, in `/game/drop/play` at 1530×772 and at 375×812: the whole board (bottom row included), both side panels and the start menu are visible inside the frame, the iframe shows no scrollbar and the game document has no overflow; resizing the window re-fits the game without a reload; switching the skin and the theme keeps the fit; the arrow keys, `Space`, the host pause and the `state` messages work as in step 6, playing a few pieces while scaled; and `/games/drop/index.html` opened directly in a large window looks as before (scale 1). If this is not enough to make the game fit, stop and report instead of adding CSS or host changes.
8. **Save a score.** Finish a run (let the pieces stack up), type a name and save. Manual test: `SCORE SAVED` shows, the score is in `public.scores` with `game_id = 'drop'` (check with `execute_sql`), `/hall-of-fame` shows a `Drop` tab with it, and nothing was added under `Asteroids`. Delete the test row afterwards, so `scores` keeps only real scores.
9. **Check the other pages.** Manual test: `/`, `/library` (cards for both games, filters `All`, `Shooter` and `Puzzle`, search), `/hall-of-fame`, `/about` and `/login` render with two games and no new console errors, and the landing rail shows both tiles without overlap.
10. **Docs.** Update `CLAUDE.md`: two games in `GAMES` and the new `CATEGORIES`, seven games in `ARCHIVED_GAMES`, four migrations (`add_drop_game`), and the `public/games/<id>/` bullet (`asteroids` and `drop` are in the catalog; `brick-buster` and `rocks` stay on disk).

---

## Acceptance criteria

- [x] `npm run lint`, `npm test` and `npm run build` finish without errors, also with the Supabase variables unset.
- [x] `supabase/migrations/` has one new migration for this spec, and `list_migrations` shows the same name as applied.
- [x] `public.games` has exactly two rows, `asteroids` and `drop`, and the `drop` row matches `GAMES` in `id`, `title`, `category` and `accent`.
- [x] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [x] `GAMES` has exactly two entries, in the order `asteroids`, `drop`. The `drop` entry equals the archived one except for `tags`, which is `["1 PLAYER", "KEYBOARD", "RETRO 1985"]`.
- [x] `ARCHIVED_GAMES` has seven entries, none of them `drop`, and none of its ids is in `GAMES`.
- [x] `/library` lists `Asteroids` and `Drop` with rendered covers, and the category filter offers `All`, `Shooter` and `Puzzle`.
- [x] `/game/drop` shows the title, description, controls `← → to move · ↑ or X to rotate · ↓ to soft drop · SPACE to hard drop · C to hold` and the `PUZZLE` category.
- [x] `/game/drop/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [x] While playing, the arrow keys and `Space` do not scroll the host page, and the game's keys work as before.
- [x] Typing a name in the in-game name form still moves the caret with the arrow keys.
- [x] The host receives `state` messages with `game: "drop"` carrying `score`, `lives: null`, `level` and `over`, and `over` is `true` after a game over.
- [x] Pause and resume from the host freeze and resume the game through the bridge.
- [x] At a 1530×772 viewport, `/game/drop/play` shows the whole board (bottom row included), both side panels and the start menu inside the frame, and the game document has no overflow (`scrollHeight <= clientHeight` and `scrollWidth <= clientWidth`).
- [x] At a 375×812 viewport the whole game is visible inside the frame with no overflow in the game document, and the host page has no horizontal overflow.
- [x] Resizing the window re-fits the game without a reload, and `/games/drop/index.html` opened directly in a window larger than the game keeps its natural size (scale 1).
- [x] With the game scaled, the arrow keys, `Space`, the host pause and the `state` messages work the same as without it.
- [x] A finished run shows `SCORE SAVED`, the score is stored in `public.scores` with `game_id = 'drop'`, and it appears in `/hall-of-fame` under `Drop` and not under `Asteroids`.
- [x] `/hall-of-fame` shows two tabs, `Asteroids` and `Drop`, and `Asteroids` is still the one selected on load.
- [x] A `POST` with the publishable key to `…/rest/v1/scores` with `game_id = 'drop'` and valid values answers 201, and the test row is deleted afterwards.
- [x] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `drop`, and the second one fails when the migration file is removed temporarily.
- [x] The landing and `/library` render with two games, with no overlapping tiles and no new console errors.
- [x] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `public/games/bridge.js`, `components/ui/game.tsx`, `app/globals.css` and `public/games/asteroids/` have no edits (`git diff` is empty for them).
- [x] `references/started-games/03-tetris/` and the earlier migrations are unchanged.
- [x] `CLAUDE.md` documents the two-game catalog, the seven archived games and the new migration.

---

## Decisions

- **Yes:** restore the archived `drop` (user decision, asked because the reference matches an archived game). **No:** a new id from `03-tetris`: it would be a second, much simpler Tetris with its own folder, reader, cover and score table next to a finished one, and the user preferred the finished game.
- **Yes:** the vault's `drop` folder is the source of truth. **No:** copying or syncing from `references/started-games/03-tetris/`, which would throw away hold, power-ups, skills and the challenge modes.
- **Yes:** the id stays `drop` and the entry is restored as archived (tagline, description, accent `magenta`, difficulty 4, `plays`, controls). The scores keep their key and the cover and reader already match.
- **Yes:** remove `TOUCH` from the tags (user decision, recommended). `drop` has no touch handlers, the same reasoning as SPEC 05 for Asteroids. **No:** keeping a tag that promises controls the game does not have.
- **Yes:** `preventDefault` on the arrow keys, after the `nameInput` guard. Inside an iframe those keys can scroll the host, and the vault copy only handled `Space`. **No:** other changes to `game.js` than this one and the fit to the frame below.
- **Yes:** scale the game inside its iframe with a `fitToFrame()` in `public/games/drop/game.js` (user decision, found in step 6, chosen among three options). It fixes both the 26 px crop at desktop and the one-third view at 375 px, and only the files of `drop` change. **No:** `aspect: "5 / 4"`, which fixes only the desktop width and leaves a taller frame than Asteroids. **No:** changing the shared host frame (`CRTScreen`, `app/globals.css`), which touches Asteroids and was out of scope.
- **Yes:** CSS `zoom` on `.wrapper`. It changes the layout size, so the game stays centered and the document does not overflow. **No:** `transform: scale()`, which keeps the unscaled layout box: the iframe would still scroll and the content would sit off-center.
- **Yes:** the scale never goes above 1, so the game keeps its natural size in a large window. **No:** scaling up to fill the frame, which blurs the canvas.
- **Yes:** `drop` stays keyboard only. At 375 px the whole game is visible but small, and touch controls stay out of scope.
- **Yes:** the entry goes after `asteroids`, so Asteroids keeps the big landing tile and the default Hall of Fame tab. **No:** putting `drop` first, which changes what the landing and the Hall of Fame show by default.
- **Yes:** a migration that only inserts the row, with the same values as the SPEC 06 seed. The SPEC 08 policy and grants already accept any existing `game_id`, so nothing else changes. The earlier migrations are not edited.
- **Yes:** leave the in-game TOP 5 and name form of `drop` as they are. They use the game's own `localStorage` keys, wrapped in `try/catch`, and are separate from the global leaderboard. **No:** hiding or wiring them in this spec.
- **Yes:** use the invented id `retired-game` in the `purgeRemovedGameScores` tests (user decision, found in step 5). The purge only looks at keys of ids that are not in `GAMES`, so any id that never returns works. **No:** swapping `drop` for `rocks`, which breaks again the day `rocks` is restored. **No:** leaving the tests red for another spec.
- **No:** a CSS change for the landing rail. If step 9 finds a broken layout with two games, it is reported and handled in its own spec, as the one-game case was in SPEC 08.

---

## Risks

| Risk                                                                                                                                        | Mitigation                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `games` row is missing, so the foreign key rejects every `drop` score.                                                                  | Step 3, and the seed-versus-`GAMES` test in `lib/leaderboard.test.ts`, which fails without it.                                                                                                                                                                                                                                |
| The 600 px board does not fit the 4:3 frame on small screens and the iframe scrolls or crops it.                                            | Step 6 measured it and it happens: at 1530 px wide the frame is 840×630 and the board ends 26 px below it, and at 375 px the frame is 319×239 and shows about a third of the 656 px game. It was already so before SPEC 08. By user decision step 7 fixes it by scaling the game inside its iframe, and re-checks both sizes. |
| The in-game name form and TOP 5 appear while the host asks for the player name, so the player sees two forms.                               | The host overlay covers the iframe at game over. Step 8 checks what the player sees. Wiring or hiding it is out of scope.                                                                                                                                                                                                     |
| The back-to-back and combo multipliers produce a non-integer score and `submitScore` rejects it.                                            | All additions are integers and the bonus uses `Math.floor`; step 8 plays a run to the end and checks the row is stored.                                                                                                                                                                                                       |
| `preventDefault` on the arrows breaks the caret in the name input or the digit shortcuts of the menus.                                      | It goes after the `nameInput` guard and only for the four arrow codes. Step 4 tests the name input and the menus.                                                                                                                                                                                                             |
| The landing rail looks odd with two games (the big tile spans two rows and only one small tile follows).                                    | Accepted. Step 9 checks it, and a broken layout is reported instead of fixed here.                                                                                                                                                                                                                                            |
| The archived `plays` value `31.8K` is mock data and now shows next to the real Asteroids number.                                            | Accepted: `plays` is mock data for every game (`BACKEND:` comment in `lib/games.ts`).                                                                                                                                                                                                                                         |
| The start menu or an overlay is taller than the board, so it is cut or sets the wrong scale.                                                | `fitToFrame()` measures `scrollHeight`, so the overlay counts, and runs each time an overlay or menu opens. Step 7 checks it with the start menu open.                                                                                                                                                                        |
| The fixed toolbar (skin picker and theme button) is outside `.wrapper`, so it is not scaled and can overlap the game in a very small frame. | Accepted. Step 7 looks at it at 375 px. Moving it is out of scope.                                                                                                                                                                                                                                                            |
| `zoom` is not supported by an old browser (Firefox before 126), and the game stays cut as it is today.                                      | Accepted: the fallback is the current behavior, not a regression.                                                                                                                                                                                                                                                             |
| At 375 px the scaled game is small and `drop` has no touch controls.                                                                        | Accepted: the goal is that the whole game is visible. Playing on a phone needs its own spec.                                                                                                                                                                                                                                  |
| The scale is wrong after the skin or theme changes the size of the page.                                                                    | The skin and theme only change colors and fonts. Step 7 switches both and checks the fit again.                                                                                                                                                                                                                               |
| `zoom` on `.wrapper` changes how the game measures itself, so a draw or a position is off.                                                  | The canvases keep their pixel size and the game uses keyboard only, with no pointer coordinates. Step 7 plays a few pieces scaled.                                                                                                                                                                                            |

---

## What is **not** in this spec

- Copying or syncing the `03-tetris` reference.
- Changes to the mechanics, balance, sound, skins or modes of `drop`, or touch controls.
- Connecting the in-game records to the global leaderboard.
- Changes to the player, the leaderboard code, scores, credits or the bridge.
- Restoring any other archived game.
- Layout work on the landing or the library.
- Changes to the host frame, the CRT screen or the `aspect` of `drop`, or a responsive or touch version of the game for phones.
- Auth or protection against forged scores.

Each one of those, if it lands, goes in its own spec.
