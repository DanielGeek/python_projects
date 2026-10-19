# Game contract

What a game must satisfy to run inside Arcade Vault and feed the global leaderboard. Source of truth: `CLAUDE.md` (**Host ↔ game bridge**), `public/games/bridge.js`, `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`.

## How the host sees a game

- The game is a static page in `public/games/<id>/`, embedded in an iframe. It is not part of the React build.
- `index.html` loads `<script src="../bridge.js" data-game="<id>"></script>` **before** the game's own scripts.
- Every 200 ms the bridge calls `readers["<id>"]()` and posts `{ source: 'arcade-vault-game', type: 'state', game, state: { score, lives, level, over } }` to the parent, only when the state changed.
- The host pauses and resumes with `{ source: 'arcade-vault-host', type: 'pause' | 'resume' }`. The bridge freezes `requestAnimationFrame` and `performance.now`.
- When `over` goes from false to true, the player saves the score locally (`saveScore`) and then to Supabase (`submitScore`, shown as `SAVING…`, `SCORE SAVED` or an `[ERR]` line).

## The reader

```js
"<id>": function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

- It reads **top-level globals of a classic script**. `let` and `const` work; they are in the temporal dead zone until initialised, and `report()` wraps the reader in `try/catch`. Do not wrap the game in a module, an IIFE or a `DOMContentLoaded` closure that hides the variables.
- `score` must be an **integer from 0 to 9,999,999**. The insert policy and `toScoreRow` reject anything else, so a decimal or huge score is never saved.
- `over` must be `true` when the run ends, **for a win as well as a loss**.
- `lives` is `null` when the game has no lives. `level` starts at 1 (add 1 if the game counts from 0).
- Names differ per game; the reader maps them. A new game written from scratch uses `score`, `lives`, `level` and `state` (`'playing' | 'dead' | 'gameover'`).

## Rules for the game

- Plain HTML5 canvas and vanilla JS. No dependencies, no bundler, no network calls, no `localStorage` (scores are the host's job).
- Pause only works if the loop runs on `requestAnimationFrame` and times itself with `performance.now()` (or the rAF timestamp). A `setInterval` game does not pause through the bridge; the spec must say so.
- The game must not scroll the host: `preventDefault()` on `Space` and the arrow keys in the `keydown` handler, without changing the `justPressed` or key-state logic.
- After game over there must be an in-game way to start again (Space or Enter). The host also offers "Play again", which reloads the iframe and spends a credit.
- Assets use paths relative to the game's folder. Audio may be blocked until the first key press; that is acceptable.
- All text, comments and `lang` are in English. The canvas size is fixed, and it gives the catalog `aspect` (for example 800×600 is `"4 / 3"`).
- Do not copy `README.md`, `CLAUDE.md`, `.gitignore`, `specs/` or lock files into the vault.

## Worked examples

| Game         | Reference      | Reader                                                                                                                     | Notes                                                                                                                             |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| asteroids    | `02-asteroids` | `{ score: score \|\| 0, lives: lives, level: level, over: state === 'gameover' }`                                          | `preventDefault` on arrows and Space was the only change (SPEC 05).                                                               |
| drop         | `03-tetris`    | `{ score: score \|\| 0, lives: null, level: level, over: !!gameOver }`                                                     | No lives. Has its own `paused` and a theme toggle outside the canvas; `style.css` ships.                                          |
| brick-buster | `04-arkanoid`  | `{ score: game.score, lives: game.lives, level: game.level + 1, over: game.status === 'lost' \|\| game.status === 'won' }` | Win and loss both end the run. This reader is for the vault copy; the reference uses other globals (`gameState`, `currentLevel`). |

For a reference, always re-read the current globals (`grep -nE '^(let|var|const) '`) instead of trusting this table. The reference `04-arkanoid` has `assets/` with audio and a spritesheet, and its own P / Escape pause.

## Checklist for a new catalog entry

1. `public/games/<id>/` with `index.html`, scripts and assets.
2. Bridge script tag with `data-game="<id>"`.
3. `readers["<id>"]` in `public/games/bridge.js`.
4. `GAMES` entry in `lib/games.ts`, with `src: "/games/<id>/index.html"`.
5. `.av-cover-<id>` rule in `app/globals.css`.
6. Migration inserting the `public.games` row.
7. `CLAUDE.md` updated.

`lib/games.test.ts` checks 1–5 and `lib/leaderboard.test.ts` checks 6 for every `GAMES` entry, so `npm test` fails when one is missing.
