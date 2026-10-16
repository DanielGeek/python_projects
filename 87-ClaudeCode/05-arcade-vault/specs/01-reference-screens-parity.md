# SPEC 01 — Visual parity with the reference screens

> **Status:** Approved
> **Depends on:** none
> **Date:** 2026-10-15
> **Objective:** Close every visual gap between `app/` and the five screens in `references/templates/`, align the catalog with the reference games, and add a working credits counter.

---

## Why this spec exists

An audit of `app/` against `references/templates/` showed that all five screens already exist (Library, Detail, Player, Auth, Hall of Fame), plus Nav with a mobile drawer and a `not-found` page the reference does not have. The data layer (`lib/games.ts`, `lib/session.ts`, `lib/scores.ts`) and `public/games/bridge.js` are complete. What is missing is visual detail and a few data fields. This spec lists those gaps and closes them. No game is implemented.

### Audit result

| Reference piece                                                            | Status in `app/`                                         |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Library: hero, search, category chips, grid, empty state                   | Present                                                  |
| Library: per-game cover art (`cover-bg`)                                   | **Missing** (cards show a letter glyph)                  |
| Detail: title, description, controls, Play / Back actions, leaderboard     | Present                                                  |
| Detail: cover, tags row, stat strip (Plays, Global best, Difficulty)       | **Missing**                                              |
| Player: HUD, CRT, pause overlay, Game Over modal with save                 | Present, with real iframe + bridge                       |
| Player: `GAME OVER` modal title, `SIGNAL OK` / title / `CRT-83 · 60 HZ` footer | **Missing**                                          |
| Auth: tabs, form, guest, social buttons                                    | Present                                                  |
| Auth: `SYSTEM ACCESS · v2.6` header, terms caption                         | **Missing**                                              |
| Hall of Fame: game tabs, table, personal best                              | Present                                                  |
| Hall of Fame: top-3 podium, "Back to the library" button                   | **Missing**                                              |
| Nav: logo, links, auth button, mobile drawer                               | Present                                                  |
| Nav: `CREDITS · 03` counter                                                | **Missing**                                              |
| Footer `© 2026 ARCADE VAULT · … · v2.6.0`                                  | **Missing**                                              |
| Catalog: 8 games, categories ARCADE / PUZZLE / SHOOTER / VERSUS            | **Differs** (6 games with other names and categories)    |

---

## Scope

**In:**

- Replace the catalog with the 8 reference games and rename the 3 playable ones: `arkanoid` → `brick-buster`, `tetris` → `drop`, `asteroids` → `rocks`. Ids, folders under `public/games/`, routes, `data-game` attributes and `bridge.js` readers change with them.
- Rename the three unplayable existing games to the reference ids: `snake` → `serpent`, `pac-man` → `muncher`, `space-invaders` → `invaders`. Add `froggy` and `pixel-duel`. All five stay `src: null`.
- Adopt the reference categories: `Arcade`, `Puzzle`, `Shooter`, `Versus`.
- Per-game cover art, ported from the reference `cover-*` classes, used on Library cards and the Detail screen.
- Detail: cover, tags row and stat strip.
- Hall of Fame: top-3 podium (empty slots shown as `---`) and the "Back to the library" button.
- Auth: `SYSTEM ACCESS · v2.6` header and terms caption.
- Layout: global footer.
- Player: `GAME OVER` modal title and CRT footer text, compared against the reference styles. The pause/exit flow is unchanged.
- Credits: `lib/credits.ts`, live counter in the Nav, one credit spent per game start, and an `INSERT COIN` screen at zero.
- Update `CLAUDE.md` so the catalog, ids and credits are documented.

**Out of scope (for future specs):**

- Implementing any new game (`serpent`, `muncher`, `invaders`, `froggy`, `pixel-duel` remain "Coming soon").
- The reference's fake player simulator (enemies, ship, random score ticker).
- The reference's `seededScores` mock leaderboards. Real scores from `lib/scores.ts` are used.
- The `END` button in the HUD. Real games end by themselves.
- Credits tied to user accounts, timed refills or any server-side logic.
- Migrating previously saved scores to the new game ids.
- Real OAuth, a real backend, a Terms page behind the caption.

---

## Data model

```ts
// lib/games.ts
export type Accent = "cyan" | "magenta" | "yellow" | "green"; // "green" is new

export interface Game {
  id: string;
  title: string;
  category: "Arcade" | "Puzzle" | "Shooter" | "Versus";
  tagline: string;
  description: string;
  accent: Accent;
  src: string | null;
  aspect: string;
  controls: string;
  /** NEW. 1 to 5, shown as filled stars in the Detail stat strip. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** NEW. Display string such as "12.4K". BACKEND: replace with a real play counter. */
  plays: string;
  /** NEW. Extra tags after the category, e.g. ["1 PLAYER", "KEYBOARD / TOUCH"]. */
  tags: string[];
}
```

Catalog after this spec:

| id            | title        | category | accent  | playable | folder under `public/games/` |
| ------------- | ------------ | -------- | ------- | -------- | ---------------------------- |
| `brick-buster`| Brick Buster | Arcade   | cyan    | yes      | `brick-buster/`              |
| `drop`        | Drop         | Puzzle   | magenta | yes      | `drop/`                      |
| `serpent`     | Serpent      | Arcade   | green   | no       | —                            |
| `muncher`     | Muncher      | Arcade   | yellow  | no       | —                            |
| `invaders`    | Invaders     | Shooter  | green   | no       | —                            |
| `rocks`       | Rocks        | Shooter  | yellow  | yes      | `rocks/`                     |
| `froggy`      | Froggy       | Arcade   | green   | no       | —                            |
| `pixel-duel`  | Pixel Duel   | Versus   | cyan    | no       | —                            |

`tagline` and `description` come from the reference `short` and `long` fields. `plays` comes from the reference `plays` field. `controls` for the five unplayable games is written fresh (the reference has none).

Credits:

```ts
// lib/credits.ts
const KEY = "arcade-vault:credits";      // localStorage, value: integer as string
const EVENT = "arcade-vault:credits";    // custom event, same pattern as lib/scores.ts
export const INITIAL_CREDITS = 3;

export function useCredits(): number;    // useSyncExternalStore, returns INITIAL_CREDITS when unset
export function spendCredit(): boolean;  // true if a credit was spent, false if the balance was 0
export function insertCoin(): void;      // sets the balance back to INITIAL_CREDITS
```

Conventions:

- One credit counter per device, shared by guests and signed-in users.
- `lib/credits.ts` carries a `BACKEND:` comment like the other `lib/` modules and keeps its exported signatures stable.
- Podium and leaderboard entries keep the existing `ScoreEntry` shape from `lib/scores.ts`.

---

## Implementation plan

1. **Rename the playable games.** `git mv` the three folders, update `data-game` in each `index.html`, the `readers` keys in `public/games/bridge.js`, and the ids and `src` in `lib/games.ts`. Verify: `npm run dev`, the three games still load in the player and report score.
2. **Complete the catalog.** Extend `Game` with `difficulty`, `plays`, `tags`; add `green` to `Accent` and `--green: #00ff88` to `app/globals.css`; replace `GAMES` with the 8 entries and the new categories; rename `snake`, `pac-man`, `space-invaders` and add `froggy`, `pixel-duel`. Verify: Library shows 8 cards and the four category chips.
3. **Cover art.** Port the `cover-*` rules from `references/templates/styles.css` to `app/globals.css` as `av-cover-<id>`. Add a `CoverArt` component in `components/ui/game.tsx` and use it in `GameCard`, replacing the letter glyph. Verify: every card shows its own art.
4. **Detail screen.** Add the cover, tags row (category + `tags`) and stat strip in `app/game/[id]/page.tsx`. Global best uses `bestScore` from `lib/scores.ts` through a client component next to `game-scores.tsx`. Verify: `/game/drop` shows cover, tags, Plays, Global best and 3 filled stars out of 5.
5. **Podium.** Add `Podium` to `components/ui/game.tsx` with its `av-podium*` styles, and render it above the table in `app/hall-of-fame/hall-of-fame.tsx`. Add the "Back to the library" button. Verify: with no scores the three slots read `---`; after saving one score it appears in slot 01.
6. **Auth card.** Add the `SYSTEM ACCESS · v2.6` line under the logo and the terms caption at the bottom of `app/login/auth-card.tsx`. Verify visually at `/login`.
7. **Footer and static credits.** Add the footer to `app/layout.tsx`. Add the `CREDITS · 03` coin counter to `components/ui/navbar.tsx` (desktop bar and drawer) as static text. Verify on all routes, including at phone width.
8. **Player polish.** Pass `title="GAME OVER"` to the `Modal` in `game-player.tsx`. Extend the `CRTScreen` footer with the `SIGNAL OK` label, the game title and `CRT-83 · 60 HZ`. Compare HUD, CRT and modal spacing and colors against `.player-hud`, `.crt` and `.modal` in the reference and fix differences. Verify: finish a game of `brick-buster` and see the titled modal.
9. **Credits module.** Create `lib/credits.ts` as described in the data model. Verify from the browser console that `spendCredit` and `insertCoin` change `localStorage["arcade-vault:credits"]`.
10. **Live counter.** Replace the static text in the Nav with `useCredits()`. Verify: editing the localStorage value updates the Nav without a reload.
11. **Spend on start.** In `game-player.tsx`, call `spendCredit()` once when the player mounts and on every "Play again". If the balance is 0, do not mount the iframe; render an `INSERT COIN` overlay whose button calls `insertCoin()` and then starts the game. Verify the acceptance criteria below.
12. **Docs.** Update `CLAUDE.md` (catalog, ids, categories, `lib/credits.ts`, new accent) so it matches the code.

---

## Acceptance criteria

- [x] `npm run lint` and `npm run build` finish without errors.
- [x] Library lists exactly 8 games with the ids from the catalog table and four category chips (`Arcade`, `Puzzle`, `Shooter`, `Versus`) after `All`.
- [x] Only `brick-buster`, `drop` and `rocks` have a Play link. The other five show a disabled "Coming soon" button.
- [x] `/game/arkanoid`, `/game/tetris` and `/game/asteroids` return the not-found page.
- [x] `/game/brick-buster/play`, `/game/drop/play` and `/game/rocks/play` load their game and the HUD score changes while playing.
- [x] Every Library card and Detail page shows its own cover art, not a letter glyph.
- [x] The Detail page shows the category tag, the extra tags, Plays, Global best and a difficulty row of five stars.
- [x] Global best on Detail equals the top entry in that game's leaderboard, or `—` when there are no scores.
- [x] Hall of Fame shows a three-slot podium. A game with no scores shows `---` in all three slots.
- [x] Saving a score in `drop` makes it appear in the podium and the table of `drop` after opening Hall of Fame.
- [x] Hall of Fame has a "Back to the library" button that navigates to `/`.
- [x] `/login` shows `SYSTEM ACCESS · v2.6` and the terms caption.
- [x] The footer appears on every route and does not cause horizontal scroll at 375 px width.
- [x] The Game Over modal title reads `GAME OVER`.
- [x] The CRT footer shows `SIGNAL OK`, the game title and `CRT-83 · 60 HZ`.
- [x] On a fresh browser profile the Nav shows `CREDITS · 03`.
- [x] Opening a playable game's play page lowers the Nav counter by exactly 1.
- [x] Clicking "Play again" after Game Over lowers the counter by exactly 1.
- [x] With the counter at 0, the play page shows `INSERT COIN` and no iframe is mounted.
- [x] Clicking "Insert coin" sets the counter to 3, starts the game and then lowers it to 2.
- [x] Reloading the page keeps the credit balance.

---

## Decisions

- **Yes:** keep the existing visual language (`av-*` classes, `components/ui/`). The reference is the visual target, not code to copy. Its React 18 + Babel scripts are not ported.
- **Yes:** rename ids, folders and routes of the playable games, as requested. This is consistent across code, URLs and the bridge, at the cost of a one-time break (see Risks).
- **Yes:** adopt the reference categories and names. The user explicitly chose to align with the design over keeping the current taxonomy.
- **Yes:** port the per-game `cover-*` art. It was not asked for explicitly but the audit found it on both Library and Detail in the reference, and the goal is parity.
- **Yes:** static `difficulty`, `plays` and `tags` fields in `games.ts`, with a `BACKEND:` comment on `plays`. There is no server to count plays.
- **No:** counting plays in localStorage. It would only count this device and add logic to `saveScore`.
- **Yes:** the credit is spent when the play page mounts and on "Play again", stored in `arcade-vault:credits`.
- **Yes:** at zero credits, an `INSERT COIN` button restores 3 with no limit. Without a backend, any harder limit is bypassable by clearing localStorage and only frustrates honest players.
- **No:** timed refills or per-account credits. They need server state and belong to a future spec.
- **Yes:** keep credits in this spec, as the last steps, so the visual work can be committed before the mechanic. Splitting into a SPEC 02 was considered and declined.
- **No:** copying the reference `END` button, `LOAD · 1MB` text and fake player simulator. They only exist because the reference has no real games.
- **No:** migrating saved scores from the old ids. localStorage is a stand-in for a backend and there is no production data to protect.

---

## Risks

| Risk                                                                                     | Mitigation                                                                                                   |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Scores saved under `arcade-vault:scores:arkanoid` / `tetris` / `asteroids` become orphaned | Accepted. Step 1 and `CLAUDE.md` document the new keys. No migration is written.                             |
| Missing a rename in `bridge.js` makes the HUD stay at zero silently (`readers[gameId]` throws and is swallowed) | Step 1 verifies the score changes for all three games. Acceptance criteria repeat the check.    |
| React Strict Mode runs effects twice in dev and spends two credits                       | Guard `spendCredit()` with a ref keyed by the run counter so it runs once per start.                          |
| Reloading the play page spends another credit                                            | Accepted: a reload restarts the game, so it counts as inserting a coin. Zero credits is recoverable via Insert coin. |
| Several tabs show different balances                                                     | `useCredits` listens to the `storage` event as well as the custom event, like `useScores`.                   |
| Porting ~125 lines of cover CSS bloats `globals.css`                                     | Prefix everything `av-cover-*` and keep it in one block at the end of the file.                              |

---

## What is **not** in this spec

- Any new playable game. Five catalog entries stay "Coming soon".
- A backend, real OAuth, or a Terms page.
- Credits per account, timed refills, or limits that survive clearing localStorage.
- Migration of previously saved scores.
- The reference's fake game simulator and `END` button.

Each one of those, if it lands, goes in its own spec.
