# SPEC 07 — Difficulty selection

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 03, SPEC 04, SPEC 06
> **Date:** 2026-10-14
> **Objective:** Show a start screen where the player picks Easy, Normal or Hard, which sets the ball speed and the number of lives for the whole run, and return to that screen after "You win!" or "Game Over".

---

## Scope

**In:**

- A new `game.status` value `'menu'`. The game starts in `menu` on page load.
- A start screen drawn on the canvas over a black background: the title "Arkanoid", three options each with its values, the highlighted option marked, and a key hint. No bricks, paddle or ball are drawn in `menu`.
- Three difficulties with these values:

  | Difficulty | Ball speed | Lives |
  | ---------- | ---------- | ----- |
  | Easy       | 300 px/s   | 5     |
  | Normal     | 400 px/s   | 3     |
  | Hard       | 500 px/s   | 2     |

- Normal is the highlighted option when the page loads. Normal is today's behaviour (SPEC 01 values).
- Keyboard input on the start screen: `1`, `2` and `3` pick that difficulty and start the run at once. `ArrowLeft`/`ArrowUp`/`KeyA` move the highlight to the previous option and `ArrowRight`/`ArrowDown`/`KeyD` to the next one, without wrapping. `Enter` or `Space` start the run with the highlighted option.
- Starting a run applies the chosen ball speed and lives, resets score, level and bricks as `resetGame()` does, and sets the status to `ready`. From there the game plays as before.
- The chosen difficulty stays fixed for the whole run, including every level from SPEC 04.
- After "You win!" or "Game Over", Space or click on the overlay returns to the start screen, with the last chosen difficulty highlighted.
- `M` keeps toggling mute on the start screen.
- The difficulty is not stored between sessions.

**Out of scope (for future specs):**

- Paddle width or any other parameter that changes with the difficulty.
- Mouse selection of the difficulty, buttons or hover effects. Clicking the canvas on the start screen does nothing.
- Showing the difficulty in the HUD during the game.
- Persisting the choice in `localStorage` or anywhere else.
- Changing the difficulty during a run (from pause or any other place).
- Per-difficulty high scores, per-difficulty scoring or different level layouts.
- Title animation, music, a settings or options screen.
- Build system, framework or automated tests.

---

## Data model

```js
// game.js
const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   ballSpeed: 300, lives: 5 },
  { id: 'normal', label: 'Normal', ballSpeed: 400, lives: 3 },
  { id: 'hard',   label: 'Hard',   ballSpeed: 500, lives: 2 },
];

// New fields on the game state:
game.status = 'menu';     // 'menu' | 'ready' | 'playing' | 'paused' | 'won' | 'lost'
game.difficulty = 1;      // index into DIFFICULTIES, highlighted in the menu and used by the run
```

Conventions:

- `BALL_SPEED` and `LIVES` (SPEC 01) are replaced by reads of `DIFFICULTIES[ game.difficulty ]`. Every use of `BALL_SPEED` (launch and paddle bounce) and `LIVES` (reset) in `game.js` changes. The ball speed stays constant for the whole run, as in SPEC 01.
- `startRun()` is the only function that leaves `menu`: it calls `resetGame()`, which reads `lives` from the current difficulty, and sets the status `ready`.
- `handleAction()` (Space and click) on `won` or `lost` now sets the status to `menu` instead of calling `resetGame()` directly. `resetGame()` itself keeps resetting score, lives, level and bricks and is only called by `startRun()`.
- In `menu`, `game.difficulty` is the highlighted option. It changes with the menu keys and is not changed by anything else.
- `update( dt )` does nothing in `menu` (no ball, paddle or explosion updates). Paddle keys and the mouse have no effect there.
- The pause keys and the `blur` auto-pause from SPEC 06 do nothing in `menu`, because they act only from `playing`.
- The start screen is drawn by a new `drawMenu()`, called from `draw()` instead of the field when the status is `menu`. It uses `ctx` text only and no new sprite.

---

## Implementation plan

1. Add `DIFFICULTIES` and `game.difficulty` (index 1, Normal). Replace the `BALL_SPEED` and `LIVES` constants by reads of `DIFFICULTIES[ game.difficulty ]`, in `launchBall`, `bounceOffPaddle` and `resetGame`. Manual test: the game plays exactly as before (400 px/s, 3 lives); in the console, setting `game.difficulty = 2` and calling `resetGame()` gives 2 lives and a 500 px/s ball after launch.
2. Add the `'menu'` status as the initial one, `drawMenu()` with the title, the three options and values, the highlight on `game.difficulty` and the key hint, and `startRun()`. In `menu`, `Enter` or `Space` call `startRun()`; `update( dt )` and the field drawing are skipped. Manual test: the page opens on the start screen with Normal highlighted, `Enter` or `Space` start a Normal game, and click does nothing.
3. Add the menu key handling: `1`, `2`, `3` pick and start; the arrow keys and `A`/`D` move the highlight without wrapping. Manual test: each key moves or picks as listed, Easy starts with 5 lives and a 300 px/s ball, Hard with 2 lives and 500 px/s, and `M` mutes on the start screen.
4. Change `handleAction()` so that Space or click on the `won` and `lost` overlays set the status to `menu`, keeping `game.difficulty` as the highlight. Manual test: after Game Over the start screen shows with the last choice highlighted, and a new run applies the new choice with score 0, level 1 and a full set of bricks.
5. Manual test of the full flow: play a short run in each difficulty and confirm the speed and lives in the console; lose all lives and confirm the return to the start screen; clear level 1 (SPEC 04) and confirm the next level keeps the same speed and the remaining lives; press `P`, `Esc` and blur the window on the start screen and confirm nothing happens.

---

## Acceptance criteria

- [ ] The page opens on the start screen with the title, the three options with their values, Normal highlighted and the key hint.
- [ ] No bricks, paddle or ball are drawn on the start screen, and the game state does not advance there.
- [ ] `1`, `2` and `3` start a run with Easy, Normal and Hard respectively.
- [ ] The arrow keys and `A`/`D` move the highlight one option at a time without wrapping; `Enter` and `Space` start with the highlighted option.
- [ ] A run on Easy has 5 lives and a ball speed of 300 px/s; Normal has 3 and 400; Hard has 2 and 500.
- [ ] The ball speed stays the same through every level of a run, after bounces and after losing a life.
- [ ] Clicking the canvas on the start screen does nothing.
- [ ] After "You win!" or "Game Over", Space or click shows the start screen with the last chosen difficulty highlighted.
- [ ] A new run after returning to the start screen starts with score 0, level 1, a full set of bricks and the lives of the chosen difficulty.
- [ ] `P`, `Esc` and window blur do nothing on the start screen.
- [ ] `M` toggles mute on the start screen, and the mute state survives the return to the start screen.
- [ ] Reloading the page opens the start screen with Normal highlighted, whatever was chosen before.
- [ ] A Normal run plays exactly as in SPEC 06.
- [ ] The browser console shows no errors.

---

## Decisions

- **Yes:** the difficulty changes ball speed and lives only. User decision; both are single values already, and the paddle width would touch drawing and bounce code.
- **Yes:** the choice is made on a start screen at game start, not in the pause. User decision; a mid-run change would let the player lower the difficulty and raises score fairness questions.
- **Yes:** keyboard input only: `1`/`2`/`3` pick and start, arrows and `A`/`D` move the highlight, `Enter` or `Space` confirm. User decision for keys and arrows; the up and down arrows and a single press to pick are the reading of the answer, taken because the options are drawn as a vertical list.
- **Yes:** after the end overlays the game returns to the start screen. User decision; the player can change the difficulty between runs without reloading.
- **Yes:** the last choice stays highlighted when returning to the start screen. Recommendation taken; the player most often repeats it.
- **Yes:** session-only choice. User decision; the same rule as the mute flag in SPEC 03.
- **Yes:** no difficulty label in the HUD. User decision; speed and lives already show it and the HUD stays as in SPEC 04.
- **Yes:** the start screen shows the title, each option's values and a key hint. User decision; the player can see what each choice changes.
- **Yes:** implemented after SPEC 04 and SPEC 06. User decision; this spec builds on `resetGame`/`loadLevel` from 04 and on the `paused` status from 06.
- **Yes:** a new `'menu'` status, with `game.difficulty` in the game state. It reuses the existing status machine, so no separate screen module is needed.
- **No:** mouse selection and on-screen buttons. Not asked for; adds hit-testing and hover code for one screen.
- **No:** paddle width, scoring or layout changes per difficulty. Each belongs in its own spec.
- **No:** `localStorage`. User decision; session-only.
- **No:** a pause menu or a settings screen. Out of scope, as in SPEC 06.

---

## Risks

| Risk                                                                      | Mitigation                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A leftover use of `BALL_SPEED` or `LIVES` keeps the old value             | Search `game.js` for both names after step 1; the manual test checks speed and lives per difficulty |
| Space on the end overlay also confirms the highlight and starts a run at once | The overlay handler only sets `menu`; confirming needs a second key press (the key repeat is already ignored) |
| Keys held on the start screen start the run twice or move the paddle      | `e.repeat` is ignored; `update( dt )` and the paddle input do nothing in `menu`             |
| The speed change breaks the sub-step ball movement at 500 px/s            | `MAX_STEP` already splits movement by speed (SPEC 01); check no brick is skipped on Hard    |
| SPEC 04 and SPEC 06 wording differs from what lands in code              | Re-read both before starting; they are required first                                       |

---

## What is **not** in this spec

- Paddle width or other per-difficulty parameters.
- Mouse selection, on-screen buttons or hover effects.
- Difficulty shown in the HUD.
- Persistence of the choice.
- Changing the difficulty from the pause or during a run.
- Per-difficulty high scores, scoring or layouts.
- Title animation, music or a settings screen.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
