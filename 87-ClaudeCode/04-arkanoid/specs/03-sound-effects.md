# SPEC 03 — Sound effects

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-14
> **Objective:** Play `ball-bounce.mp3` when the ball bounces off a wall, the ceiling or the paddle, and `break-sound.mp3` when it destroys a brick, with an `M` key to mute all sound.

---

## Scope

**In:**

- Play `assets/sounds/ball-bounce.mp3` on every ball bounce off the left wall, the right wall, the ceiling and the paddle.
- Play `assets/sounds/break-sound.mp3` when the ball destroys a brick. A brick hit plays only the break sound, never the bounce sound.
- Preload both files once at startup, one `Audio` object per sound.
- A repeated sound restarts from the beginning (`currentTime = 0`) instead of stacking.
- Pressing `M` toggles mute for both sounds. Mute is session-only and the game starts unmuted.
- Sound failures (blocked autoplay, missing file) never stop the game or throw to the console.

**Out of scope (for future specs):**

- Background music.
- Sounds for launching the ball, losing a life, winning or Game Over.
- Volume slider, on-screen mute button or any mute indicator in the HUD.
- Persisting the mute state between sessions.
- Overlapping playback of the same sound (cloning `Audio` nodes) or the Web Audio API.
- Build system, framework or automated tests.

---

## Data model

```js
// game.js
const SOUND_BOUNCE = 'assets/sounds/ball-bounce.mp3';
const SOUND_BREAK  = 'assets/sounds/break-sound.mp3';

const sounds = {
  bounce: new Audio( SOUND_BOUNCE ),
  brk:    new Audio( SOUND_BREAK ),
};
let muted = false;

function playSound( sound ) { /* if muted return; sound.currentTime = 0; sound.play().catch( () => {} ); */ }
```

Conventions:

- `muted` is a module-level variable in `game.js`, not part of `game` state, so `resetGame()` does not change it.
- `playSound` is the only place that touches `Audio.play()`.
- Sounds are played from game events inside `stepBall`, `bounceOffPaddle` and `bounceOffBricks`; no other code plays audio.
- Audio files load on first use of the page; the first launch by Space or click is a user gesture, so browser autoplay rules are satisfied.

---

## Implementation plan

1. Add the `sounds` object, the `muted` flag and `playSound()` to `game.js`, with no calls yet. Manual test: the game plays exactly as in SPEC 02 and the console shows no errors.
2. In `stepBall`, call `playSound( sounds.bounce )` in the left/right wall branch and in the ceiling branch. Manual test: every wall and ceiling bounce is audible.
3. In `bounceOffPaddle`, call `playSound( sounds.bounce )` once the overlap is confirmed. Manual test: every paddle bounce is audible.
4. In `bounceOffBricks`, call `playSound( sounds.brk )` where the brick is destroyed, and no bounce sound there. Manual test: each brick hit plays only the break sound.
5. Add the `M` key handler in the existing `keydown` listener: ignore `e.repeat`, toggle `muted`, and stop any sound currently playing when muting. Manual test: `M` silences and restores both sounds, also during `ready` and overlay states.
6. Manual test of the full flow: play a full game, restart from an overlay and confirm sounds still play; confirm rapid brick hits restart the sound without errors; confirm the network tab shows exactly two requests to `assets/sounds/`.

---

## Acceptance criteria

- [x] A bounce off the left wall, the right wall and the ceiling each play `ball-bounce.mp3`.
- [x] A bounce off the paddle plays `ball-bounce.mp3`.
- [x] Destroying a brick plays `break-sound.mp3` and does not play `ball-bounce.mp3` in the same hit.
- [ ] Two sounds triggered in quick succession restart from the beginning with no console errors.
- [ ] Pressing `M` mutes both sounds; pressing `M` again restores them. Holding `M` toggles only once.
- [ ] Mute survives a lost life and a game restart; reloading the page starts unmuted.
- [ ] Muting while a sound is playing stops it immediately.
- [ ] The first sound plays after the first Space or click launch, with no autoplay error in the console.
- [ ] If an audio file fails to load or play, the game keeps running and the console shows no uncaught exception.
- [ ] The network tab shows requests to exactly `ball-bounce.mp3` and `break-sound.mp3` under `assets/sounds/`.
- [ ] Ball physics, scoring, lives, explosions and the HUD behave exactly as in SPEC 02.

---

## Decisions

- **Yes:** paddle bounces play the bounce sound. User decision; a silent paddle hit would feel dead.
- **Yes:** a brick hit plays only the break sound. User decision; avoids two sounds on one event.
- **Yes:** one `Audio` object per sound, restarted with `currentTime = 0`. User decision; simple and no pile-up when several bricks break in a few frames.
- **Yes:** `M` key mutes all sound, session-only. User decision; small and needs no UI.
- **Yes:** swallow the promise rejection from `play()`. Autoplay or load failures must not break the game.
- **Yes:** keep `muted` outside `game` state. Restart must not unmute.
- **No:** background music, extra sound events, volume control, mute indicator. Each belongs in its own spec.
- **No:** persisting mute in `localStorage`. User decision: session-only.
- **No:** a separate `audio.js` file. At this size `game.js` stays the single script, consistent with SPEC 01.

---

## Risks

| Risk                                                                    | Mitigation                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Browser blocks audio before a user gesture                              | First sound only occurs after the Space/click launch; `play()` errors are caught |
| Ball hitting a wall corner plays the bounce twice in one sub-step       | The sound restarts from 0, so it is heard once                              |
| Restarting a short sound on every hit cuts the previous one off          | Accepted trade-off of the "restart" decision; revisit if it sounds bad      |
| Audio file missing or not yet loaded when first needed                  | `play().catch` ignores the failure; the game keeps running                  |

---

## What is **not** in this spec

- Music or ambient sound.
- Sounds for launch, life lost, win or Game Over.
- Volume control, mute button or HUD indicator.
- Persisted mute setting.
- Overlapping playback or Web Audio API.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
