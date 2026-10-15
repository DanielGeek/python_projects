# SPEC 05 — Mute indicator

> **Status:** Implemented
> **Depends on:** SPEC 03, SPEC 04
> **Date:** 2026-10-14
> **Objective:** Show a speaker icon with a small `M` key hint just outside the top-right corner of the canvas, that switches between "sound on" and "muted" whenever the `M` key toggles mute.

---

## Scope

**In:**

- An indicator in the grey area to the right of the black canvas, aligned with the canvas's top edge and 12 px away from its right edge.
- On windows narrower than 936 px, where that space does not exist, the indicator moves to the top-right corner of the viewport (16 px from the top and the right).
- Two inline SVG speaker icons: "sound on" and "muted" (speaker crossed out). Only one is visible at a time.
- A small `M` label next to the icon as a key hint.
- The indicator shows "sound on" on load and follows the `muted` flag every time `M` is pressed, in any game state (`ready`, `playing`, overlays).
- The indicator is display only: it does not react to clicks and takes no focus.
- The indicator has an accessible label that matches its state ("Sound on" / "Sound muted").

**Out of scope (for future specs):**

- Clicking the icon to toggle mute, or any touch control.
- Volume slider.
- Drawing the indicator inside the canvas or in the canvas HUD.
- Persisting the mute state between sessions (still session-only, as in SPEC 03).
- Animations or transitions on the icon.
- Other on-screen key hints (arrows, Space).
- Build system, framework or automated tests.

---

## Data model

This feature introduces no new game state. It reads the existing `muted` flag from SPEC 03.

```html
<!-- index.html, inside <body>: a wrapper with the canvas and the indicator -->
<div id="stage">
  <canvas id="game" width="800" height="600"></canvas>
  <div id="mute-indicator" data-muted="false" role="img" aria-label="Sound on">
    <svg class="icon-on"  viewBox="0 0 24 24" aria-hidden="true">...</svg>
    <svg class="icon-off" viewBox="0 0 24 24" aria-hidden="true">...</svg>
    <span class="key-hint">M</span>
  </div>
</div>
```

```js
// game.js
const muteIndicator = document.getElementById( 'mute-indicator' );

function updateMuteIndicator() { /* sets data-muted and aria-label from `muted` */ }
```

Conventions:

- CSS in `index.html` shows `.icon-on` when `data-muted="false"` and `.icon-off` when `data-muted="true"`.
- `#stage` is `position: relative` and has the size of the canvas (the canvas is `display: block`); the `body` flex layout still centres it, so the canvas position does not change.
- `#mute-indicator` is `position: absolute; top: 0; left: calc(100% + 12px)` inside `#stage`, so it never moves the canvas.
- A media query `@media (max-width: 936px)` switches the indicator to `position: fixed; top: 16px; right: 16px; left: auto`. The 936 px limit is the canvas width (800 px) plus twice the space the indicator needs (12 px gap + about 56 px of icon and label).
- `updateMuteIndicator()` is called from `toggleMute()` and once at startup. No other code touches the indicator.
- Icon colour comes from `currentColor`, set in CSS to a light grey that reads on the `#2b2b2b` page background.

---

## Implementation plan

1. Add the `#mute-indicator` markup and its CSS to `index.html`, inside a `#stage` wrapper with the canvas, with both SVG icons, the `M` label and `data-muted="false"`. Manual test: the speaker icon and `M` show just outside the canvas's top-right corner, the canvas stays centred, and `M` still toggles sound as in SPEC 03.
2. Add `muteIndicator` and `updateMuteIndicator()` to `game.js`, call it at startup and from `toggleMute()`. Manual test: pressing `M` switches the icon between "on" and "muted" and updates `aria-label`.
3. Manual test of the full flow: toggle `M` in `ready`, `playing` and the overlay states; lose a life and restart from an overlay with mute on and confirm the icon stays "muted"; reload and confirm it starts as "sound on"; resize the window and confirm the indicator stays beside the canvas's top-right corner above 936 px, moves to the page corner below it, and never overlaps the canvas at 1024 × 700 and wider.

---

## Acceptance criteria

- [ ] On load, the indicator shows the "sound on" icon and an `M` label just outside the top-right corner of the canvas.
- [ ] At window sizes from 1024 × 700 up to 1920 × 1080 the indicator is outside the canvas, aligned with its top edge, 12 px from its right edge, and never overlaps it.
- [ ] On windows narrower than 936 px the indicator is in the top-right corner of the viewport.
- [x] Pressing `M` once switches the icon to "muted"; pressing it again switches back to "sound on".
- [x] Holding `M` changes the icon only once (SPEC 03 rule).
- [x] The icon always matches the `muted` flag, in `ready`, `playing`, `won` and `lost` states.
- [x] The icon stays "muted" after a lost life and after a restart from an overlay; reloading the page shows "sound on".
- [x] `aria-label` is "Sound on" or "Sound muted" and matches the visible icon.
- [x] Clicking the indicator does nothing and does not change the focus or the game.
- [x] Sound behaviour, canvas size and position, and the HUD behave exactly as in SPEC 03.
- [x] The browser console shows no errors.

---

## Decisions

- **Yes:** the indicator sits just outside the canvas's top-right corner. User decision, taken after seeing the first version in the page corner; it reads as part of the game and is easier to notice.
- **Yes:** a `#stage` wrapper with `position: relative` around the canvas. It lets the indicator be positioned from the canvas edge with no JavaScript measuring.
- **Yes:** below 936 px the indicator falls back to the page corner. Recommendation taken; there is no free space beside the canvas, and it avoids overlapping it.
- **No:** the first version, `position: fixed` in the page corner on every window size. Replaced by the decision above; it was far from the game on wide windows.
- **Yes:** inline SVG icons. User decision; no extra files, crisp at any size and coloured from CSS.
- **Yes:** display only, no click. User decision; `M` stays the only control.
- **Yes:** small `M` key hint. User decision; the key had no on-screen documentation after SPEC 03.
- **Yes:** `data-muted` attribute drives the CSS. One source of truth in the DOM and no inline style changes from JS.
- **Yes:** `role="img"` with `aria-label`. Recommendation taken so the state is not conveyed by the icon alone.
- **No:** a sprite from `spritesheet-breakout.png`. It has no speaker art and the page is outside the canvas.
- **No:** emoji or text label. They render differently per OS or look less like an icon.
- **No:** clickable toggle, volume slider, animations. Each belongs in its own spec.

---

## Risks

| Risk                                                           | Mitigation                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Indicator overlaps the canvas on a narrow or short window      | Below 936 px it moves to the page corner, which is clear of the canvas on windows 688 px tall or more; verified in the resize manual test |
| Icon and `muted` flag get out of sync                          | Only `toggleMute()` and startup call `updateMuteIndicator()`, which reads `muted`    |
| Low contrast on the `#2b2b2b` page background                  | Use a light grey `currentColor` and check it by eye in the manual test               |

---

## What is **not** in this spec

- Clickable or touch toggle for mute.
- Volume control.
- Indicator inside the canvas or HUD.
- Persisted mute setting.
- Animations on the icon.
- Other key hints.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
