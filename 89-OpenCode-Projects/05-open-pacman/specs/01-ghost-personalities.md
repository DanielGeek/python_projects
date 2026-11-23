# SPEC 01 — Four ghosts with classic personalities

> **Status:** Approved
> **Depends on:** none
> **Date:** 2026-11-23
> **Objective:** Replace the two placeholder ghosts with the four classic arcade ghosts, each with its own targeting rule — one an aggressive direct chaser — plus scatter/chase waves and a staggered pen release.

## Scope

**In:**

- Four ghosts, one per classic chase rule:
  - `chaser` (red, Blinky): targets Pac-Man's current tile. This is the aggressive one.
  - `ambusher` (pink, Pinky): targets the tile 4 cells ahead of Pac-Man's facing direction.
  - `flanker` (cyan, Inky): doubles the vector from the `chaser` to the tile 2 cells ahead of Pac-Man.
  - `shy` (orange, Clyde): targets Pac-Man when 8 or more tiles away (straight-line), else its own corner.
- Scatter/chase waves: 7 s scatter, 20 s chase, repeating. Every mode switch makes all released ghosts reverse direction.
- Per-ghost scatter corners: `chaser` top-right, `ambusher` top-left, `flanker` bottom-right, `shy` bottom-left.
- Time-based staggered pen release: `chaser` 0 s, `ambusher` 2 s, `flanker` 4 s, `shy` 6 s. Unreleased ghosts wait in place.
- The exit is scripted: a released ghost walks straight up through the door; personality AI starts once outside the pen.
- After Pac-Man loses a life, all four return to the pen, the wave clock resets, and the staggered release repeats.
- One color per ghost in `render.js` so the player can tell them apart.

**Out of scope (for future specs):**

- Frightened mode: power pellets, blue ghosts, eating ghosts, pen respawn after being eaten.
- Cruise Elroy (the chaser's late-board speed-up).
- Per-ghost speed differences and the tunnel slowdown.
- Dot-counter-based release (time-based is enough here).
- Fruits or bonus items.

## Data model

`maze.js` replaces the two-entry `GHOST_STARTS` and adds corners and release times:

```js
const GHOST_STARTS = [
  { x: 13, y: 13, kind: 'chaser' },    // Blinky — leaves first
  { x: 14, y: 13, kind: 'ambusher' },  // Pinky
  { x: 13, y: 14, kind: 'flanker' },   // Inky
  { x: 14, y: 14, kind: 'shy' },       // Clyde — leaves last
];
const GHOST_CORNERS = {
  chaser:   { x: 26, y: 1 },  // top-right
  ambusher: { x: 1,  y: 1 },  // top-left
  flanker:  { x: 26, y: 29 }, // bottom-right
  shy:      { x: 1,  y: 29 }, // bottom-left
};
const GHOST_RELEASE_SECONDS = { chaser: 0, ambusher: 2, flanker: 4, shy: 6 };
```

`game.js` extends the game object and each ghost. `update()` advances a gameplay clock by 1/60 per tick:

```js
// createGame() additions
{
  clock: 0,             // gameplay seconds; drives waves and release
  ghostMode: 'scatter', // 'scatter' | 'chase'
  modeSeconds: 0,       // time spent in the current mode
}
// each ghost
{ kind: 'chaser', released: false }
```

`render.js` swaps the index-based color array for a kind-based map:

```js
const GHOST_COLORS = {
  chaser:   '#ff0000', // Blinky
  ambusher: '#ffb8ff', // Pinky
  flanker:  '#00ffff', // Inky
  shy:      '#ffb852', // Clyde
};
```

Coordinates: cells with origin top-left, as today.

## Implementation plan

1. `maze.js`: four starts in a 2×2 inside the pen, `GHOST_CORNERS`, `GHOST_RELEASE_SECONDS`, exported on `window`. Manual test: the game loads with four ghosts stacked in the pen and no console errors.
2. `render.js`: kind-based color map. Manual test: red, pink, cyan and orange are distinguishable in the pen.
3. `game.js`: gameplay clock plus release logic. Unreleased ghosts do not move; a released ghost walks straight up through the door and joins normal movement at row 11. Manual test: exits at ~0/2/4/6 s; ghosts outside wander with the current random rule.
4. `game.js`: scatter/chase waves. `modeSeconds` toggles `ghostMode` every 7/20 s; each switch reverses every released ghost. Manual test: periodic retreat to corners, then a coordinated attack; the group U-turn on each switch is visible.
5. `game.js`: per-kind target tiles in `decideGhost` (chase uses the four rules above; scatter targets `GHOST_CORNERS[ kind ]`), keeping the current greedy shortest-distance choice. Manual test: each ghost behaves differently; the chaser is relentless.
6. `game.js`: losing a life returns all ghosts to the pen as unreleased and resets the wave clock. Manual test: the staggered release repeats after a death; win, lose and restart still work.

## Acceptance criteria

- [x] Four ghosts appear at start, each in its own color: red, pink, cyan, orange.
- [x] Only the chaser leaves immediately; the others come out at about 2 s, 4 s and 6 s.
- [x] Ghosts still inside the pen do not move.
- [x] During the first 7 seconds the released ghosts head to their corners; at 7 s they all U-turn and attack for 20 s; the wave repeats.
- [x] In chase mode the chaser moves toward Pac-Man's current tile at every intersection.
- [x] The ambusher cuts in front of Pac-Man's direction instead of toward his current tile.
- [x] The flanker approaches from the opposite side of the chaser when both are active.
- [x] The shy one heads to its bottom-left corner whenever it is within 8 tiles of Pac-Man.
- [ ] Losing a life sends all four back to the pen and the staggered release happens again.
- [ ] Tunnel wrap, win, lose and restart still work; the console shows no errors.

## Decisions

- **Yes:** classic arcade personalities (Blinky/Pinky/Inky/Clyde rules). Well documented and simple to implement.
- **No:** frightened mode in this spec. It needs a new tile type, edible ghosts and pen respawn — its own spec.
- **Yes:** descriptive kind names (`chaser`, `ambusher`, `flanker`, `shy`), per the repo's self-documenting style. Classic names stay in comments and colors.
- **Yes:** repeating 7/20 s waves. **No:** the full level-1 arcade table (7/20/7/20/5/20/5/forever) — the repeating pair keeps the feel with less state.
- **Yes:** time-based release. **No:** the arcade's dot counters — extra state for no visible gain here.
- **Yes:** reset to pen and re-release on death, consistent with the release strategy.
- **No:** Cruise Elroy, per-ghost speeds and tunnel slowdown. Uniform speed keeps this spec about personalities.
- **No:** the 1980 up-direction overflow bug for the ambusher and flanker. We reproduce the intended behavior.
- **Yes:** spec written in English, following the repo convention for project artifacts.
- Ghost logic stays in `game.js` (the rules module); no new file.

## Risks

| Risk | Mitigation |
| --- | --- |
| Greedy targeting can make a ghost orbit near its corner. | Same as the arcade: corners are targets, not destinations — circling them is expected. |
| The flanker needs the chaser's position; while the chaser is unreleased its target sits inside the pen. | Harmless: the greedy choice still returns a valid direction and self-corrects once the chaser is out. |
| The frame-based clock drifts if the browser throttles rAF. | Times are approximate by design ("~2 s"); exactness is not required. |

## What is **not** in this spec

- Frightened mode, power pellets, edible ghosts.
- Cruise Elroy and any speed differences.
- Fruits or difficulty progression.

Each one of those, if it lands, goes in its own spec.
