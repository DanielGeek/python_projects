# SPEC 02 — Power pellets and frightened ghosts

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-23
> **Objective:** Add four corner power pellets that frighten the ghosts for six seconds — they flee from Pac-Man, become edible, and eaten ones travel back to the pen as eyes before respawning.

## Scope

**In:**

- New tile `4` (energizer) in `maze.js`, written as `'o'`: four pellets at `(1,3)`, `(26,3)`, `(1,23)`, `(26,23)`.
- Eating an energizer: +50 points, and it counts in `dotsRemaining`, so winning still requires clearing the whole board.
- Frightened mode: 6 s countdown, refreshed to 6 s by eating another energizer while active.
- Every ghost turns frightened — pen ghosts included (cosmetic there) — and every released, not-eaten ghost reverses direction when the fright starts, mirroring the wave-switch U-turn.
- Frightened movement: flee Pac-Man. At each intersection a frightened ghost picks the valid non-reversing direction that maximizes Manhattan distance to Pac-Man — the greedy mirror of `decideGhost`.
- The scatter/chase wave clock pauses while frightened, so a fright does not consume the 7 s scatter phase.
- Eating a frightened ghost: score doubles per additional ghost in the same fright — 200, 400, 800, 1600. A new pellet resets the chain.
- An eaten ghost becomes eyes: no body, no interaction with Pac-Man, twice ghost speed. Eyes navigate to the door-top tile above their start column (`(13,11)` / `(14,11)`), descend scripted past the door, and at their start cell become a normal unreleased ghost — which immediately re-releases (its scheduled time already passed) and exits again.
- `resetRound` clears the fright (timer, chain, eaten ghosts) so a new life starts clean.
- Rendering: energizers as larger blinking pellets; frightened ghosts blue with white eyes, flashing white during the last 2 s; eaten ghosts drawn as eyes only.

**Out of scope (for future specs):**

- Per-level fright durations (no level system exists yet).
- Fruits or bonus items.
- On-canvas score popups when eating a ghost (the HUD total is enough).
- Cruise Elroy, per-ghost speeds, tunnel slowdown — still out, as in SPEC 01.

## Data model

`maze.js` — new tile type and the four energizer cells:

```js
// parseTile addition
if ( ch === 'o' ) return 4; // energizer (power pellet)

// rows 3 and 23, first and last corridor cell marked 'o'
'#o####.#####.##.#####.####o#', // 3
'#o..##................##..o#', // 23
```

`game.js` — new constants and state:

```js
const FRIGHT_SECONDS = 6;       // refreshed by eating another energizer
const FRIGHT_FLASH_SECONDS = 2; // white flashing before the fright ends
const EYES_SPEED = GHOST_SPEED * 2;

// createGame() additions
frightSeconds: 0, // > 0 while frightened; counts down each tick
frightChain: 0,   // ghosts eaten during the current fright

// each ghost
eaten: false,     // true while returning to the pen as eyes
```

`render.js` — no new structures; a frightened/eaten branch next to `GHOST_COLORS`.

Coordinates: cells with origin top-left, as today.

## Implementation plan

1. `maze.js`: `'o'` → tile `4` with the four corner cells; `game.js`: eat tile `4` (+50, decrement `dotsRemaining`) and count it in `createGame`. Manual test: eating a corner pellet scores 50; the board cannot be won with pellets left.
2. `render.js`: draw tile `4` as a pellet ~2.5× the dot radius, blinking with the frame. Manual test: four visibly bigger, blinking pellets near the corners.
3. `game.js`: fright lifecycle. Eating an energizer sets `frightSeconds` (refresh on re-eat) and reverses every released ghost; `update` counts it down and skips `updateWaves` while active; `ghostTarget` returns the flee target while active. Manual test: pellet → all four U-turn and stay away from Pac-Man for ~6 s, then resume their normal waves.
4. `game.js`: eating ghosts. The collision loop becomes three cases — frightened and not eaten → `eaten = true`, score `200 * 2 ** frightChain++`; eaten → ignored; otherwise → death as today. Eyes target their column's door-top tile, descend scripted, and revert to a normal unreleased ghost at their start cell. Manual test: eat one for 200, a second in the same fright for 400; the eaten one glides home, reappears in the pen and leaves again.
5. `render.js`: ghost states. Frightened: blue body, white eyes, flashing white in the final `FRIGHT_FLASH_SECONDS`; eaten: eyes only. Manual test: blue flee, white flash, then normal colors; eyes have no body.
6. `game.js`: `resetRound` resets `frightSeconds`, `frightChain` and every `eaten`. Manual test: dying while frightened starts the next round with no fright; tunnel, win, lose and restart still work.

## Acceptance criteria

- [x] Four larger, blinking pellets appear near the corners at start.
- [x] Eating one scores 50 and every released ghost U-turns.
- [x] Frightened ghosts pick directions that take them away from Pac-Man.
- [x] Ghosts flash white in the final ~2 s and revert to normal after ~6 s.
- [x] Eating another pellet mid-fright restarts the 6 s countdown.
- [x] Pac-Man survives touching a frightened ghost.
- [x] Eating ghosts in one fright scores 200, 400, 800, 1600 in order.
- [x] The chain restarts at 200 with each new pellet.
- [x] An eaten ghost renders as eyes only, cannot kill or be re-eaten, and travels back to the pen.
- [x] A returned ghost becomes normal and leaves the pen again.
- [x] Losing a life while frightened starts the next round with no fright active.
- [x] Win still requires every dot and pellet; no console errors.

## Decisions

- **Yes:** four corner energizers at the arcade's level-1 positions. **No:** other counts — four is balanced and recognizable.
- **Yes:** fixed 6 s fright, refreshed by a new pellet. **No:** per-level shrinking durations — there is no level system yet.
- **Yes:** flee-away greedy targeting instead of the arcade's random walk. Deterministic, self-documenting, and it fits the repo's modern-simpler goal.
- **Yes:** eyes return at 2× ghost speed. **No:** normal speed — the respawn would read too slowly.
- **Yes:** respawn reuses the time-based release: a returned ghost becomes unreleased and leaves immediately because its schedule time already passed. **No:** a new respawn timer — zero extra state.
- **Yes:** doubling chain 200→1600, reset per pellet. **No:** flat 200 — the chain rewards clearing several ghosts in one fright.
- **Yes:** the energizer itself scores 50 and counts in `dotsRemaining`. **No:** a separate pellet counter.
- **Yes:** pause the wave clock during fright. **No:** pausing `game.clock` — the staggered release keeps running, which is harmless.
- **Yes:** frightened ghosts keep their normal speed. **No:** the arcade's fright slowdown — one less speed constant.
- **No:** fruits, Cruise Elroy, per-ghost speeds, tunnel slowdown — unchanged from SPEC 01's exclusions.

## Risks

| Risk | Mitigation |
| --- | --- |
| Greedy flee can corner a ghost against Pac-Man. | Intended: being cornered is how it gets eaten; the dead-end 180° fallback from `decideGhost` still applies. |
| Eyes must cross a door that `isWall` blocks for everyone. | Same pattern as SPEC 01's scripted exit: a scripted-entry branch moves eyes down without consulting `canMove`. |
| A respawned ghost re-releases instantly since its schedule time passed. | Intended arcade-like behavior; no extra release state. |
| The frame-based fright clock drifts under rAF throttling. | Times stay approximate by design, as accepted in SPEC 01. |

## What is **not** in this spec

- Per-level fright durations and any difficulty progression.
- Fruits or bonus items.
- Score popups over eaten ghosts.

Each one of those, if it lands, goes in its own spec.
