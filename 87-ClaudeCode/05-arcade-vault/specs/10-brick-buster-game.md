# SPEC 10 — Restore the Brick Buster game

> **Status:** Approved
> **Depends on:** SPEC 05, SPEC 06, SPEC 08, SPEC 09
> **Date:** 2026-10-19
> **Objective:** Bring the archived `brick-buster` (the Arkanoid game) back into the catalog as a playable game, fitted to its CRT frame at any size and with its row in `public.games` so the scores it saves reach the global leaderboard.

---

## Why this spec exists

`references/started-games/04-arkanoid/` is a plain Arkanoid of 268 lines. The `brick-buster` game that SPEC 08 archived descends from it, but it is a rewrite. `public/games/brick-buster/game.js` (488 lines) adds:

- a start menu with three difficulties (ball speed and lives);
- launching the ball with Space or a click;
- A/D keys;
- mute on M;
- a controls guide;
- a restart from the end screen back to the menu.

It has no level jump in the pause. The reference, by contrast, has no restart after the run ends, and its pause selector lets a player replay level 1 and pile up points.

By user decision this spec restores `brick-buster`, not the reference. The reference stays untouched in `references/` and is not copied into the vault. The vault folder is the source of truth.

SPEC 08 left these in place on purpose:

- the folder, whose `index.html` already loads `../bridge.js` with `data-game="brick-buster"`;
- `readers["brick-buster"]` in `public/games/bridge.js`;
- `av-cover-brick-buster` in `app/globals.css`.

What is missing is the catalog entry and the `games` row, because `scores.game_id` has a foreign key to it (SPEC 06, SPEC 08). The player and the leaderboard need no change: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`.

Checking the game against `contract.md`:

- The reader is correct and the score is an integer (10 per brick, a few thousand at most).
- There is an in-game restart, and the loop runs on rAF with no `localStorage`.

Three things are fixed here:

- `ArrowUp` and `ArrowDown` call `preventDefault` only in the menu, so they can scroll the host while playing.
- The archived tags promise `TOUCH`, but the game has no touch handlers.
- The 800×600 canvas fits the desktop frame (840×630) but is cut at 375 px, where the frame is about 319×239. By user decision this is fixed by scaling the game inside its iframe, as SPEC 09 did for `drop`.

---

## Scope

**In:**

- Move the `brick-buster` entry from `ARCHIVED_GAMES` to `GAMES`, after `drop`. The tags change to `["1 PLAYER", "KEYBOARD", "RETRO 1985"]`; the rest stays as archived (accent `cyan`).
- `lib/games-archive.ts`: remove the entry and fix the header comment (Brick Buster came back with SPEC 10; only `rocks` still has a folder on disk).
- Migration `supabase/migrations/<version>_add_brick_buster_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP `apply_migration`.
- Two changes to `public/games/brick-buster/game.js`: `preventDefault` on `ArrowUp`/`ArrowDown` outside the menu, and a new `fitToFrame()`.
- `lib/games.test.ts`: the archived ids list has six entries instead of seven.
- Update `CLAUDE.md`: the `games.ts`, `games-archive.ts`, `supabase/migrations/` (five migrations) and `public/games/<id>/` bullets.

**Out of scope (for future specs):**

- Copying or syncing the `04-arkanoid` reference.
- Mechanics, balance, difficulties, sound, mute and touch controls.
- The canvas title `Arkanoid` in the menu.
- Moving the controls guide or the mute indicator.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `public/games/bridge.js`, `components/ui/game.tsx`, `app/globals.css` and the `aspect` of `brick-buster`, which stays `"4 / 3"`.
- The same 375 px crop in Asteroids.
- Scaling the game up above its natural size.
- Restoring any other archived game.
- Auth and protection against forged scores.

---

## Data model

No new persistence. The game uses the existing local key `arcade-vault:scores:brick-buster` and the existing `scores` table in Supabase.

Catalog entry (`lib/games.ts`), as archived except `tags`:

```ts
{
  id: "brick-buster",
  title: "Brick Buster",
  category: "Arcade",
  tagline: "Bounce the ball and smash neon walls.",
  description:
    "Steer a paddle-ship and bounce a plasma core to pulverize walls of chromatic blocks. Every level rearranges the grid into impossible patterns. How far will your streak go?",
  accent: "cyan",
  src: "/games/brick-buster/index.html",
  aspect: "4 / 3",
  controls: "← → or A/D to move · SPACE to launch · 1-3 to pick difficulty",
  difficulty: 3,
  plays: "12.4K",
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
}
```

Bridge reader. It already exists in `public/games/bridge.js` and is not edited. `game` is a top-level `const`, so the bridge sees it. `over` covers losing and winning, and it turns false again when the game goes back to the menu, so a second run is saved on its own:

```js
"brick-buster": function () { return { score: game.score, lives: game.lives, level: game.level + 1, over: game.status === 'lost' || game.status === 'won' }; },
```

Changes to the vault copy of `game.js`:

| Where                                   | Today                                                                              | Vault after this spec                                                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window.addEventListener('keydown', …)` | `ArrowUp` and `ArrowDown` call `preventDefault` only in the menu (`handleMenuKey`) | After the menu branch and before the `Space` check, `preventDefault()` when `e.code` is `ArrowUp` or `ArrowDown`. Nothing else changes: not `KEY_MAP`, not the pause keys and not M.        |
| new `fitToFrame()`                      | The canvas has a fixed 800×600 size and the iframe crops it                        | Sets `#stage.style.zoom` to `Math.min(1, innerWidth / CANVAS_W, innerHeight / CANVAS_H)`. Runs on load and on `resize`. Does not touch the canvas size, the game state or the guide styles. |

More on `fitToFrame()`:

- It measures the canvas (`CANVAS_W` × `CANVAS_H`), not `#stage`. The controls guide and the mute indicator sit outside the canvas, so they must not change the scale.
- The scale never goes above 1. Opened directly in a window larger than the game, the page looks as before.
- The mouse already maps with `getBoundingClientRect()` and `CANVAS_W / rect.width`, so the paddle follows the cursor while the game is scaled. Step 5 checks it.

Migration (`supabase/migrations/<version>_add_brick_buster_game.sql`). The values are the same as the SPEC 06 seed row. Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes: the SPEC 08 insert policy accepts any `game_id` that exists in `games`.

```sql
insert into public.games (id, title, category, accent)
values ('brick-buster', 'Brick Buster', 'Arcade', 'cyan');
```

Cover art: `av-cover-brick-buster` already exists in `app/globals.css` (neon brick stripes on a dark background). It is not edited.

Conventions:

- The id stays `brick-buster`, so saved scores keep `game_id = 'brick-buster'` and the local key stays `arcade-vault:scores:brick-buster`.
- `GAMES` order is `asteroids`, `drop`, `brick-buster`: Asteroids stays the first tile of the landing rail and the default tab of `/hall-of-fame`.
- `CATEGORIES` is built from `GAMES`, so it becomes `All`, `Shooter`, `Puzzle`, `Arcade` without an edit.
- The migration file name uses the version that Supabase assigns when it is applied (check `list_migrations`), as in SPEC 06, SPEC 08 and SPEC 09.

File layout:

```
lib/games.ts                                                 adds the brick-buster entry after drop, updates the comment above GAMES
lib/games-archive.ts                                         removes the brick-buster entry, fixes the header comment
lib/games.test.ts                                            archived ids list: six instead of seven
public/games/brick-buster/game.js                            preventDefault on ArrowUp/ArrowDown, fitToFrame()
supabase/migrations/<version>_add_brick_buster_game.sql      inserts the games row (new)
CLAUDE.md                                                    documents the above
```

---

## Implementation plan

1. **Inspect before changing.** With `list_migrations` and `list_tables`, confirm the project is at the state SPEC 09 left it. Manual test: four migrations (`games_and_scores`, `save_scores`, `least_privilege_grants`, `add_drop_game`), and `public.games` has two rows, `asteroids` and `drop`. If not, stop and report.
2. **Confirm the baseline.** Run `npm test` and `npm run build` on the clean tree. Manual test: both pass before any change, so a later failure belongs to this spec.
3. **Migration.** Create `supabase/migrations/<version>_add_brick_buster_game.sql` with the insert from the data model and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports. Run `get_advisors` (security). Manual test: `public.games` has exactly three rows, and the advisors show no new warning about `games` or `scores`.
4. **Arrow keys.** Add the `preventDefault` to `public/games/brick-buster/game.js` as described in the data model. Manual test: open `/games/brick-buster/index.html` directly. The menu works with `1`–`3`, the arrows, Enter and Space. In the game, ← →, A/D and the mouse move the paddle, Space or a click launches the ball, P or Esc pauses, and M mutes.
5. **Fit the game to its frame.** Add `fitToFrame()` as described in the data model. Manual test, in `/game/brick-buster/play` at 1530×772 and at 375×812: the whole canvas is visible, the iframe shows no scrollbar and the game document has no overflow; resizing the window re-fits the game without a reload; the mouse moves the paddle under the cursor while scaled; and `/games/brick-buster/index.html` opened directly in a large window looks as before (scale 1). If this is not enough to make the game fit, stop and report instead of adding CSS or host changes.
6. **Catalog.** Move the entry from `lib/games-archive.ts` to `lib/games.ts` with the new tags, update the comment above `GAMES` and the header comment of the archive, and update the ids list in `lib/games.test.ts`. Manual test: `npm test` passes, including `lib/games.test.ts` (file, bridge `data-game`, reader and cover for `brick-buster`) and `lib/leaderboard.test.ts` (the `games` table after the migrations equals `GAMES`).
7. **Play it in the platform.** Open `/game/brick-buster` and `/game/brick-buster/play`. Manual test: the detail shows the title, description, controls and `ARCADE`; the game starts in the CRT frame and spends one credit; the arrow keys and Space do not scroll the host; pause and resume from the host freeze and resume the game (and check what the game's own `blur` pause does after resume, see Risks); `state` messages with `game: "brick-buster"` carry `score`, `lives`, `level` and `over`.
8. **Save a score.** Lose a run, type a name and save. Manual test: `SCORE SAVED` shows, the score is in `public.scores` with `game_id = 'brick-buster'` (check with `execute_sql`), `/hall-of-fame` shows a `Brick Buster` tab with it, and nothing was added under the other games. Delete the test row afterwards, so `scores` keeps only real scores.
9. **Check the other pages.** Manual test: `/`, `/library` (three cards, filters `All`, `Shooter`, `Puzzle` and `Arcade`, search), `/hall-of-fame`, `/about` and `/login` render with three games and no new console errors, and the landing rail shows the tiles without overlap.
10. **Docs.** Update `CLAUDE.md`: three games in `GAMES` and the new `CATEGORIES`, six games in `ARCHIVED_GAMES`, five migrations (`add_brick_buster_game`), and the `public/games/<id>/` bullet (`asteroids`, `drop` and `brick-buster` are in the catalog; only `rocks` stays on disk, unlisted).

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors, also with the Supabase variables unset.
- [x] `supabase/migrations/` has one new migration for this spec, and `list_migrations` shows the same name as applied.
- [x] `public.games` has exactly three rows, `asteroids`, `drop` and `brick-buster`, and the `brick-buster` row matches `GAMES` in `id`, `title`, `category` and `accent`.
- [x] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [x] `GAMES` has exactly three entries, in the order `asteroids`, `drop`, `brick-buster`. The `brick-buster` entry equals the archived one except for `tags`, which is `["1 PLAYER", "KEYBOARD", "RETRO 1985"]`.
- [x] `ARCHIVED_GAMES` has six entries, none of them `brick-buster`, and none of its ids is in `GAMES`.
- [ ] `/library` lists the three games with rendered covers, and the category filter offers `All`, `Shooter`, `Puzzle` and `Arcade`.
- [ ] `/game/brick-buster` shows the title, description, controls `← → or A/D to move · SPACE to launch · 1-3 to pick difficulty` and the `ARCADE` category.
- [ ] `/game/brick-buster/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and `Space` do not scroll the host page, and the game's keys and the mouse work as before.
- [ ] The host receives `state` messages with `game: "brick-buster"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` when the run is lost and when it is won.
- [ ] Pause and resume from the host freeze and resume the game through the bridge.
- [ ] At 1530×772 and at 375×812, `/game/brick-buster/play` shows the whole canvas inside the frame, with no overflow in the game document (`scrollHeight <= clientHeight` and `scrollWidth <= clientWidth`) and no horizontal overflow in the host page.
- [x] Resizing the window re-fits the game without a reload, and `/games/brick-buster/index.html` opened directly in a window larger than the game keeps its natural size (scale 1).
- [ ] With the game scaled, the mouse moves the paddle under the cursor, and the keys, the host pause and the `state` messages work the same as without it.
- [ ] A finished run shows `SCORE SAVED`, the score is stored in `public.scores` with `game_id = 'brick-buster'`, and it appears in `/hall-of-fame` under `Brick Buster` and not under another game.
- [ ] `/hall-of-fame` shows three tabs, and `Asteroids` is still the one selected on load.
- [x] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `brick-buster`, and the second one fails when the migration file is removed temporarily.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `public/games/bridge.js`, `components/ui/game.tsx`, `app/globals.css`, `public/games/asteroids/` and `public/games/drop/` have no edits (`git diff` is empty for them).
- [ ] `references/started-games/04-arkanoid/` and the earlier migrations are unchanged.
- [ ] `CLAUDE.md` documents the three-game catalog, the six archived games and the new migration.

---

## Decisions

- **Yes:** restore the archived `brick-buster` (user decision, asked because the reference matches an archived game). It already meets the contract. **No:** a new id `arkanoid` from `04-arkanoid`: it would need its own folder, reader, cover and score table next to a finished game, plus an in-game restart, and the reference's pause selector lets a player replay level 1 for points.
- **Yes:** the vault's `brick-buster` folder is the source of truth. **No:** copying or syncing from the reference, which would throw away the difficulties, the mute and the Space launch.
- **Yes:** the id and the rest of the archived entry stay, including accent `cyan` (user decision, even though Asteroids is also cyan). The cover and the reader already match.
- **Yes:** remove `TOUCH` from the tags (user decision, recommended). The game has no touch handlers, and the mouse is not touch, the same reasoning as SPEC 05 and SPEC 09. **No:** keeping a tag that promises controls the game does not have.
- **Yes:** `preventDefault` on `ArrowUp` and `ArrowDown` outside the menu, because inside an iframe those keys can scroll the host. **No:** other changes to `game.js` than this one and the fit to the frame.
- **Yes:** scale the game inside its iframe with `fitToFrame()` (user decision), using CSS `zoom` on `#stage` and the canvas size, never above 1, as SPEC 09 did for `drop`. **No:** `transform: scale()`, which keeps the unscaled layout box. **No:** changing the shared frame (`CRTScreen`, `app/globals.css`), which touches Asteroids and every other game.
- **No:** fixing the same crop in Asteroids here. Only the files of `brick-buster` change.
- **No:** renaming the `Arkanoid` title in the menu canvas, or moving the controls guide and the mute indicator.
- **Yes:** the entry goes after `drop`, so Asteroids keeps the big landing tile and the default Hall of Fame tab.
- **Yes:** a migration that only inserts the row, with the SPEC 06 seed values. The SPEC 08 policy and grants already accept any existing `game_id`. The earlier migrations are not edited.

---

## Risks

| Risk                                                                                                                                                                                     | Mitigation                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| The `games` row is missing, so the foreign key rejects every `brick-buster` score.                                                                                                       | Step 3, and the seed-versus-`GAMES` test in `lib/leaderboard.test.ts`, which fails without it.                           |
| The game's `blur` handler pauses a running game when the iframe loses focus, for example after the host pause button. After the host resumes, the game stays on `Paused` until P or Esc. | Accepted, since it is the game's own behavior. Step 7 checks it; if it confuses players it is reported for its own spec. |
| The controls guide and the mute indicator are `position: fixed` in the top right corner when the iframe is narrower than 968 px, and can cover the lives HUD.                            | Accepted, as today. Step 5 looks at it at both sizes. Moving them is out of scope.                                       |
| `zoom` on `#stage` breaks the mouse mapping.                                                                                                                                             | The mapping already divides by `rect.width`. Step 5 moves the mouse while scaled.                                        |
| `zoom` is not supported by an old browser (Firefox before 126), and the game stays cut as it is today.                                                                                   | Accepted: the fallback is the current behavior, not a regression.                                                        |
| The three difficulties give different lives (5, 3 and 2) and ball speeds, but all scores share one ranking.                                                                              | Accepted. A ranking per difficulty is out of scope.                                                                      |
| Space on the end screen goes back to the menu inside the game without going through the host "Play again", so it may not spend a credit.                                                 | Same behavior as Asteroids. Step 7 checks how the player reacts. Any change to credits is a separate spec.               |
| Audio is blocked until the first key press in an iframe.                                                                                                                                 | Acceptable: `playSound` already catches the rejected `play()` promise.                                                   |
| The landing rail looks odd with three games.                                                                                                                                             | Accepted. Step 9 checks it, and a broken layout is reported instead of fixed here.                                       |
| The archived `plays` value `12.4K` is mock data and now shows next to the real Asteroids number.                                                                                         | Accepted: `plays` is mock data for every game (`BACKEND:` comment in `lib/games.ts`).                                    |

---

## What is **not** in this spec

- Copying or syncing the `04-arkanoid` reference.
- Mechanics, balance, difficulties, sound or touch controls, and the `Arkanoid` title in the menu.
- Changes to the player, the leaderboard code, scores, credits, the bridge, the CRT frame or the `aspect` of `brick-buster`.
- The 375 px crop of Asteroids.
- Restoring any other archived game.
- Auth or protection against forged scores.

Each one of those, if it lands, goes in its own spec.
