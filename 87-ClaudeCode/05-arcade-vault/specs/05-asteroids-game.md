# SPEC 05 — Asteroids game

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-10-18
> **Objective:** Add the reference game `references/started-games/02-asteroids/` to the vault as a new playable catalog entry with id `asteroids`, next to the existing `rocks`.

---

## Why this spec exists

The vault already has a playable `rocks`. It descends from an earlier copy of the same project and has drifted from the reference: other power-up constants, other key handling. `rocks` stays untouched. This spec brings the reference game in as its own game, with its own id, folder, cover art, bridge reader and score table, so the two never share state.

The reference is the source of truth. Its `game.js` is copied with only the changes the platform needs. Its `README.md` supplies the copy for the catalog card (controls, scoring, features) and its `favicon.svg` supplies the idea for the cover art.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**). Nothing new is invented for the platform.

---

## Scope

**In:**

- New folder `public/games/asteroids/` with `index.html`, `game.js` and `favicon.svg`, copied from the reference.
- `index.html` loads `../bridge.js` with `data-game="asteroids"` before `game.js`, like `rocks`.
- One change to `game.js` in the vault copy: `preventDefault` on the arrow keys and `Space` so the iframe does not scroll the host page. Mechanics and constants stay as in the reference. The reference itself was translated to English first (see Decisions), so the copy needs no translation.
- A `readers.asteroids` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` with id `asteroids`, `src` set, so the game is listed in `/library`, has its detail page and is playable at `/game/asteroids/play`.
- Cover art: an `av-cover-asteroids` rule in `app/globals.css`, CSS only.
- A catalog integrity test, `lib/games.test.ts`.
- Update `CLAUDE.md` (playable games list) and the comment above `GAMES` in `lib/games.ts`.
- Fix the Next.js "URL data outside of Suspense" warning on `/game/[id]/play` (`app/game/[id]/play/page.tsx`) and on the detail route `/game/[id]` (`app/game/[id]/page.tsx`): wrap the `params` access in a `<Suspense>` boundary. It was found while testing step 7 and appears for every game (`rocks` and `drop` included), not only for Asteroids. Added to this spec by user decision (see Decisions).

**Out of scope (for future specs):**

- Any change to `rocks`: its folder, its `game.js`, its catalog entry, its cover and its reader.
- Changes to mechanics or balance, a visible pause, UFOs, sound, touch controls or any feature the reference does not have.
- Changes to the bridge protocol, for example sending the 3x power-up state to the host HUD.
- Changes to `lib/scores.ts`, `lib/credits.ts`, the player component (`game-player.tsx`) or the library layout. The only changes to the game routes are the Suspense fixes in `app/game/[id]/play/page.tsx` (step 9) and `app/game/[id]/page.tsx` (step 10).
- The same pattern in any other route. If the overlay reports one, it goes in its own spec.
- Supabase, auth or scores in the database.
- Copying the reference `README.md`, `CLAUDE.md` or `.gitignore` into the vault.

---

## Data model

No new data structures and no new persistence. The game enters through the existing `Game` type and the existing per-game score table, which `lib/scores.ts` already keys by game id (`arcade-vault:scores:asteroids`).

Catalog entry (`lib/games.ts`), inserted right after `rocks`:

```ts
{
  id: "asteroids",
  title: "Asteroids",
  category: "Shooter",
  tagline: "Split the rocks before they split you.",
  description:
    "A lone ship drifts through a wrapping asteroid field. Shoot large rocks into medium ones and medium ones into small ones, and grab the 3x power-up for a spread shot. Three lives, and every wave brings more rocks.",
  accent: "cyan",
  src: "/games/asteroids/index.html",
  aspect: "4 / 3",
  controls: "← → to rotate · ↑ to thrust · SPACE to fire",
  difficulty: 4,
  plays: "11.3K",                                  // mock data, like the other entries
  tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],    // not the shared TAGS: the game has no touch controls
}
```

Bridge reader (`public/games/bridge.js`). The reference uses the same global names as `rocks` (`score`, `lives`, `level`, `state`), so the reader has the same shape:

```js
asteroids: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

Changes to the reference `game.js`:

| Where             | Reference           | Vault                                                                                                                                               |
| ----------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keydown` handler | no `preventDefault` | `preventDefault()` when `e.code` is `Space`, `ArrowUp`, `ArrowDown`, `ArrowLeft` or `ArrowRight`; the `justPressed` logic stays as in the reference |

Changes to the reference `index.html` (its `lang` is already `en`): a `<script src="../bridge.js" data-game="asteroids"></script>` line before `game.js`. The title stays `Asteroids` and the favicon link is kept.

Conventions:

- The id is lowercase `asteroids`, like every other id (`brick-buster`, `drop`, `rocks`). The title is `Asteroids`. The id feeds the route, the CSS class `av-cover-asteroids`, the bridge key and the score storage key, so it is written the same in all of them.
- The reference is already fully in English (code comments, canvas texts, `lang`, README, favicon comments), so the copy is verbatim apart from the `preventDefault` change.
- The mechanics in the reference are authoritative: points 100 / 50 / 20 for small / medium / large rocks (`POINTS` in the code, and the reference README table agrees), 3 lives with blinking invincibility after respawn, a 3x power-up with a 5 s duration, toroidal wrapping and a canvas fixed at 800×600.

Cover art (`app/globals.css`), based on the reference favicon: a dark space background, a ship outline in the accent color, one small grey rock and a few stars, all with gradients and a text glyph like the other covers. No image file.

Test (`lib/games.test.ts`), for every `GAMES` entry whose `src` is not `null`:

- `src` points to an `index.html` that exists under `public/`.
- That `index.html` loads `bridge.js` with `data-game` equal to the entry id.
- `public/games/bridge.js` has a reader with that id.
- `app/globals.css` has an `av-cover-<id>` rule.
- Ids are unique.

File layout:

```
public/games/asteroids/index.html     from the reference, with the bridge script added
public/games/asteroids/game.js        from the reference (already English), plus preventDefault
public/games/asteroids/favicon.svg    from the reference, unchanged
public/games/bridge.js                adds readers.asteroids
lib/games.ts                          adds the entry after rocks, updates the comment above GAMES
lib/games.test.ts                     catalog integrity test (new)
app/globals.css                       adds av-cover-asteroids
CLAUDE.md                             lists asteroids among the playable games
app/game/[id]/play/page.tsx           params access moved inside a <Suspense> boundary
app/game/[id]/page.tsx                params access moved inside a <Suspense> boundary
```

Suspense fix (`app/game/[id]/play/page.tsx`). The Next.js dev overlay reports `Next.js encountered URL data outside of Suspense` at `const game = getGame((await params).id)` in `PlayPage`. The fix is the "Stream" option from the overlay and from `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`: `PlayPage` becomes a synchronous shell that renders `<Suspense fallback={...}>` around an async inner component that awaits `params`, calls `getGame`, runs `notFound()` and renders `<GamePlayer game={game} />`. The behavior stays the same: unknown or non-playable ids still show the not-found screen (with HTTP 200, the same as before the fix, because the page streams), `generateStaticParams` and `generateMetadata` stay as they are. The fallback must not change the layout (same frame size as the player, or `null`). The "Block" option (`export const instant = false`) is not used because it only silences the warning. The detail page `app/game/[id]/page.tsx` gets the same treatment: `GameDetail` becomes a synchronous shell with `<Suspense fallback={null}>` around an async `Detail` component that awaits `params`, calls `getGame`, runs `notFound()` and renders the same markup as today. `generateStaticParams` and `generateMetadata` stay as they are.

---

## Implementation plan

1. **Copy the game.** Create `public/games/asteroids/` with `index.html`, `game.js` and `favicon.svg` from the reference. Add the bridge script tag. Do not touch `rocks`. Manual test: `npm run build` still passes and `git status` shows only new files.
2. **Adapt `game.js`.** Add the `preventDefault` on the five keys. Manual test: open `/games/asteroids/index.html` directly, play a level, die three times, and check that the game over text is in English and that Space restarts.
3. **Bridge reader.** Add `readers.asteroids` to `public/games/bridge.js`. Manual test: in the browser console of the host page, `message` events with `game: "asteroids"` arrive with changing `score`, `lives` and `level`, and `over: true` at game over.
4. **Cover art.** Add `av-cover-asteroids` to `app/globals.css` using the accent `cyan` and the favicon as reference. Manual test: the cover renders on a catalog card without a broken background, at desktop and 375 px.
5. **Catalog entry.** Add the `asteroids` entry to `lib/games.ts` after `rocks` and update the comment above `GAMES`. Manual test: `/library` shows the card, `/game/asteroids` shows the detail with the `SHOOTER` category and the controls, and the `Shooter` filter includes it.
6. **Catalog test.** Create `lib/games.test.ts` with the checks listed in the data model. Manual test: `npm test` passes, and fails if `readers.asteroids` is renamed temporarily.
7. **Play in the platform.** Open `/game/asteroids/play`. Manual test: the game starts in the CRT frame, one credit is spent, the arrow keys and Space do not scroll the page, pause and resume work, and after game over the score appears in the Hall of Fame under Asteroids.
8. **Docs.** Update `CLAUDE.md`: add `asteroids` to the playable games in the `public/games/<id>/` line and in the `GAMES` description (nine games now).
9. **Fix the Suspense warning.** In `app/game/[id]/play/page.tsx`, move the `await params` into an inner async component wrapped in `<Suspense>`, as described in the data model. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` first. Manual test: open `/game/asteroids/play` and `/game/rocks/play` with `npm run dev`; the dev overlay shows no `Instant` insight and the console has no `instant-shell-url-data` error; both games still start and spend one credit; `/game/serpent/play` and `/game/nope/play` still show the not-found screen (HTTP 200, as before); `npm run build` passes.
10. **Fix the Suspense warning on the detail page.** Same pattern in `app/game/[id]/page.tsx`, as described in the data model. Manual test: open `/game/asteroids`, `/game/drop` and `/game/rocks` with `npm run dev`; the console has no `instant-shell-url-data` error and the dev overlay shows no `Instant` insight; the page looks the same (cover, tags, stats, scores); `/game/serpent` still shows its `COMING SOON` detail and `/game/nope` still shows the not-found screen; `npm run build` passes.

---

## Acceptance criteria

- [x] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [x] `public/games/asteroids/` contains `index.html`, `game.js` and `favicon.svg`, and no `README.md`, `CLAUDE.md` or `.gitignore`.
- [x] `public/games/rocks/`, the `rocks` entry in `lib/games.ts`, its reader and `av-cover-rocks` are unchanged (`git diff` shows no edits to them). The only `git diff` in `app/globals.css` for `av-cover-rocks` is Prettier formatting (the rule content is identical).
- [x] `public/games/asteroids/index.html` loads `../bridge.js` with `data-game="asteroids"` before `game.js`.
- [x] `GAMES` has nine entries, and exactly one has `id: "asteroids"` with `src: "/games/asteroids/index.html"`, `accent: "cyan"`, `category: "Shooter"` and `difficulty: 4`.
- [x] `/library` lists `Asteroids` as a card with a rendered cover, and `rocks` is still listed separately.
- [x] `/game/asteroids` shows the title, description, controls `← → to rotate · ↑ to thrust · SPACE to fire` and the `SHOOTER` category.
- [x] `/game/asteroids/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [x] While playing, the arrow keys and `Space` do not scroll the host page.
- [x] The canvas shows `LEVEL <n>` in the HUD and `SCORE: <n>   —   PRESS SPACE TO RESTART` at game over, with no Spanish text.
- [x] Destroying a large, a medium and a small rock adds 20, 50 and 100 points.
- [x] The host receives `state` messages with `game: "asteroids"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` after the third life is lost.
- [x] A score saved from Asteroids appears in `arcade-vault:scores:asteroids` and in the Hall of Fame, and does not appear under `rocks`.
- [x] The Pause/resume of the host freezes and resumes the game through the bridge.
- [x] `lib/games.test.ts` passes and covers every playable entry (file exists, bridge `data-game`, reader, cover rule, unique ids).
- [x] The landing shows the game count `09` in its stat and `+4 more in the vault` in the rail, with no layout change (the rail still shows the first five games).
- [x] The existing pages (`/`, `/library`, `/game/drop`, `/game/rocks`, `/hall-of-fame`, `/about`, `/login`) render without new console errors.
- [x] `CLAUDE.md` lists `asteroids` among the playable games.
- [x] `/game/asteroids/play` and `/game/rocks/play` no longer log `Next.js encountered URL data during prerendering or a navigation` and the dev overlay shows no `Instant` insight for them.
- [x] `/game/serpent/play` (not playable) and `/game/nope/play` (unknown id) still show the not-found screen "This page does not exist in the Vault" (HTTP 200, the same as before the fix), and `game-player.tsx` is unchanged (`git diff` shows no edits to it).
- [x] `/game/asteroids`, `/game/drop` and `/game/rocks` no longer log `Next.js encountered URL data during prerendering or a navigation`, the dev overlay shows no `Instant` insight for them, and the page looks the same. `/game/serpent` still shows `COMING SOON` and `/game/nope` still shows the not-found screen.

---

## Decisions

- **Yes:** a new game with id `asteroids`, separate from `rocks`. This was an explicit user decision: "this game is not rocks, it is a new one called Asteroids". **No:** re-syncing `rocks` with the reference, **no:** replacing `rocks`. Replacing would orphan the scores saved under `rocks`, and re-syncing was not what was asked.
- **Yes:** lowercase id `asteroids` with the title `Asteroids`. The user wrote the name with a capital, but every existing id is lowercase kebab-case and the id is used in routes, CSS classes and storage keys.
- **Yes:** the reference `game.js` is the base, and the only platform change is `preventDefault`. This keeps the game identical to what the user already built. **No:** copying the `rocks` `game.js`, which has different constants.
- **Yes:** everything in the project is English, and the reference was translated in place (`game.js` comments and canvas texts, `index.html` `lang`, `README.md`, `favicon.svg` comments). This was an explicit user decision. The same translation was applied to the favicon comments of `rocks` and to one CSS comment in `references/templates/home-about/styles.css`, with no functional change. The other two references (`03-tetris`, `04-arkanoid`) were translated too, including renaming `clima.md` to `weather.md` and the two Spanish-named Arkanoid specs. The only Spanish left is the multilingual status aliases (`Borrador`, `Aprobado`, …) inside the `spec` and `spec-impl` skills, which are functional and must stay.
- **Yes:** `preventDefault` on arrows and `Space`. Inside an iframe, those keys can scroll the host page. The reference runs standalone and has no need for it.
- **Yes:** the catalog copy comes from the reference README and from the code, with no UFOs, because the reference has none. `rocks` promises UFOs; Asteroids must not. The 3x power-up is mentioned because it is in `game.js`, even though the README does not list it.
- **Yes:** the points stay as in the reference: small 100, medium 50, large 20. `POINTS` is `[0, 100, 50, 20]` indexed by size 1, 2, 3, and the README table says the same. Smaller rocks are harder to hit, so they pay more.
- **Yes:** accent `cyan` (user decision). It differs from `rocks` (yellow) and matches the cyan of the power-up in the game.
- **Yes:** category `Shooter`, difficulty 4, same as `rocks` (user decision).
- **Yes:** its own `tags` without `TOUCH`, since the reference has no touch controls. **No:** the shared `TAGS` constant.
- **Yes:** the entry goes right after `rocks`, so the two shooters sit together. It is outside the first five games, so the landing rail does not change.
- **Yes:** the score and lives integration is whatever the bridge and the player already do (user decision). The spec only verifies it works with this game. **No:** bridge extensions in this spec.
- **Yes:** `lib/games.test.ts` covering every playable game. Adding a game has four manual touch points (folder, bridge, catalog, cover) and a typo in one of them fails silently at runtime. A test makes the `CLAUDE.md` checklist verifiable. **No:** a test only for Asteroids, which would not protect the next game.
- **Yes:** fix the Suspense warning on `/game/[id]/play` and on the detail route `/game/[id]` inside this spec (user decisions, 2026-10-18), although it is not caused by Asteroids. It was found while verifying step 7 and the user asked for it to be fixed on this branch. Each page is touched in a single file and the fix changes neither the player nor the detail markup. The detail route was added after the user asked for it while the criteria were being verified (the overlay reports it for `drop` and `rocks` too). **No:** `export const instant = false`, which hides the warning without fixing it. **No:** touching `game-player.tsx` or any other route.

---

## Risks

| Risk                                                                                                                                                                                                                          | Mitigation                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| The bridge reads `score`, `lives`, `level` and `state` as bare globals. They are `let` declarations in a classic script, so they are visible to `bridge.js`, but they stay in the temporal dead zone until `initGame()` runs. | `report()` already wraps the reader in `try/catch`, and `score                                                       |     | 0`plus the 200 ms polling cover the first tick. Same behavior as`rocks`. |
| Pressing `Space` at game over restarts inside the game without going through the host "Play again", so it may not spend a credit.                                                                                             | Same behavior as `rocks`. Step 7 checks how the player reacts. Any change to credits is a separate spec.             |
| The reference `justPressed` logic differs from the one in `rocks`: it only sets the flag on a fresh press and never clears it for held keys. Holding `Space` does not auto-fire.                                              | This is the reference behavior and is kept on purpose.                                                               |
| `av-cover-asteroids` clashes visually with `av-cover-rocks`, two similar dark space covers side by side.                                                                                                                      | Different accent (cyan against yellow) and a ship plus a single grey rock instead of three rocks. Checked in step 4. |
| Two near-identical games confuse players.                                                                                                                                                                                     | Accepted, user decision. The cards differ in accent, tagline and description.                                        |
| The new test depends on reading `public/` and `app/globals.css` from disk, and breaks if a file moves.                                                                                                                        | Paths are resolved from the project root, and the failure message names the missing file and the game id.            |
| The Suspense fix changes how the play route streams, and could flash an empty page or break the not-found screen for non-playable ids.                                                                                                     | A layout-neutral fallback, and step 9 re-checks both not-found cases, the credit spend and `npm run build`.                |
| The detail page fix could flash an empty shell before the game data, or change the detail layout. | A `null` fallback and an inner component with the same markup as today. Step 10 compares the page before and after and re-checks `COMING SOON` and not-found. |
| A future change to the `Game` type or to the reader format makes the test stale.                                                                                                                                              | The test only checks existence and naming, not behavior, so it needs updating only when the bridge contract changes. |

---

## What is **not** in this spec

- Any change to `rocks`.
- Mechanics, balance, UFOs, sound, touch controls or a visible pause.
- Bridge protocol changes or HUD data for the power-up.
- Changes to scores, credits, the player component or the library layout. The Suspense fixes in the play and detail pages (steps 9 and 10) are the only exceptions.
- Supabase or auth.

Each one of those, if it lands, goes in its own spec.
