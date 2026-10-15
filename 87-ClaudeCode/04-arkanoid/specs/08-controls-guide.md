# SPEC 08 — Controls guide

> **Status:** Draft
> **Depends on:** SPEC 01, SPEC 05, SPEC 06
> **Date:** 2026-10-14
> **Objective:** Show a static guide under the mute indicator, outside the canvas, that lists how to move, launch the ball and pause, with each key drawn as a small key-cap badge like the `M`.

---

## Scope

**In:**

- A static guide in the grey area to the right of the canvas, directly under the SPEC 05 mute indicator, left-aligned with it (12 px from the canvas's right edge).
- Three entries, each with a short label and its keys as key-cap badges, in this order:

  | Label  | Keys                                               |
  | ------ | -------------------------------------------------- |
  | Move   | `←` `→`, or `A` `D`, or the mouse                  |
  | Launch | `Space`, or a click                                |
  | Pause  | `P`, or `Esc`                                      |

- The guide is always visible, with the same content in every game status (`ready`, `playing`, `paused`, `won`, `lost`, and `menu` from SPEC 07 if it is present). It does not change with the status.
- The badges use the same look as the `M` badge of the mute indicator (1 px border, 4 px radius, bold monospace, light grey).
- The guide is display only: it takes no clicks and no focus, and the text cannot be selected, like the mute indicator.
- The guide never overlaps the canvas at window sizes from 1024 × 700 up to 1920 × 1080. Its width is capped at 100 px (the free space beside the canvas at 1024 px wide, minus the 12 px gap), and the keys of an entry wrap to the next line when they do not fit.
- On windows narrower than 968 px, where the mute indicator moves to the top-right corner of the viewport, the guide stays stacked under it (same right margin, 12 px below the indicator).
- The guide has an accessible name ("Controls") and its text is readable by screen readers.

**Out of scope (for future specs):**

- Mute: it keeps its own indicator from SPEC 05 and is not repeated in the guide.
- Menu and overlay keys (`1`, `2`, `3`, `Enter`, arrows in the start screen, Space or click on the end overlays).
- A guide that changes with the game status, or highlights the key that works now.
- A show/hide toggle, a help key or any other control for the guide.
- Drawing the guide inside the canvas or in the HUD.
- Clicking, hovering or any touch control on the guide.
- Hiding the guide on narrow windows, or a layout that avoids overlapping the canvas below 968 px.
- Translations, icons for the keys, animations.
- Build system, framework or automated tests.

---

## Data model

This feature introduces no new game state and no JavaScript. It is static markup and CSS.

```html
<!-- index.html, inside #stage, after #mute-indicator -->
<div id="controls-guide" role="group" aria-label="Controls">
  <div class="control">
    <span class="control-label">Move</span>
    <span class="control-keys">
      <kbd>←</kbd><kbd>→</kbd> <kbd>A</kbd><kbd>D</kbd> <span class="control-or">or mouse</span>
    </span>
  </div>
  <div class="control">
    <span class="control-label">Launch</span>
    <span class="control-keys"><kbd>Space</kbd> <span class="control-or">or click</span></span>
  </div>
  <div class="control">
    <span class="control-label">Pause</span>
    <span class="control-keys"><kbd>P</kbd> <kbd>Esc</kbd></span>
  </div>
</div>
```

Conventions:

- `#controls-guide` is `position: absolute; top: 40px; left: calc(100% + 12px); max-width: 100px` inside `#stage`, so it never moves the canvas. The `40px` is the height of the mute indicator (28 px icon) plus a 12 px gap.
- The `<kbd>` elements share the look of `#mute-indicator .key-hint`: `border: 1px solid currentColor; border-radius: 4px; padding: 1px 6px`, colour `#c8c8c8`, `font: bold 14px monospace`. The labels and "or" words use a smaller, non-bold monospace so the badges stand out.
- `pointer-events: none` and `user-select: none`, as the mute indicator.
- The existing `@media (max-width: 968px)` rule gets a second selector: `#controls-guide` becomes `position: fixed; top: 56px; right: 16px; left: auto`. The `56px` is the 16 px indicator offset plus 28 px of icon plus a 12 px gap.
- The final markup and class names may be adjusted while implementing, as long as the content, the order and the rules above hold.
- No new asset and no change to `game.js`.

---

## Implementation plan

1. Add the `#controls-guide` markup inside `#stage` in `index.html`, after `#mute-indicator`, with the three entries and the `<kbd>` badges, plus its CSS (position, badge look, 100 px cap, `pointer-events`, `user-select`). Manual test: the guide shows under the mute indicator, outside the canvas, with the three entries and badges in the same style as the `M`; the canvas stays centred and the game plays as before.
2. Add the narrow-window rule: extend the `@media (max-width: 968px)` block so `#controls-guide` is fixed under the mute indicator in the page corner. Manual test: below 968 px the guide sits under the indicator at the top-right of the viewport; above 968 px it goes back beside the canvas.
3. Manual test of the full flow: resize to 1024 × 700, 1280 × 800 and 1920 × 1080 and confirm the guide never touches the canvas and no keys are cut off; press `M`, `P`, `Esc` and Space and confirm the guide does not change; click the guide and confirm nothing happens; check the keys listed against what the game actually does.

---

## Acceptance criteria

- [ ] On load, a "Controls" guide shows under the mute indicator, outside the canvas, left-aligned with it and 12 px from the canvas's right edge.
- [ ] The guide lists, in order: Move (`←` `→`, `A` `D`, mouse), Launch (`Space`, click) and Pause (`P`, `Esc`), with each key in a badge styled like the `M`.
- [ ] Every key and input listed in the guide does what it says in the game: arrows, `A`, `D` and the mouse move the paddle; Space and a click launch the ball; `P` and `Esc` pause and resume.
- [ ] At window sizes from 1024 × 700 up to 1920 × 1080 the guide does not overlap the canvas, and no label or key is clipped.
- [ ] On windows narrower than 968 px the guide is stacked under the mute indicator in the top-right corner of the viewport.
- [ ] The guide is the same in every game status and does not change when keys are pressed.
- [ ] Clicking the guide does nothing and does not change the focus or the game; its text cannot be selected.
- [ ] The guide has the accessible name "Controls".
- [ ] The mute indicator, canvas size and position, and the game behave exactly as in SPEC 06.
- [ ] The browser console shows no errors.

---

## Decisions

- **Yes:** the guide lists the game controls only: move, launch and pause. User decision; mute already has its indicator, and the menu keys appear on the start screen itself.
- **Yes:** a static guide, always visible and the same in every status. User decision; no JavaScript and no state to keep in sync, at the cost of showing keys that do nothing in some states (for example `P` before the ball is launched).
- **Yes:** HTML under the mute indicator with key-cap badges. User decision; it matches the SPEC 05 style and reads as part of the same block.
- **Yes:** on narrow windows the guide stays stacked under the mute indicator. User decision; it keeps the two together, and accepts the overlap risk below.
- **Yes:** a separate `#controls-guide` element, not a change to `#mute-indicator`. The indicator stays display-only for the mute state and its markup from SPEC 05 does not change.
- **Yes:** a 100 px width cap with wrapping keys. The free space beside the canvas at 1024 px wide is 112 px, and SPEC 05 requires no overlap from that size.
- **Yes:** this spec lifts the "other on-screen key hints" exclusion from SPEC 05, for these three controls only.
- **No:** a guide that changes with the game status. Needs JavaScript and a status-to-text table; goes in its own spec if the static one is not enough.
- **No:** repeating mute in the guide. It already has its own indicator.
- **No:** listing the menu and overlay keys. The start screen shows its own hint, and the overlays say what to press.
- **No:** a toggle or help key to hide the guide. Not asked for; adds a control and state.
- **No:** hiding the guide on narrow windows. Not chosen; the player on a small window is the one who most needs it.

---

## Risks

| Risk                                                                           | Mitigation                                                                                                   |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| The guide is taller than the mute indicator and overlaps the canvas below 968 px | Accepted by decision. It only affects narrow windows, where the mute indicator already sits close to the canvas; the manual test records what it looks like at 800 × 600 and 900 × 700 |
| The keys do not fit in 100 px at 1024 px wide and get clipped or overlap the canvas | Keys wrap to the next line and the labels are short; checked at 1024 × 700 in the manual test              |
| The guide and the real controls drift apart when keys change later              | An acceptance criterion checks each listed key against the game; future specs that change keys must update it |
| SPEC 07 (start screen) lands and the guide lists keys that differ there          | The guide lists only game controls, and the criteria say it stays the same in every status                   |

---

## What is **not** in this spec

- Mute (it keeps its own indicator).
- Start screen and overlay keys.
- A guide that changes with the game status.
- Show/hide toggle or help key.
- Drawing the guide in the canvas or HUD.
- Clicking, hovering or touch on the guide.
- Hiding the guide or avoiding canvas overlap below 968 px.
- Translations, key icons or animations.
- Build system, framework or automated tests.

Each of these, if it lands, goes in its own spec.
