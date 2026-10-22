# SPEC 12 — Touch controls for the games

> **Status:** Approved
> **Depends on:** SPEC 05, SPEC 09, SPEC 10, SPEC 11
> **Date:** 2026-10-21
> **Objective:** Make the four catalog games playable on a touch phone with on-screen buttons drawn over the CRT screen, sent to the game as synthetic key events through the bridge, and hide the host HUD on touch devices to give the screen more room.

---

## Why this spec exists

Every game is keyboard-only. `asteroids`, `drop` and `snake` read `keydown`/`keyup`, and `brick-buster` reads the keyboard plus `mousemove` and `click` on its canvas. On a phone nothing can steer, fire, start or pause, so `/game/[id]/play` loads but cannot be played.

A real-device capture (Asteroids at `/game/asteroids/play`, portrait) fixed the design:

- The host HUD (player, score, lives, level and its buttons) is crossed out: on touch it is hidden, so the CRT screen takes the height.
- The controls are drawn **over the CRT screen**: movement buttons on the left and action buttons on the right, like a console pad.

The games are static HTML in `public/games/<id>/` and are not part of the React build, and the same-origin iframe already has a host ↔ game bridge (`public/games/bridge.js`). So the controls live in the host and reach the game as key events. The games keep their logic and every key they already handle.

Findings that shape the plan:

- `asteroids` stores `keys[e.code]` and `justPressed[e.code]` on `window` `keydown`/`keyup`, so a held button needs a real `keydown` on press and `keyup` on release.
- `snake` and `brick-buster` listen on `window`. `drop` listens on `document`. A `KeyboardEvent` dispatched on `document` with `bubbles: true` reaches both.
- `drop` moves a piece once per `keydown`, and the browser's key auto-repeat normally gives it continuous movement. A synthetic key does not repeat, so the host button must repeat itself.
- `brick-buster` has a canvas-drawn difficulty menu picked with `1`–`3`, and `snake` and `asteroids` start with `Space`.
- The `GAMES` entries have a `controls` string for keyboards and no data about touch.

---

## Scope

**In:**

- `public/games/bridge.js`: a new host message `{ source: 'arcade-vault-host', type: 'key', code, down }`. The bridge dispatches a `KeyboardEvent` (`keydown` or `keyup`) with that `code` and a matching `key` on `document`, with `bubbles` and `cancelable` set. It ignores codes outside an allowlist. The existing `pause`/`resume` and the readers do not change.
- `lib/games.ts`: an optional `touch` field on `Game` that describes the buttons of each game, and a `touch` entry for `asteroids`, `drop`, `brick-buster` and `snake`.
- A new client component `components/ui/touch-controls.tsx` that draws the two clusters over the CRT screen. It sends the key messages with pointer events and releases every held key on `pointerup`, `pointercancel`, `lostpointercapture`, when the page is hidden, when the host is paused and when the component unmounts.
- A hook `useCoarsePointer` (in `components/ui/touch-controls.tsx` or `lib/`) built on `matchMedia("(pointer: coarse)")` with `useSyncExternalStore`, `false` on the server.
- `app/game/[id]/play/game-player.tsx`: render `TouchControls` inside the CRT screen when the pointer is coarse and the game has a `touch` config, only while the status is `playing`, the game has loaded and the final-score modal is closed. When the pointer is coarse, hide the HUD and show a small Pause and a small Exit button at the top of the screen instead.
- `app/globals.css`: `av-touch-*` rules (clusters, round buttons, pressed state, semi-transparent), plus `@media (pointer: coarse)` rules that hide `.av-hud`, set `touch-action: none` and `user-select: none` on the CRT screen and on the buttons, and stop the callout and double-tap zoom.
- `lib/games.test.ts`: every game has a valid `touch` config, and each key code of it appears in that game's `game.js`.
- Update `CLAUDE.md`: the `games.ts`, `components/ui/`, `game-player.tsx` and **Host ↔ game bridge** bullets, and the Next.js/testing notes if a command changes.

**Out of scope (for future specs):**

- A `TOUCH` tag in `tags`, and changes to the `controls` copy of the catalog.
- Swipe gestures, a virtual analog stick, dragging the paddle or the ship, and haptic feedback.
- Landscape-specific layouts. In landscape the same overlay is used and nothing breaks, but it is not tuned.
- Configuring `allowedDevOrigins` or any LAN workflow for `npm run dev`.
- Changes to the game logic, the readers, the skins or themes, the leaderboard, scores and credits.
- Re-designing the navbar, the header or the game detail page on mobile.
- Gamepad support and keyboard remapping.
- Auth and protection against forged scores.

---

## Data model

No new persistence. Touch controls are a view over keys that already exist.

Catalog types (`lib/games.ts`):

```ts
export interface TouchButton {
  /** KeyboardEvent.code that the bridge dispatches, e.g. "ArrowLeft", "Space", "KeyP". */
  code: string;
  /** Short visible text or symbol, e.g. "◀", "FIRE". */
  label: string;
  /** Accessible name, e.g. "Rotate left". */
  name: string;
  /** Re-sends keydown while held (after 250 ms, every 90 ms). For games that move once per keydown. */
  repeat?: boolean;
}

export interface TouchControls {
  /** Left cluster: movement. `cross` lays four buttons as a D-pad, `row` lays up to three side by side. */
  move: { layout: "cross" | "row"; buttons: TouchButton[] };
  /** Right cluster: actions, laid in a 2-column grid from the bottom right. */
  actions: TouchButton[];
}

// Game gets: touch?: TouchControls;
```

Button maps. Codes are the ones each game already handles today:

| Game           | Left (move)                                                           | Right (actions)                                                                              |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `asteroids`    | `row`: `ArrowLeft` (rotate left), `ArrowRight` (rotate right)         | `ArrowUp` (thrust), `Space` (fire / start / restart)                                         |
| `drop`         | `cross`: `ArrowLeft`, `ArrowRight`, `ArrowDown` (soft drop, `repeat`) | `ArrowUp` (rotate), `Space` (hard drop), `KeyC` (hold), `KeyE` (skills)                      |
| `brick-buster` | `row`: `ArrowLeft`, `ArrowRight` (held, no repeat)                    | `Space` (launch / confirm), `Digit1`, `Digit2`, `Digit3` (difficulty, small), `KeyP` (pause) |
| `snake`        | `cross`: `ArrowUp`, `ArrowLeft`, `ArrowRight`, `ArrowDown`            | `Space` (start / restart), `KeyP` (pause)                                                    |

For `drop`, `ArrowLeft` and `ArrowRight` also have `repeat: true`. Held buttons for `asteroids` and `brick-buster` use the plain `keydown`/`keyup` pair, because those games read a held state.

Bridge message (`public/games/bridge.js`):

```js
// host -> game
{ source: 'arcade-vault-host', type: 'key', code: 'ArrowLeft', down: true }
```

- Allowlist: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Space`, `Enter`, `KeyC`, `KeyE`, `KeyP`, `Digit1`, `Digit2`, `Digit3`. Any other `code` is ignored.
- The event is built with `{ code, key, bubbles: true, cancelable: true }`, where `key` comes from a small table (`Space` → `" "`, `ArrowLeft` → `"ArrowLeft"`, `KeyP` → `"p"`, `Digit1` → `"1"`, …).
- It is dispatched on `document`, and only when `e.source === window.parent` (the existing check).
- A `keydown` for a code already held is passed through, as the browser does on auto-repeat. The host owns the repeat.

Behavior of `TouchControls`:

- One pointer per button (`pointerdown` sends `down: true`, and `setPointerCapture` keeps the finger on that button). Several buttons can be held at once (move and fire).
- `pointerup`, `pointercancel` and `lostpointercapture` send `down: false`. A `visibilitychange` to hidden, the host pause and the unmount release every held key.
- While `paused` is true the buttons are disabled and nothing is sent.
- Buttons are at least 56×56 CSS px, semi-transparent (about 35% when idle, brighter when pressed), use the game's accent, have `aria-label` from `name`, and use `touch-action: none`. The clusters are placed with `env(safe-area-inset-*)` so they do not sit under the notch or the home bar.
- The container has `pointer-events: none`, and only the buttons have `pointer-events: auto`, so the game's own toolbar and canvas stay reachable.

File layout:

```
public/games/bridge.js                    adds the `key` message handler
lib/games.ts                              adds TouchButton, TouchControls, Game.touch and the four touch configs
components/ui/touch-controls.tsx          new: useCoarsePointer and TouchControls (client)
app/game/[id]/play/game-player.tsx        renders TouchControls and the compact Pause/Exit on touch, hides the HUD
app/globals.css                           av-touch-* and the (pointer: coarse) rules
lib/games.test.ts                         touch config checks
CLAUDE.md                                 documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `npm test` and `npm run build` on the clean tree. Read the `keydown` handlers of the four games and write down, for each, which codes they handle and which screen starts the game. Manual test: both commands pass, and the table above matches the code. If a code in the table is not handled by that game, fix the table and note it in the decisions.
2. **Bridge `key` message.** Add the allowlist, the `key` table and the dispatch to `public/games/bridge.js`. Manual test: open `/game/snake/play`, and in the console run `frames[0].postMessage({source:'arcade-vault-host',type:'key',code:'Space',down:true},'*')`. Snake starts. An allowlisted `ArrowLeft` down/up pair turns it, and a code like `KeyZ` does nothing.
3. **Catalog data.** Add `TouchButton`, `TouchControls`, `Game.touch` and the four configs to `lib/games.ts`. Manual test: `npm run lint` and the type check pass, and no entry other than the four has `touch`.
4. **`TouchControls` and the hook.** Create `components/ui/touch-controls.tsx` with `useCoarsePointer`, the two clusters (`cross` and `row` layouts), pointer capture, the held-key release rules and the `repeat` timer. Manual test, in Chrome device emulation with touch: pressing a button sends a `down: true`, releasing sends `down: false`, two buttons can be held together, a `pointercancel` releases the key, and a `repeat` button keeps sending until it is released.
5. **Wire the player.** Render `TouchControls` in `game-player.tsx` under the conditions of the scope, hide the HUD on coarse pointers, and add the compact Pause and Exit buttons. Manual test, at 375×812 and at 412×915 with touch emulation: the HUD is gone, the CRT screen is taller, the controls show over it only while playing, Pause freezes the game and disables the buttons, and Exit goes to `/game/<id>`. With a mouse (`pointer: fine`) nothing changes: HUD visible, no controls.
6. **Styles.** Add the `av-touch-*` rules and the `@media (pointer: coarse)` rules to `app/globals.css`. Manual test: no page scroll or pull-to-refresh while a finger is on the screen or on a button, no text selection or callout on long press, no double-tap zoom, and the clusters respect the safe area.
7. **Play each game on touch.** In emulation first, then on a real phone on the same network, play a full run of every game with touch only. Manual test per game:
   - `asteroids`: starts with FIRE, rotates, thrusts and fires at once, restarts after game over.
   - `drop`: moves (with repeat), rotates, soft drops, hard drops, holds, opens the skill menu and picks one by tapping it.
   - `brick-buster`: picks a difficulty with `1`–`3`, moves the paddle, launches the ball, pauses with `KeyP`, and restarts from the end screen.
   - `snake`: starts, steers with the D-pad, pauses and resumes, and restarts after game over.
8. **Check the rest of the flow.** Manual test: the credit is spent once per start, `INSERT COIN` still shows at 0 credits, the final-score modal can be filled and saved by touch, `SCORE SAVED` shows, and the row appears in `/hall-of-fame` for the right game. Delete test rows afterwards.
9. **Tests.** Add the `touch` checks to `lib/games.test.ts`. Manual test: `npm test` passes, and it fails when a button code is changed to one the game does not handle.
10. **Docs.** Update `CLAUDE.md` as listed in the scope.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [x] `bridge.js` handles `{ type: 'key', code, down }` from the parent only, dispatches a `keydown` or `keyup` on `document` with `bubbles: true`, and ignores any code outside the allowlist.
- [ ] `bridge.js` still handles `pause` and `resume` and still reports the state of every reader as before.
- [ ] `GAMES` has a valid `touch` config for `asteroids`, `drop`, `brick-buster` and `snake`, and the button codes match the table in the data model.
- [ ] `lib/games.test.ts` checks that every `touch` button code appears in the `game.js` of its game, and that every code is in the bridge allowlist.
- [ ] With `pointer: coarse`, `/game/<id>/play` hides the host HUD, shows a compact Pause and Exit, and shows the touch controls over the CRT screen while the game is playing.
- [ ] With `pointer: fine`, the HUD and the page look exactly as before and no touch control is rendered.
- [ ] The touch controls do not render while loading, at `INSERT COIN`, while the final-score modal is open, or when the game has no `touch` config.
- [ ] Holding a movement button and an action button at once works (for example, rotate and fire in Asteroids).
- [ ] Releasing a finger, a `pointercancel`, hiding the page, pausing and leaving the page release every held key, so no key stays stuck.
- [ ] While the host is paused, the touch buttons send nothing.
- [ ] Each of the four games can be started, played, paused and restarted with touch only, as in step 7.
- [ ] `drop` moves continuously while its left, right or soft-drop button is held, and a short tap moves exactly one cell.
- [ ] Buttons are at least 56×56 CSS px, have an `aria-label`, and the clusters stay inside the safe area at 375×812 and at 412×915.
- [ ] While a finger is on the game screen or a control, the page does not scroll, zoom or select text, and there is no pull-to-refresh.
- [ ] The game's own canvas and toolbar (skin and theme) can still be tapped where no button covers them.
- [ ] One credit is spent per start, and a score saved by touch reaches `public.scores` with the right `game_id` and shows in `/hall-of-fame`.
- [ ] `public/games/*/game.js`, `lib/leaderboard.ts`, `lib/scores.ts`, `lib/credits.ts` and `components/ui/game.tsx` have no edits (`git diff` is empty for them).
- [ ] `CLAUDE.md` documents the touch controls, the `key` bridge message and the `touch` field.

---

## Decisions

- **Yes:** the controls live in the host and send key events through the bridge (user decision). **No:** touch handlers inside each game, which means four implementations to maintain. The games keep their logic.
- **Yes:** buttons drawn over the CRT screen, movement on the left and actions on the right (user decision, from the reference capture). **No:** a virtual analog stick, which helps two games and needs per-game tuning.
- **Yes:** hide the host HUD on touch devices (user decision, from the capture) and keep a compact Pause and Exit. **No:** compacting it into one row, since each game already draws its score. Step 5 checks that nothing the player needs is lost.
- **Yes:** all four catalog games (user decision). **No:** only the infrastructure plus Snake.
- **Yes:** activate on `(pointer: coarse)`, not on viewport width, so a narrow desktop window does not get buttons. **No:** `max-width: 640px`.
- **Yes:** the host owns key repeat (`repeat: true`) because a synthetic `keydown` does not auto-repeat. **No:** changing `drop` to read held keys.
- **Yes:** an allowlist in the bridge, so the host message cannot inject arbitrary keys. **No:** forwarding any `code`.
- **Yes:** the difficulty keys `1`–`3` are small buttons for Brick Buster because its menu is drawn on the canvas. Step 1 checks whether tapping the menu already works; if it does, those buttons are dropped.
- **No:** a `TOUCH` tag or changes to `controls` copy. The extras question was left unanswered in the definition, so it stays out. It is a one-line change for its own spec.
- **No:** `allowedDevOrigins` or a LAN workflow. The reference capture shows the dev server already reachable from a phone.
- **No:** landscape-specific layouts. The same overlay is used and it is not tuned.
- **Yes:** `touch-action: none` and `user-select: none` only on the CRT screen and the buttons, so the rest of the site keeps normal scroll and zoom.

---

## Risks

| Risk                                                                                                                                                    | Mitigation                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On a 319 px wide frame (Snake is square) the clusters cover a large part of the board.                                                                  | Semi-transparent buttons, `pointer-events` only on the buttons, and a check at 375×812 in step 7. If it is unplayable, report it for a spec that moves the controls below the screen. |
| A key stays pressed when a finger slides off a button or the page loses focus, and the ship thrusts forever.                                            | Pointer capture, release on `pointercancel`, `lostpointercapture`, `visibilitychange`, pause and unmount. Checked in the acceptance criteria.                                         |
| The game ignores a synthetic key (for example it checks `isTrusted`, or a handler is on an element and not on `document`).                              | Step 1 reads the handlers and step 2 tests the bridge by hand on one game before building the UI.                                                                                     |
| `justPressed` in Asteroids needs a `keydown` while the key is not held, so a missed `keyup` breaks the next shot.                                       | The release rules above, and the held-key table is released as a whole.                                                                                                               |
| The HUD in the capture shows a `SKIN` selector and extra buttons that this repo's HUD does not have, so the host may differ from what was photographed. | Step 5 is written against `.av-hud` in this repo. If the dev server on the phone was running other code, the capture is only a layout reference.                                      |
| The in-game toolbar (skin and theme) of the games sits under a cluster.                                                                                 | Containers do not catch pointers, and step 7 taps the toolbar on a real phone. Moving the toolbar is out of scope.                                                                    |
| Space on a game's end screen restarts inside the game without the host "Play again", so no credit is spent.                                             | Same behavior as with a keyboard (SPEC 10, SPEC 11). Any credit change is a separate spec.                                                                                            |
| `zoom` in `fitToFrame()` is not supported by Firefox before 126.                                                                                        | Accepted, as in SPEC 09, SPEC 10 and SPEC 11.                                                                                                                                         |
| Emulation in desktop Chrome does not reproduce every real-device behavior (pull-to-refresh, safe areas, multi-touch).                                   | Step 7 requires a run on a real phone. Emulation is only the first pass.                                                                                                              |

---

## What is **not** in this spec

- A `TOUCH` tag or new `controls` copy.
- Swipes, an analog stick, dragging the paddle or the ship, and haptics.
- Landscape tuning, or a layout that puts the controls below the screen.
- Gamepad support or key remapping.
- `allowedDevOrigins` or any LAN setup for the dev server.
- Changes to the game logic, the skins, the leaderboard, scores or credits.
- Redesigning the navbar or the detail page for mobile.
- Auth or protection against forged scores.

Each one of those, if it lands, goes in its own spec.
