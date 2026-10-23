# SPEC GJ skyguard-01 — Skyguard game

> **Status:** Draft
> **Depends on:** SPEC 05, SPEC 08, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-10-23
> **Objective:** Add Skyguard, a new missile-defense shooter written from scratch with vector-line art, to the vault as a playable catalog entry with id `skyguard`, ranked in the global leaderboard.

---

## Why this spec exists

The game comes from the `game-planner` backlog (`references/game-suggestions-todo.md`, row `skyguard`). The description is the source of truth:

- A missile-defense shooter. The player moves a crosshair with the arrows, or taps on a touch screen, and fires interceptor bursts at falling warheads to protect 6 cities.
- `lives` is the number of cities left, `level` is the wave, and `over` is true when no city is left.
- A 4:3 screen, vector lines only, no third-party art.
- The name and the look must not use the "Missile Command" branding.

There is no reference game, so the game is new. It is written for this spec and follows `contract.md` of the `/add-game` skill, with the standard globals `score`, `lives`, `level` and `state`. No implemented or archived game is the same genre: `asteroids` is the only Shooter in `GAMES`, and the archived Shooters (`invaders`, `rocks`) are a fixed cannon against rows of aliens and a rock field. Nothing is restored from `lib/games-archive.ts`; `skyguard` is a new id, not in `GAMES`, `ARCHIVED_GAMES`, `public/games/` or `specs/game-jam/` (checked).

Points flagged against the platform, none of which change the design:

- **Accent.** The note says "Yellow accent is unused". That was true when the backlog row was written (2026-10-19), but SPEC GJ froggy-01 has since given `froggy` the yellow accent. The catalog is now cyan twice (`asteroids`, `brick-buster`) and magenta, green and yellow once each, so yellow, magenta and green are equally balanced. This spec keeps yellow, as the note intends, and flags it for review (see Decisions).
- **Tap on touch.** Since SPEC 12 every playable entry also needs a `touch` config, the on-screen pad under the CRT frame. Skyguard gets both: the pad (arrows move the crosshair, `A` fires) and the tap on the canvas the user asked for (aim and fire at the tapped spot). Only `froggy` reads pointer input on the canvas so far; this is the second game that does.
- **Space is fire and restart.** Space fires, so a player mashing it when the last city falls would restart at once and skip the end screen. A short restart lock fixes it without changing the controls.

Adding a game follows the checklist in `CLAUDE.md` (**Host ↔ game bridge**) plus the `games` row that saved scores need (SPEC 08). The player and the leaderboard need no changes: `game-player.tsx` saves the score when the bridge reports `over`, and `/hall-of-fame` builds its tabs from `GAMES`. The fit to the frame reuses the `fitToFrame()` pattern of SPEC 09 (`drop`), SPEC 10 and SPEC 11. The drawing follows the SPEC 14 rules from the start (no `shadowBlur` in the frame loop, static scenery cached).

---

## Scope

**In:**

- New folder `public/games/skyguard/` with `index.html` and `game.js`, written for this spec. No image, no audio, no font file: all art is stroked lines drawn on the canvas.
- `index.html` has `lang="en"`, loads `../bridge.js` with `data-game="skyguard"` before `game.js`, and holds one 800×600 canvas.
- `game.js` is a classic script with top-level globals, a `requestAnimationFrame` loop timed with `performance.now()`, `preventDefault` on the arrow keys and Space, a P pause, and tap or click handling with pointer events on the canvas.
- A `fitToFrame()` that scales the page down with CSS `zoom` and never up, as in `snake` and `froggy`.
- A `readers["skyguard"]` entry in `public/games/bridge.js`.
- A new `GAMES` entry in `lib/games.ts` after `froggy`, with a `touch` config, and the comment above `GAMES` updated.
- Cover art: an `av-cover-skyguard` rule in `app/globals.css`, CSS only.
- Migration `supabase/migrations/<version>_add_skyguard_game.sql` that inserts the row in `public.games`, applied with the Supabase MCP.
- Update `references/implemented-games.md` and `CLAUDE.md`.

**Out of scope (for future specs):**

- Splitting warheads, bombers and any threat beyond the plain warhead (SPEC GJ skyguard-02).
- Sound, chain reactions between blasts, rebuilding cities, more than one launcher, a hit on the launcher, WASD and a gamepad.
- Changes to `game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, the bridge protocol, the bridge `KEYS` allowlist, `components/ui/game.tsx` (`CRTScreen`) and the library layout.
- Skins and the light/dark toggle (the `skin-designer` agent adds them after `/spec-impl-game`).
- Auth and a score validation service (the name is still free text, see SPEC 08).
- Any other game, including its folder, entry, reader and cover.

---

## Data model

No new persistence. The game uses the existing `Game` type, the local key `arcade-vault:scores:skyguard` and the existing `scores` table in Supabase. The game itself has no `localStorage`.

Catalog entry (`lib/games.ts`):

```ts
{
  id: "skyguard",
  title: "Skyguard",
  category: "Shooter",
  tagline: "Six cities. One battery. Hold the sky.",
  description:
    "Warheads streak down toward six cities. Steer the crosshair and fire interceptor bursts to catch them in the blast, and save your ammo for the bonus. Every wave is bigger and faster, and the run ends when the last city falls.",
  accent: "yellow",
  src: "/games/skyguard/index.html",
  aspect: "4 / 3",
  controls: "Arrows to aim · SPACE to fire · tap or click to fire at a spot · P to pause",
  touch: {
    move: [
      { code: "ArrowUp", label: "▲", name: "Aim up" },
      { code: "ArrowLeft", label: "◀", name: "Aim left" },
      { code: "ArrowRight", label: "▶", name: "Aim right" },
      { code: "ArrowDown", label: "▼", name: "Aim down" },
    ],
    a: { code: "Space", label: "A", name: "Fire, start or restart" },
    b: { code: "KeyP", label: "B", name: "Pause" },
  },
  difficulty: 3,
  plays: "4.8K",
  tags: ["1 PLAYER", "KEYBOARD / TOUCH", "RETRO 1980"],
}
```

`plays` is mock data, as for every game. `RETRO 1980` is the year the genre started in arcades; neither the tags nor any text names the arcade classic. `KEYBOARD / TOUCH` is the `TOUCH` tag, because the tap on the canvas is a real control.

The `touch` config is the SPEC 12 pad. The crosshair moves while an arrow is held (key state, not one step per keydown), so the arrows need no `repeat`: the host sends `keydown` on press and `keyup` on release. `A` sends `Space` (fire, start, restart) and `B` sends `KeyP` (pause). All six codes are already in the bridge `KEYS` allowlist, and `game.js` reads them through `e.code`, so `lib/games.test.ts` finds them.

### Screen

The canvas is 800×600 (`aspect: "4 / 3"`). Coordinates are canvas pixels, y down.

| Zone   | Area         | What it holds                                                                             |
| ------ | ------------ | ----------------------------------------------------------------------------------------- |
| HUD    | y 0 to 30    | Score on the left, `WAVE n` in the centre, `AMMO n` and the multiplier `×m` on the right. |
| Sky    | y 30 to 548  | Warheads, interceptors, blasts and the crosshair.                                         |
| Ground | y 548 to 600 | A ground line at y = 548, the launcher at x = 400 and the six cities.                     |

- **Cities.** Centres at x = 100, 180, 260 (left) and 540, 620, 700 (right), each a skyline 48 px wide and up to 26 px tall standing on the ground line.
- **Launcher.** A mound with a turret at x = 400. Interceptors leave from `(400, 520)`. The launcher cannot be hit in this spec.
- **Crosshair.** Its centre stays inside x 10 to 790 and y 40 to 500.

### Globals (`public/games/skyguard/game.js`, top-level `let`/`const` of a classic script)

```js
const W = 800,
  H = 600,
  GROUND = 548;
const CITY_X = [100, 180, 260, 540, 620, 700]; // city centres
const CITY_HALF = 26; // a warhead that lands with |x - CITY_X[i]| <= CITY_HALF hits city i
const BASE_X = 400,
  BASE_Y = 520; // where interceptors leave from
const CROSS_SPEED = 420; // px per second while an arrow is held
const SHOT_SPEED = 600; // px per second
const MAX_SHOTS = 3; // interceptors in flight at once
const BLAST_R = 44; // px, full blast radius
const BLAST_GROW = 0.35,
  BLAST_HOLD = 0.25,
  BLAST_FADE = 0.4; // seconds
const RESTART_LOCK = 0.8; // seconds after game over before a restart is accepted
let state = "ready"; // 'ready' | 'playing' | 'paused' | 'waveclear' | 'gameover'
let score = 0,
  lives = 6,
  level = 1; // lives = cities left, level = wave
let cities = [true, true, true, true, true, true]; // standing cities
let ammo = 0; // interceptors left this wave
let cross = { x: 400, y: 300 }; // crosshair centre
let shots = []; // [{ x, y, tx, ty, vx, vy }] interceptors in flight
let blasts = []; // [{ x, y, t }] t = seconds since the blast started
let warheads = []; // [{ sx, sy, x, y, vx, vy }] sx, sy = start point, drawn as the trail
let toSpawn = 0; // warheads of this wave not launched yet
let spawnIn = 0; // seconds to the next launch
let timer = 0; // seconds left of the wave banner, the wave clear screen or the restart lock
let bonus = { cities: 0, ammo: 0 }; // points shown on the wave clear screen
let keys = {}; // held keys by e.code
```

The reader uses only `score`, `lives`, `level` and `state`. `lives` is always the count of `true` in `cities`, kept in step when a city falls.

### Waves

For wave `L` (`level`), set when the wave starts:

| Value                         | Formula                                        | Wave 1 | Cap               |
| ----------------------------- | ---------------------------------------------- | ------ | ----------------- |
| Warheads in the wave          | `min(30, 6 + 2 × L)`                           | 8      | 30 from wave 12   |
| Warhead speed (px per second) | `min(140, 40 + 7 × (L - 1))`                   | 40     | 140 from wave 16  |
| Time between launches (s)     | `max(0.45, 1.6 - 0.1 × (L - 1))`, ±30 % random | 1.6    | 0.45 from wave 13 |
| Ammo                          | warheads in the wave + 12                      | 20     | 42                |
| Score multiplier `m`          | `min(6, ceil(L / 2))`                          | ×1     | ×6 from wave 11   |

These are game-jam starting values and can be tuned in step 4; the table is the only place to change them.

### Rules

- **Start.** `ready` shows the title `SKYGUARD`, the controls and "SPACE or TAP to start". Space, Enter, or a tap or click on the canvas, starts the run: `score = 0`, six standing cities, `lives = 6`, `level = 1`, and the first wave starts.
- **Wave start.** `ammo`, `toSpawn` and the speeds are set from the table. `WAVE n` shows in the sky for 1.2 s (`timer`), and the first launch happens when it ends. Shots, blasts and warheads are empty. The crosshair keeps its position.
- **Launching warheads.** While `toSpawn > 0`, every launch interval one warhead starts at a random x from 20 to 780 at y = 30 and flies in a straight line, at the wave speed, to a point on the ground at the centre of a random standing city ±16 px. When it is launched, `toSpawn` drops by 1.
- **Aiming.** While `playing`, a held arrow moves the crosshair at `CROSS_SPEED`; two arrows at once move it diagonally at the same speed (the vector is normalised). It is clamped to its zone.
- **Firing.** Space (a `keydown` that is not `e.repeat`) fires when `state === 'playing'`, `ammo > 0` and fewer than `MAX_SHOTS` interceptors fly. The interceptor leaves `(BASE_X, BASE_Y)` towards the crosshair position at the moment of the shot, at `SHOT_SPEED`, and `ammo` drops by 1. Its target is marked with a small X. Holding Space does not fire again. A shot that is not allowed does nothing.
- **Bursts.** An interceptor that reaches its target is removed and starts a blast there. The blast radius grows from 0 to `BLAST_R` in `BLAST_GROW`, stays for `BLAST_HOLD` and shrinks to 0 in `BLAST_FADE` (1 s in total), then the blast is removed.
- **Hits.** Every frame, a warhead whose head is within the current radius of any blast is destroyed and adds `25 × m`. A destroyed warhead leaves a short flash, but it does not start a blast of its own (no chain reaction).
- **Impact.** A warhead whose head reaches `GROUND` is removed and leaves a ground flash. If a standing city is within `CITY_HALF` of the impact, that city falls: `cities[i] = false`, `lives` drops by 1 and the scenery is repainted with its ruins. An impact on a ruin or on bare ground changes nothing else.
- **Wave clear.** When `toSpawn === 0` and there are no warheads, shots or blasts left, and `lives > 0`, the state becomes `waveclear` for 2.5 s (`timer`). The bonus is added at once: `bonus.cities = lives × 100 × m` and `bonus.ammo = ammo × 5 × m`. The screen shows `WAVE n CLEAR` and both lines. Then `level++` and the next wave starts in `playing`.
- **Ending.** When `lives` reaches 0, `state = 'gameover'` at once: warheads, shots and blasts stop where they are, and the end screen shows `GAME OVER`, the score, the wave reached and "SPACE to play again". For `RESTART_LOCK` seconds no key or tap restarts. After it, Space, Enter, or a tap or click resets every global and starts wave 1 in `playing`. The game is endless: losing the last city is the only way a run ends, and there is no win.
- **Pausing.** P (`KeyP`) switches between `playing` and `paused` and shows `PAUSED`. It is ignored in every other state. In `paused` nothing moves and no other input counts. The game does not pause on `blur`, so there is no conflict with the host pause.
- **Tap or click.** The canvas has `touch-action: none` and listens to `pointerdown` (touch, pen and mouse alike). The point is converted to canvas pixels with `(e.clientX - rect.left) × 800 / rect.width` and `(e.clientY - rect.top) × 600 / rect.height`, from `canvas.getBoundingClientRect()`. In `playing`, it moves the crosshair to that point (clamped to its zone) and then fires with the same rules as Space. In `ready`, and in `gameover` after the lock, it starts a run. In other states it does nothing. The `pointerdown` and `touchmove` defaults are prevented so the host page does not scroll or zoom.
- **Keys.** The `keydown` handler calls `preventDefault()` for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` and `Space`, always, whatever the state. It does not call it for `Enter` or `KeyP`. `keyup` clears the held key.
- **Time.** All motion and timers advance by the delta between two loop frames from `performance.now()`, capped at 50 ms, so the host pause freezes them and a long frame does not teleport a warhead.
- **HUD.** Drawn on the canvas in the HUD band: `SCORE` with the score on the left, `WAVE n` in the centre, `AMMO n` and `×m` on the right. The standing cities on the ground are the life count. All text is in English, and `lang="en"`.

Score bound: a wave holds at most 30 warheads, 6 cities and 42 interceptors, so at the top multiplier (×6) it is worth at most 30 × 150 + 6 × 600 + 42 × 30 = 9,360 points. Reaching 9,999,999 would need more than 1,000 waves. Because the game is endless, every addition still goes through `addScore(n)`, which sets `score = Math.min(9999999, score + n)`. Every value is a whole number, so the score is always an integer.

Vector look (stroked lines only, no sprites, no filled shapes but the background):

- **Background.** A solid dark void, `#05060d`, with no starfield.
- **Cities.** Cyan skyline outlines of 4 to 5 towers each, all slightly different; a fallen city is a low broken magenta zigzag.
- **Ground and launcher.** A cyan ground line and a trapezoid mound with a short turret line that points at the crosshair.
- **Warheads.** A thin magenta line from the start point to the head (one `moveTo` and one `lineTo`), with a small bright cross at the head.
- **Interceptors and blasts.** Yellow lines from the launcher to the interceptor, a yellow X at each target, and blasts as two concentric yellow rings that fade as they shrink.
- **Crosshair.** A yellow circle of 12 px with four short ticks.
- **Glow.** A second, wider stroke under the main one at low alpha (`lineWidth` 6, `globalAlpha` 0.25). No `shadowBlur` in the frame loop.
- **Performance (SPEC 14).** The ground, the launcher mound and the cities are painted into an offscreen canvas, once at a run start and again only when a city falls, and copied each frame with `drawImage`. Font strings and colors are constants built once, not inside the loop. Dead shots, blasts and warheads are removed from their arrays so nothing grows over a long run.
- **Branding.** No text, comment, tag or file name in the game or its catalog entry says "Missile Command".

Bridge reader (`public/games/bridge.js`). The only ending is `gameover`, and `over` turns false again when a new run starts, so each run is saved on its own:

```js
skyguard: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
```

The bridge's `/* global … */` comment does not change: `score`, `lives`, `level` and `state` are already in it.

fitToFrame (`game.js`):

- It sets `zoom` on the page wrapper to `Math.min(1, innerWidth / 800, innerHeight / 600)`, measured from the canvas.
- It runs on load and on `resize`, and returns early when `innerWidth` or `innerHeight` is 0.
- The tap mapping reads `getBoundingClientRect()` on every `pointerdown`, so it follows the current zoom.

Migration (`supabase/migrations/<version>_add_skyguard_game.sql`). Keep the tuple on one line, because `gamesAfterMigrations` in `lib/leaderboard.test.ts` parses it. No policy or grant changes are needed:

```sql
insert into public.games (id, title, category, accent)
values ('skyguard', 'Skyguard', 'Shooter', 'yellow');
```

No earlier migration ever inserted or deleted a `skyguard` row, so this insert does not conflict.

Cover art (`app/globals.css`, `.av-cover-skyguard` and `::after`, no image file):

- A dark gradient background from deep navy at the top to `var(--void)` at the bottom.
- Three thin diagonal `var(--magenta)` trails falling from the top edge, made with narrow `linear-gradient` layers at different angles and `background-position`.
- A `var(--yellow)` blast ring where one trail ends, made with a `radial-gradient` that is transparent inside and outside a thin band, and a small yellow crosshair ring beside it.
- A row of low `var(--cyan)` skyline blocks along the bottom edge, with a gap in the middle for the launcher.
- A `drop-shadow` glow in yellow.
- It renders at desktop and at 375 px.

Conventions:

- The id is lowercase `skyguard` in the route, `av-cover-skyguard`, the bridge key and `arcade-vault:scores:skyguard`.
- `score` is an integer from 0 to 9,999,999. `over` is true only at `gameover`, which is the only way a run ends.
- `GAMES` order is `asteroids`, `drop`, `brick-buster`, `snake`, `froggy`, `skyguard`, so Asteroids stays the first landing tile and the default Hall of Fame tab.
- Pause: P is the in-game pause and the bridge pause freezes the loop and every timer. The game does not pause on `blur`.

File layout:

```
public/games/skyguard/index.html                      new, loads ../bridge.js (data-game="skyguard"), game.js
public/games/skyguard/game.js                         new
public/games/bridge.js                                adds readers["skyguard"]
lib/games.ts                                          adds the entry after froggy, updates the comment above GAMES
app/globals.css                                       adds av-cover-skyguard
supabase/migrations/<version>_add_skyguard_game.sql   inserts the games row (new)
references/implemented-games.md                       adds the skyguard row
CLAUDE.md                                             documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `list_migrations` and `list_tables`, plus `npm test` and `npm run build` on the clean tree. Check that `public/games/skyguard/` does not exist. Manual test: there are seven migrations, `public.games` has `asteroids`, `drop`, `brick-buster`, `snake` and `froggy`, and both commands pass. If not, stop and report.
2. **Folder, loop and scenery.** Create `public/games/skyguard/` with `index.html` (bridge tag, 800×600 canvas, `lang="en"`) and `game.js` with the globals, the `requestAnimationFrame` loop with the capped delta, the offscreen scenery (ground, launcher, six cities), the HUD and the title screen. Manual test: open `/games/skyguard/index.html` directly, and the title screen shows over the ground, the launcher and six distinct cyan cities, drawn in lines only.
3. **Crosshair, keys and firing.** Add the held-key crosshair, the `preventDefault` on the keys, the start key, the interceptors, the target X and the blasts. Manual test: Space starts, the arrows move the crosshair smoothly and stop at the edges of its zone, a diagonal is not faster, each Space press fires one interceptor that bursts at the marked spot, a fourth shot in flight is refused, holding Space fires once, and the page does not scroll.
4. **Warheads, hits and waves.** Add the launches, the wave table, the blast hits, the impacts, the fallen cities, the wave banner, the wave clear and the bonus. Manual test: wave 1 launches 8 warheads with 20 ammo; a warhead caught in a blast adds 25 and leaves no blast; a warhead that lands on a city ruins it and `lives` drops by 1; the wave clear screen adds `lives × 100 × m` and `ammo × 5 × m`; wave 2 has 10 faster warheads. Tune the table by play if a wave is impossible or trivial.
5. **Ending, restart and pause.** Add the end screen, the restart lock, the reset and the P pause. Manual test: when the sixth city falls the game stops on `GAME OVER` with the score and the wave; Space pressed during the first 0.8 s does nothing; Space or Enter after it starts wave 1 with score 0 and six cities; P pauses and resumes during play and does nothing on other screens.
6. **Tap and click.** Add the `pointerdown` handler with `touch-action: none`. Manual test: with the mouse, and with touch emulation at 375 px, a tap on the title screen starts, a tap while playing moves the crosshair under the finger and fires there, a tap on the end screen restarts after the lock, and the page behind does not scroll.
7. **Fit to the frame.** Add `fitToFrame()`. Manual test, in `/game/skyguard/play` at 1530×772 and at 375×812: the whole canvas is visible with no scrollbar in the iframe, a tap still lands under the finger at the reduced zoom, and opening the file directly in a large window keeps it at scale 1.
8. **Bridge reader.** Add `readers["skyguard"]`. Manual test: in the host console, `message` events with `game: "skyguard"` carry a changing `score`, `lives` dropping from 6 as cities fall, a `level` that rises after each wave, and `over: true` at game over.
9. **Cover art.** Add `av-cover-skyguard`. Manual test: the cover renders on a temporary card at desktop and at 375 px, and it shows in `/library` after step 10.
10. **Catalog entry.** Add the entry to `lib/games.ts` after `froggy` and update the comment above `GAMES`. Manual test: `/library` shows six cards, `/game/skyguard` shows the detail with the `KEYBOARD / TOUCH` tag, the `Shooter` filter lists Asteroids and Skyguard, and on a touch device the pad shows the four arrows, `A` and `B`.
11. **Migration.** Write the SQL file and apply it with `apply_migration`. Rename the file to the version `list_migrations` reports, then run `get_advisors` (security). Manual test: `public.games` has six rows, including `skyguard`, and there is no new advisor warning about `games` or `scores`.
12. **Tests.** Run `npm test`. Manual test: `lib/games.test.ts` (file, bridge tag, reader, cover, touch codes in `game.js` and in the allowlist) and `lib/leaderboard.test.ts` (`games` after the migrations equals `GAMES`) pass with `skyguard`.
13. **Play and rank.** In `/game/skyguard/play`, finish a run, type a name and save. Manual test:
    - `SCORE SAVED` shows;
    - the row is in `public.scores` with `game_id = 'skyguard'` (check with `execute_sql`);
    - `/hall-of-fame` shows it under `Skyguard` and not under another game;
    - host Pause freezes the warheads and the wave banner, and Resume continues them.

    Delete the test row afterwards.

14. **Docs.** Update `references/implemented-games.md` and `CLAUDE.md`:
    - the `games.ts` bullet: six games, and SPEC GJ skyguard-01 added Skyguard as a new game, not from the archive;
    - the `supabase/migrations/` bullet: eight migrations, `add_skyguard_game`;
    - the `public/games/<id>/` bullet: `skyguard` is an 800×600 game with `fitToFrame()`, vector lines only, a P pause and tap or click to fire on the canvas.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `public/games/skyguard/` contains exactly `index.html` and `game.js`.
- [ ] `public/games/skyguard/index.html` has `lang="en"` and loads `../bridge.js` with `data-game="skyguard"` before `game.js`.
- [ ] `game.js` uses no `localStorage`, no `setInterval` for the game loop, no network calls, no dependencies, no image or audio file and no `shadowBlur`.
- [ ] A run starts with score 0, six standing cities, `lives` 6, `level` 1 and 20 ammo.
- [ ] The arrows move the crosshair only inside x 10 to 790 and y 40 to 500, and a diagonal moves no faster than a single arrow.
- [ ] Each Space press fires one interceptor and costs one ammo, at most 3 fly at once, and no shot leaves at 0 ammo.
- [ ] An interceptor bursts at the spot the crosshair marked when it was fired, and the blast lasts 1 s with a top radius of 44 px.
- [ ] A warhead inside a blast is destroyed and adds exactly `25 × m`, and it starts no blast of its own.
- [ ] A warhead that lands within 26 px of a standing city ruins it and lowers `lives` by exactly 1; a landing on a ruin or bare ground changes neither.
- [ ] Wave `L` launches `min(30, 6 + 2 × L)` warheads, and its wave clear adds exactly `lives × 100 × m + ammo × 5 × m` and raises `level` by 1.
- [ ] When the last city falls, `state` is `gameover`, nothing moves, and Space, Enter or a tap restarts only after 0.8 s, with score 0, six cities and level 1.
- [ ] P pauses and resumes during play only, and the game does not pause when the iframe loses focus.
- [ ] A tap or click while playing fires at the tapped spot, a tap starts and restarts the run, and at a zoom below 1 the shot lands under the finger.
- [ ] The score never goes above 9,999,999, because every addition goes through `addScore`.
- [ ] `grep -ri "missile command"` finds nothing in `public/games/skyguard/` or in the `skyguard` entry of `lib/games.ts`.
- [ ] `GAMES` has exactly one entry with `id: "skyguard"`, `src: "/games/skyguard/index.html"`, `aspect: "4 / 3"`, `accent: "yellow"`, `category: "Shooter"`, `difficulty: 3` and the `touch` config above, placed after `froggy`.
- [ ] `/library` lists Skyguard with its rendered cover, and the other five games are unchanged.
- [ ] `/game/skyguard` shows the title, description, controls `Arrows to aim · SPACE to fire · tap or click to fire at a spot · P to pause`, `SHOOTER` and the `KEYBOARD / TOUCH` tag.
- [ ] `/game/skyguard/play` runs the game inside the CRT frame, spends one credit on start and shows `INSERT COIN` at 0 credits.
- [ ] While playing, the arrow keys and Space do not scroll the host page, and a tap on the canvas does not scroll or zoom it.
- [ ] On a touch device, the pad arrows move the crosshair while held, `A` fires and `B` pauses.
- [ ] At 1530×772 and at 375×812 the whole 800×600 canvas is visible inside the frame, and the game document does not overflow.
- [ ] The host receives `state` messages with `game: "skyguard"` carrying `score`, `lives`, `level` and `over`, and `over` is `true` only at game over.
- [ ] Pause and resume from the host freeze and resume the game and its timers through the bridge.
- [ ] `public.games` has the row `('skyguard', 'Skyguard', 'Shooter', 'yellow')`, and `list_migrations` shows the same name as the file in `supabase/migrations/`.
- [ ] A finished run shows `SCORE SAVED`, is stored with `game_id = 'skyguard'` and appears in `/hall-of-fame` under `Skyguard` only.
- [ ] `get_advisors` (security) reports no new warning about `games` or `scores`.
- [ ] `lib/games.test.ts` and `lib/leaderboard.test.ts` pass with `skyguard`.
- [ ] `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts`, `lib/games-archive.ts`, `components/ui/game.tsx`, the bridge `KEYS` table, the other games' folders and the other covers have no edits (`git diff` is empty for them).
- [ ] `references/implemented-games.md` and `CLAUDE.md` document Skyguard, the eight migrations and the `public/games/skyguard/` folder.

---

## Decisions

- **Yes:** a missile-defense shooter: move a crosshair and fire interceptor bursts at falling warheads to protect 6 cities (user decision). **No:** any other genre or a restore of an archived Shooter.
- **Yes:** the id `skyguard`, the title `Skyguard` and the category `Shooter` (user decisions). **No:** the "Missile Command" name or branding anywhere (user decision).
- **Yes:** `lives` = cities left, `level` = wave, `over` when no city is left (user decision). **No:** a win or any other ending, so the game is endless (game-jam decision, from "`over` when no city is left").
- **Yes:** 800×600, `aspect: "4 / 3"`, and vector lines only, with no third-party art (user decisions). The palette (cyan cities, magenta warheads, yellow player side) and the low-alpha double stroke for glow are game-jam decisions. **No:** sprites, fills or `shadowBlur`.
- **Yes:** the arrows move the crosshair, and a tap on the canvas aims and fires (user decision). Space to fire, a mouse click working as a tap, and the tap moving the crosshair to the spot before firing are game-jam decisions. **No:** WASD or a gamepad.
- **Yes:** the accent is `yellow`, following the note "Yellow accent is unused" (user intent). Flagged for review: that premise is out of date, because `froggy` took yellow in SPEC GJ froggy-01; magenta or green would balance the catalog just as well. Changing it means editing the entry, the migration tuple and the cover together.
- **Yes:** one launcher in the centre that cannot be hit, ammo per wave and at most 3 interceptors in flight (game-jam decisions). **No:** three launchers or a launcher that can be destroyed, which would need more keys and a second loss rule.
- **Yes:** the wave table (count, speed, launch interval, ammo, multiplier) and the blast timing (game-jam decisions), tunable in step 4.
- **Yes:** 25 × m per warhead, and a wave bonus of 100 × m per standing city and 5 × m per unused interceptor (game-jam decisions). **No:** chain reactions between blasts.
- **Yes:** warheads aim at standing cities only, chosen at launch (game-jam decision). A city that falls first leaves the next warhead hitting a ruin.
- **Yes:** cities are never rebuilt (game-jam decision). **No:** bonus cities, because the user listed none.
- **Yes:** a P pause and `B` = `KeyP` on the pad (game-jam decisions): `lib/games.test.ts` needs a `B` with a code different from `A`, and pausing is the useful second action. **No:** pausing on `blur`, the cause of the Brick Buster resume issue (SPEC 10).
- **Yes:** a 0.8 s restart lock after game over (game-jam decision), because Space is both fire and restart.
- **Yes:** difficulty 3, `plays: "4.8K"`, the tagline, the description and the tags (game-jam decisions). `KEYBOARD / TOUCH` because the tap is a real control.
- **Yes:** `fitToFrame()` with CSS `zoom`, never above 1, as SPEC 09, SPEC 10 and SPEC 11. **No:** changing `CRTScreen`.
- **Yes:** the leaderboard uses what SPEC 08 built: a `games` row plus the existing player flow. **No:** per-game code in the player or in `lib/leaderboard.ts`.
- **Yes:** the extension (splitting warheads and bombers) is its own spec, SPEC GJ skyguard-02 (game-jam decision).

---

## Risks

| Risk                                                                                                           | Mitigation                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader names a global that does not exist or is out of scope, and the bridge reports nothing.              | The globals follow the contract names. `report()` swallows the error, so step 8 checks the messages by hand; `lib/games.test.ts` checks the reader exists.              |
| `over` is not true for every way the run ends, so the score is never saved.                                    | The only ending is `gameover`, reached when the last city falls. Step 13 plays a full run to the end.                                                                   |
| The score is not an integer or is above 9,999,999, so `submitScore` rejects it.                                | Every value is a whole number, and `addScore` clamps at 9,999,999 because the game is endless (see the score bound above).                                              |
| The game has its own pause and conflicts with the host pause.                                                  | The P pause is a game state, and the host pause freezes `performance.now()` under it, so either order resumes cleanly. No pause on `blur`. Step 5 and step 13 check it. |
| The `games` row is missing, so the foreign key rejects every score.                                            | Step 11, and the seed-vs-`GAMES` test in `lib/leaderboard.test.ts`.                                                                                                     |
| Under CSS `zoom`, `clientX` and `getBoundingClientRect()` disagree in some browsers, so a tap misses its spot. | The mapping divides by the rect size, not by the zoom value. Step 7 taps at a zoom below 1; a wrong mapping is fixed in `game.js` only.                                 |
| A tap on the canvas scrolls or zooms the host page on a phone.                                                 | `touch-action: none` and `preventDefault` on `pointerdown` and `touchmove`. Step 6 checks it with touch emulation; a real phone test is left to the user.               |
| Mashing Space at the end restarts at once and skips the end screen.                                            | The 0.8 s restart lock.                                                                                                                                                 |
| The wave numbers make the game impossible or trivial.                                                          | They are game-jam starting values. Step 4 tunes them by play; the table is the only place to change.                                                                    |
| Many trails and rings make the frame slow without a GPU.                                                       | No `shadowBlur`, cached scenery, at most 30 warheads, 3 shots and their blasts at once. The `game-performance-booster` agent can measure it later.                      |
| The look or the text recalls the arcade classic too closely.                                                   | Own name, own palette and one central launcher; the `grep` criterion keeps the branding out. The user reviews the look in step 13.                                      |
| Yellow repeats the accent of `froggy`, against the reason the note gave.                                       | Flagged in Decisions for review before the spec is approved.                                                                                                            |
| Space on the end screen restarts inside the game without the host "Play again", so it does not spend a credit. | Same behavior as Asteroids, Snake and Froggy. Any credit change is a separate spec.                                                                                     |
| `zoom` is not supported by Firefox before 126, and the game stays cut at 375 px.                               | Accepted, as in SPEC 09, SPEC 10 and SPEC 11.                                                                                                                           |

---

## What is **not** in this spec

- Splitting warheads, bombers or any other threat (SPEC GJ skyguard-02).
- Sound, chain reactions, rebuilt or bonus cities, more launchers, WASD or a gamepad.
- Skins and the light/dark toggle.
- Changes to the player, the leaderboard code, scores, credits, the bridge protocol, the `KEYS` allowlist or the CRT frame.
- Auth or protection against forged scores.
- Any other game.

Each one of those, if it lands, goes in its own spec.
