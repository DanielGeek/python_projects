# SPEC <NN> — <Title> game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08
> **Date:** <YYYY-MM-DD>
> **Objective:** Add <the reference game `references/started-games/<folder>/` | a new <genre> game> to the vault as a playable catalog entry with id `<id>`, ranked in the global leaderboard.

---

## Why this spec exists

<Why this game, where it comes from, and how it relates to existing or archived games (for example "`drop` is archived; this brings the reference in as its own game, with its own id, folder and score table"). State that the reference is the source of truth, or that the game is new and follows `contract.md`.>

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`.

---

## Scope

**In:**

- New folder `public/games/<id>/` with <files>, <copied from the reference | written for this spec>.
- `index.html` loads `../bridge.js` with `data-game="<id>"` before the game scripts.
- <Platform changes to `game.js`, one line each. Normally only `preventDefault` on <keys>.>
- A `readers["<id>"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` with id `<id>` and `src` set, and the comment above `GAMES` updated.
- Cover art: an `av-cover-<id>` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_<id>_game.sql` that inserts its row in `public.games`, applied with the Supabase MCP.
- Update `CLAUDE.md` (playable games, `public/games/<id>/`, `GAMES` description).

**Out of scope (for future specs):**

- Changes to mechanics or balance, sound, touch controls or anything the game does not already have.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol or the library layout.
- Auth, per-player rankings, and a score validation service (the name is still free text, see SPEC 08).
- Any other game, including its folder, entry, reader and cover.
- Copying `README.md`, `CLAUDE.md`, `.gitignore`, `specs/` or lock files from the reference.

---

## Data model

No new persistence. The game enters through the existing `Game` type, the existing local score table (`arcade-vault:scores:<id>`) and the existing `scores` table in Supabase.

Catalog entry (`lib/games.ts`):

```ts
{
  id: "<id>",
  title: "<Title>",
  category: "<Arcade | Puzzle | Shooter | Versus>",
  tagline: "<one line>",
  description: "<two or three sentences, only features the game has>",
  accent: "<cyan | magenta | yellow | green>",
  src: "/games/<id>/index.html",
  aspect: "<W / H>",
  controls: "<controls string>",
  difficulty: <1-5>,
  plays: "<mock, for example 8.2K>",
  tags: [<tags>],
}
```

Bridge reader (`public/games/bridge.js`), from the globals found in the game:

```js
"<id>": function () { return { score: score || 0, lives: <lives or null>, level: <level>, over: <condition> }; },
```

Changes to the reference (omit the table for a new game):

| Where            | Reference      | Vault                      |
| ---------------- | -------------- | -------------------------- |
| <file / handler> | <what it does> | <what the vault copy does> |

Migration (`supabase/migrations/<version>_add_<id>_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it:

```sql
insert into public.games (id, title, category, accent)
values ('<id>', '<Title>', '<Category>', '<accent>');
```

Cover art (`app/globals.css`): <description: background, shapes, glyph, accent color; no image file>.

Conventions:

- The id is lowercase `<id>`. It feeds the route, `av-cover-<id>`, the bridge key and the score storage key, so it is written the same in all of them.
- `score` is an integer from 0 to 9,999,999, and `over` is true for <every way the run ends>.
- <Anything specific: assets, audio, own pause, theme toggle.>

File layout:

```
public/games/<id>/index.html          <from the reference | new>, with the bridge script added
public/games/<id>/game.js             <from the reference | new>, plus <platform change>
public/games/bridge.js                adds readers["<id>"]
lib/games.ts                          adds the entry, updates the comment above GAMES
app/globals.css                       adds av-cover-<id>
supabase/migrations/<version>_add_<id>_game.sql   inserts the games row (new)
CLAUDE.md                             lists <id> among the playable games
```

If the game is restored from `lib/games-archive.ts`: move its entry to `GAMES`, remove it from `ARCHIVED_GAMES`, and update the list in `lib/games.test.ts`.

---

## Implementation plan

1. **Copy or create the game.** Create `public/games/<id>/` and add the bridge script tag. Manual test: `npm run build` still passes and `git status` shows only new files.
2. **Adapt `game.js`.** <Platform changes only.> Manual test: open `/games/<id>/index.html` directly, play until the run ends, and check the end screen and the restart key.
3. **Bridge reader.** Add `readers["<id>"]`. Manual test: in the host console, `message` events with `game: "<id>"` arrive with changing `score`, and `over: true` when the run ends.
4. **Cover art.** Add `av-cover-<id>`. Manual test: the cover renders on a catalog card at desktop and 375 px.
5. **Catalog entry.** Add the entry to `lib/games.ts`. Manual test: `/library` shows the card, `/game/<id>` shows the detail, and the category filter includes it.
6. **Migration.** Check `list_migrations`, run `apply_migration` with the same SQL, name the file with the version Supabase assigns, then run `get_advisors` (security). Manual test: `select id from games` includes `<id>`; no new advisor warning.
7. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` and `lib/leaderboard.test.ts` pass, and fail when the reader, cover rule or migration is removed temporarily.
8. **Play and rank.** Open `/game/<id>/play`, finish a run and save the score. Manual test: `SCORE SAVED` shows, the score appears in `/hall-of-fame` under the `<id>` tab, and a `GET …/rest/v1/scores?game_id=eq.<id>` with the publishable key returns it.
9. **Docs.** Update `CLAUDE.md`.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/<id>/` contains <files> and no `README.md`, `CLAUDE.md`, `.gitignore` or `specs/`.
- [ ] `public/games/<id>/index.html` loads `../bridge.js` with `data-game="<id>"` before the game scripts.
- [ ] `GAMES` has exactly one entry with `id: "<id>"`, `src: "/games/<id>/index.html"`, `accent: "<accent>"` and `category: "<Category>"`.
- [ ] `/library` lists the game with a rendered cover, and the other games are unchanged.
- [ ] `/game/<id>` shows the title, description, controls and category.
- [ ] `/game/<id>/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the keys the game uses do not scroll the host page.
- [ ] The host receives `state` messages with `game: "<id>"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` when the run ends.
- [ ] Pause and resume from the host freeze and resume the game through the bridge.
- [ ] `public.games` has the row for `<id>`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, appears in `/hall-of-fame` under `<id>` from Supabase, and does not appear under another game.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with the new id.
- [ ] `get_advisors` (security) reports no new warning.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts` and the other games' files have no edits (`git diff` is empty for them).
- [ ] `CLAUDE.md` lists `<id>` among the playable games.

---

## Decisions

- **Yes/No:** <source of the game and, if an archived match exists, why restore or why a new id (user decision).>
- **Yes:** the id `<id>`, title `<Title>`, accent `<accent>`, category `<Category>`, difficulty <n> (user decisions).
- **Yes:** the reference `game.js` is the base and the only platform change is <change>. **No:** changes to mechanics.
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.
- **Yes:** `tags` <with | without> `TOUCH`, according to the game's real controls.

---

## Risks

| Risk                                                                                              | Mitigation                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing. | `report()` swallows the error, so step 3 checks the messages by hand; `lib/games.test.ts` checks the reader exists. |
| `over` is not true for every way the run ends, so the score is never saved.                       | Step 8 plays a full run to the end.                                                                                 |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                   | <Say how the game scores; add a note if it can overflow.>                                                           |
| The game has its own pause and conflicts with the host pause.                                     | <Keep or disable it; check in the manual tests.>                                                                    |
| The `games` row is missing, so the foreign key rejects every score.                               | Step 6, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                  |
| <Game-specific risk: audio, assets, theme toggle, second DOM outside the canvas.>                 | <Mitigation.>                                                                                                       |

---

## What is **not** in this spec

- Mechanics, balance, sound or touch controls beyond what the game already has.
- Changes to the player, the leaderboard code, scores, credits or the bridge protocol.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
