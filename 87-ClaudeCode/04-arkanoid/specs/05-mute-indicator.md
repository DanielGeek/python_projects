# SPEC 05 — Mute indicator

> **Status:** Draft
> **Depends on:** SPEC 03
> **Date:** 2026-10-14
> **Objective:** Show a speaker icon with a small `M` key hint in the top-right corner of the page, outside the canvas, that switches between "sound on" and "muted" whenever the `M` key toggles mute.

---

## Scope

**In:**

- A fixed indicator in the top-right corner of the viewport, in the grey area outside the black canvas.
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
<!-- index.html, inside <body>, outside the canvas -->
<div id="mute-indicator" data-muted="false" role="img" aria-label="Sound on">
  <svg class="icon-on"  viewBox="0 0 24 24" aria-hidden="true">...</svg>
  <svg class="icon-off" viewBox="0 0 24 24" aria-hidden="true">...</svg>
  <span class="key-hint">M</span>
</div>
```

```js
// game.js
const muteIndicator = document.getElementById( 'mute-indicator' );

function updateMuteIndicator() { /* sets data-muted and aria-label from `muted` */ }
```

Conventions:

- CSS in `index.html` shows `.icon-on` when `data-muted="false"` and `.icon-off` when `data-muted="true"`.
- The indicator uses `position: fixed; top` and `right` offsets, so it never moves the canvas.
- `updateMuteIndicator()` is called from `toggleMute()` and once at startup. No other code touches the indicator.
- Icon colour comes from `currentColor`, set in CSS to a light grey that reads on the `#2b2b2b` page background.

---

## Implementation plan

1. Add the `#mute-indicator` markup and its CSS to `index.html`, with both SVG icons, the `M` label and `data-muted="false"`. Manual test: the speaker icon and `M` show in the top-right corner outside the canvas, the canvas stays centred, and `M` still toggles sound as in SPEC 03.
2. Add `muteIndicator` and `updateMuteIndicator()` to `game.js`, call it at startup and from `toggleMute()`. Manual test: pressing `M` switches the icon between "on" and "muted" and updates `aria-label`.
3. Manual test of the full flow: toggle `M` in `ready`, `playing` and the overlay states; lose a life and restart from an overlay with mute on and confirm the icon stays "muted"; reload and confirm it starts as "sound on"; resize the window and confirm the indicator stays in the corner and never overlaps the canvas.

---

## Acceptance criteria

- [ ] On load, the indicator shows the "sound on" icon and an `M` label in the top-right corner of the page.
- [ ] The indicator is outside the canvas and never overlaps it at window sizes from 1024 × 700 up to 1920 × 1080.
- [ ] Pressing `M` once switches the icon to "muted"; pressing it again switches back to "sound on".
- [ ] Holding `M` changes the icon only once (SPEC 03 rule).
- [ ] The icon always matches the `muted` flag, in `ready`, `playing`, `won` and `lost` states.
- [ ] The icon stays "muted" after a lost life and after a restart from an overlay; reloading the page shows "sound on".
- [ ] `aria-label` is "Sound on" or "Sound muted" and matches the visible icon.
- [ ] Clicking the indicator does nothing and does not change the focus or the game.
- [ ] Sound behaviour, canvas size and position, and the HUD behave exactly as in SPEC 03.
- [ ] The browser console shows no errors.

---

## Decisions

- **Yes:** fixed top-right corner of the page. User decision; it is outside the canvas and independent of window size.
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
| Indicator overlaps the canvas on a narrow or short window      | Canvas is 800 px wide and the indicator is small; verified in the resize manual test |
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
