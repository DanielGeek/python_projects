# SPEC 06 — Pause and resume

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-10-14
> **Objective:** Let the player pause a running game with `P` or `Esc`, showing a "Paused" overlay with everything frozen, and resume it with the same keys, also pausing automatically when the window loses focus.

---

## Scope

**In:**

- A new `game.status` value `'paused'`.
- Pressing `P` or `Esc` while the status is `playing` changes it to `paused`. Pressing either key while `paused` changes it back to `playing`.
- While `paused`: the ball, the bricks and the explosion timers do not advance, and the paddle does not move (neither with the keys nor with the mouse).
- A dim overlay with the text "Paused" and the hint "Press P or Esc to resume", drawn over the frozen field in the same style as the win and Game Over overlays.
- Resuming is instant, only by `P` or `Esc`. Space and click do nothing while `paused`.
- The pause keys do nothing in `ready`, `won` and `lost`.
- When the window loses focus (`blur`) while `playing`, the game pauses. It does not resume by itself on focus.
- Holding a pause key toggles only once (`e.repeat` is ignored).
- `M` keeps toggling mute while `paused`, and the SPEC 05 indicator, if present, keeps following it.

**Out of scope (for future specs):**

- Countdown (3-2-1) or any delay when resuming.
- Pause in the `ready` state, and a pause menu with options (resume, restart, quit).
- Pause button on screen or any mouse control for pause.
- Pausing a sound that is already playing (short sounds finish by themselves).
- Auto-resume on focus, and pausing on tab visibility changes beyond the `blur` event.
- Persisting the paused state.
- Build system, framework or automated tests.

---

## Data model

```js
// game.js
game.status = 'ready'; // 'ready' | 'playing' | 'paused' | 'won' | 'lost'

const PAUSE_KEYS = [ 'KeyP', 'Escape' ];

function togglePause() { /* playing -> paused, paused -> playing, any other status: do nothing */ }
```

Conventions:

- `paused` can only be entered from `playing`, so resuming always returns to `playing`. No "previous status" field is needed.
- `togglePause()` is the only code that switches between `playing` and `paused`, called from the `keydown` listener and, in one direction (pause only), from the `blur` listener.
- `update( dt )` returns right after the status check when `paused`, so `updatePaddle`, `updateExplosions` and `moveBall` do not run. The `requestAnimationFrame` loop keeps running and `draw()` still renders.
- `dt` is already capped at 0.05 s in `frame()`, so resuming causes no time jump.
- While `paused`, the `mousemove` handler and the arrow/`A`/`D` key handlers do not change the paddle or the `keys` flags. Pausing clears `keys.left` and `keys.right`, so no direction stays stuck.
- `handleAction()` (Space and click) already ignores any status other than `ready`, `won` and `lost`, so it needs no change for `paused`.
- No new asset and no new file. The overlay text is drawn on the canvas.

---

## Implementation plan

1. Add `PAUSE_KEYS` and `togglePause()` to `game.js`, and handle them in the `keydown` listener (ignore `e.repeat`). `togglePause()` also clears `keys.left` and `keys.right` when pausing. Make `update( dt )` skip all updates while `paused`. Manual test: `P` freezes the ball, `Esc` or `P` resumes it, and in `ready`, `won` and `lost` the keys do nothing. There is no overlay yet.
2. Freeze the paddle input while `paused`: the `mousemove` handler and the direction key handling in `keydown` return early when the status is `paused`. Manual test: moving the mouse or pressing the arrows during pause does not move the paddle, and holding an arrow through pause and resume leaves no stuck direction.
3. Draw the "Paused" overlay in `draw()` when the status is `paused`: the same dim layer as `drawOverlay()`, with "Paused" and "Press P or Esc to resume". Manual test: the overlay appears on pause and disappears on resume, the bricks and ball stay visible under it, and the text is centred.
4. In the `blur` listener, call `togglePause()` only if the status is `playing`, after the existing key reset. Manual test: switching to another window pauses a running game, and coming back leaves it paused until `P` or `Esc`.
5. Manual test of the full flow: pause during an explosion and confirm it resumes from the same frame; pause and press `M` and confirm the mute toggles; pause and press Space and click and confirm nothing happens; lose a life, restart from an overlay and pause again.

---

## Acceptance criteria

- [x] Pressing `P` while playing pauses the game; pressing `P` again resumes it.
- [x] Pressing `Esc` while playing pauses the game; pressing `Esc` again resumes it.
- [x] Holding `P` or `Esc` toggles the pause only once.
- [x] While paused, the ball position, the brick state, the score and the lives do not change.
- [ ] A brick explosion in progress freezes while paused and continues from the same frame on resume.
- [x] While paused, mouse movement and arrow keys do not move the paddle; after resume the paddle is where it was.
- [ ] After resuming, the ball keeps its speed and direction, with no visible jump.
- [x] The "Paused" overlay with "Press P or Esc to resume" shows while paused and is gone after resume.
- [ ] Space and click do nothing while paused (no launch, no restart).
- [x] `P` and `Esc` do nothing in `ready`, `won` and `lost`.
- [ ] Switching to another window or tab while playing pauses the game; coming back does not resume it by itself.
- [ ] `M` still toggles mute while paused, and no sound plays from game events while paused.
- [ ] Ball physics, scoring, lives, explosions, sound and the HUD behave exactly as in SPEC 03 when the game is not paused.
- [ ] The browser console shows no errors.

---

## Decisions

- **Yes:** `P` and `Esc` both toggle pause. User decision; `P` is the arcade convention and `Esc` is the usual habit.
- **Yes:** a dim "Paused" overlay with a resume hint. User decision; it matches the existing overlays and makes the frozen state clear.
- **Yes:** resume only with the pause keys, instantly. User decision; an accidental click or Space can't launch or restart the game.
- **Yes:** auto-pause on window `blur` while playing, manual resume. User decision; the ball can't be lost while the player is away.
- **Yes:** pause only from `playing`. User decision; `ready` and the overlays have nothing moving, so pausing there is pointless.
- **Yes:** paddle fully frozen while paused. User decision; no repositioning for free and no jump on resume.
- **Yes:** `M` keeps working while paused, with no new sounds from the game. User decision; mute is independent of game flow.
- **Yes:** a new `'paused'` status in `game.status`, with no "previous status" field. Pause is only entered from `playing`, so the return state is always known.
- **Yes:** keep the animation loop running while paused and skip updates. The overlay still draws and `dt` is already capped, so no time-stamp handling is needed.
- **No:** countdown on resume, pause menu, on-screen pause button. Each belongs in its own spec.
- **No:** pausing sounds already playing. They last under a second and pausing and resuming audio adds state for little benefit.
- **No:** listening to `visibilitychange`. `blur` covers window and tab switches in the same listener that already handles stuck keys.

---

## Risks

| Risk                                                                   | Mitigation                                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| An arrow key held at pause stays "pressed" and the paddle drifts on resume | `togglePause()` clears `keys.left` and `keys.right`; direction keys are ignored while paused |
| `blur` fires when the game is `ready` or over and pauses it wrongly    | The `blur` handler pauses only when the status is `playing`                             |
| Level changes from SPEC 04 reset the status while paused               | `paused` is only reachable from `playing`, and `loadLevel` runs inside `update`, which does not run while paused |
| `Esc` triggers the browser's own behaviour (exits full screen)         | Accepted: it exits full screen but still pauses the game; no `preventDefault` is needed  |

---

## What is **not** in this spec

- Countdown or delay on resume.
- Pause from `ready`, or a pause menu.
- On-screen pause button or mouse control for pause.
- Pausing sounds that are already playing.
- Auto-resume on focus or `visibilitychange` handling.
- Persistence of the paused state.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
