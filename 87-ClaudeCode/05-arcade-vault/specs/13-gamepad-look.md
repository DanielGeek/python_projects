# SPEC 13 — Gamepad MK-II look for the touch controls

> **Status:** Draft
> **Depends on:** SPEC 12
> **Date:** 2026-10-22
> **Objective:** Redraw the touch controls of `/game/[id]/play` so they look like the Gamepad MK-II of `references/gamepad-assets/` (shell, D-pad with hub gem, round A and B buttons), keeping the same bridge, the same key codes and the same press behavior as SPEC 12.

---

## Why this spec exists

SPEC 12 made the four games playable on a phone with flat round buttons that use the game's accent. The user has a reference component, the **Gamepad MK-II** (`references/gamepad-assets/gamepad.html`, screenshot `gamepad-neon.png`), and wants the on-screen pad to look the same:

- A dark shell with a gradient, a thin cyan double border, a dot grid and a glow.
- A D-pad of four raised square keys with an arrow each, around a hub with a pulsing cyan gem.
- Two big round buttons, **B** (cyan) on the left and **A** (magenta) on the right, with a glossy radial fill, a 3D "key travel" when pressed and a dashed ring.

Findings that shape the plan:

- The reference is only the **look**: its script just toggles an `on` class from the keyboard and from pointer events. It sends nothing. Our `TouchControls` already owns the real behavior (pointer capture, key repeat, release rules, bridge messages), and that stays.
- The reference has **4 directions + 2 buttons**. The catalog needs more: Asteroids uses ◀ ▶ plus thrust and fire, Drop has four actions, Brick Buster has five (`GO`, `P`, `1`, `2`, `3`). The catalog configs have to change shape so every game fits the pad.
- The reference D-pad keys are 50 px (46 px under 620 px wide) and A/B are 74 px (64 px). SPEC 12 required every button to be at least 56 px. See Decisions.
- The pad lives right below the CRT bezel in normal flow (SPEC 12) and the page is about 343 px wide at 375 px, so the reference's 288 px of pad plus its shell leave no room for anything in the middle in portrait.
- `components/ui/touch-controls.tsx` renders `data-key`, `data-pressed` and `data-glyph` that `app/globals.css` styles. The reference uses `.on` for the pressed state, we keep `data-pressed`.

---

## Scope

**In:**

- `lib/games.ts`: change the `TouchControls` type to the pad shape (D-pad directions, `a`, `b`, optional `extra` buttons) and rewrite the `touch` config of `asteroids`, `drop`, `brick-buster` and `snake`. Same key codes as SPEC 12, only grouped differently. `TouchButton` stays.
- `components/ui/touch-controls.tsx`: render the pad (shell, a full D-pad with hub and gem, A and B with a ring, a row of small pills for `extra`). Directions the game does not use are drawn disabled. `useCoarsePointer`, `press`, `end`, `release`, `releaseAll`, the repeat timer and the pause and unmount rules are not touched.
- `app/globals.css`: replace the `av-touch-*` rules of SPEC 12 (shell, D-pad, hub, A/B, small pills, pressed and disabled states, the `@media (max-width: 620px)` sizes) with ones ported from the reference. `av-touch-bar`, `av-touch-mini` and the `@media (pointer: coarse)` block stay as they are.
- `lib/games.test.ts`: adapt the `touch` checks to the new shape, and add the new ones listed in the criteria.
- `CLAUDE.md`: update the bullets that describe `touch` (`lib/games.ts`) and `touch-controls.tsx`.

**Out of scope (for future specs):**

- Changes to `public/games/` (game logic, `bridge.js`, readers, `KEYS` allowlist) and to the host messages. The key codes sent do not change.
- Skins or themes of the games, and a light variant of the pad. The pad is dark in every theme.
- Changes to `game-player.tsx`: where the pad sits (right below the CRT bezel), when it shows, the compact Pause and Exit row and the HUD hiding stay as in SPEC 12.
- The reference's keyboard handling (arrows/WASD, Z/J, X/K): the games already read the real keyboard.
- Showing the pad on desktop (`pointer: fine`), a skin selector for the pad, haptics, sound and swipes.
- A caption that tells the player what A and B do in each game (see Risks).
- Landscape tuning beyond what the layout rules below give for free.

---

## Data model

No new persistence. Only the catalog type changes (`lib/games.ts`).

```ts
export interface TouchButton {
  /** KeyboardEvent.code that the bridge dispatches, e.g. "ArrowLeft", "Space", "KeyP". */
  code: string;
  /** Visible text for `extra` buttons, e.g. "HOLD", "1". A and B show their letter. */
  label: string;
  /** Accessible name, e.g. "Rotate left". */
  name: string;
  /** Re-sends keydown while held (after 250 ms, every 90 ms). For games that move once per keydown. */
  repeat?: boolean;
}

export interface TouchControls {
  /** D-pad directions the game uses. Codes are ArrowUp, ArrowDown, ArrowLeft, ArrowRight. The others are drawn disabled. */
  move: TouchButton[];
  /** Big button on the right, in the game's accent. The main action. */
  a: TouchButton;
  /** Big cyan button on the left of A. The second action. */
  b: TouchButton;
  /** Small pills for the rest, at most three. Optional. */
  extra?: TouchButton[];
}
```

`layout` and `actions` of SPEC 12 are removed. The `label` of `a` and `b` is no longer drawn (the letter is), so it is only kept for the tests and the types; `name` is the aria-label.

New configs. Codes are the ones of SPEC 12, nothing is added or dropped:

| Game           | D-pad (`move`)                                                     | A                          | B                  | Extra (small)                             |
| -------------- | ------------------------------------------------------------------ | -------------------------- | ------------------ | ----------------------------------------- |
| `asteroids`    | `ArrowLeft`, `ArrowRight` (rotate). Up and down disabled.          | `Space` (fire)             | `ArrowUp` (thrust) | none                                      |
| `drop`         | `ArrowLeft`, `ArrowRight`, `ArrowDown`, all `repeat`. Up disabled. | `Space` (hard drop)        | `ArrowUp` (rotate) | `KeyC` (`HOLD`), `KeyE` (`SKILL`)         |
| `brick-buster` | `ArrowLeft`, `ArrowRight`. Up and down disabled.                   | `Space` (launch / confirm) | `KeyP` (pause)     | `Digit1`, `Digit2`, `Digit3` (difficulty) |
| `snake`        | `ArrowUp`, `ArrowLeft`, `ArrowRight`, `ArrowDown`                  | `Space` (start / restart)  | `KeyP` (pause)     | none                                      |

Colors (CSS, from the existing `RGB[accent]` triplet in `touch-controls.tsx`, set as `--av-touch-rgb`):

- **A**, the **D-pad pressed glow and arrows** and the **hub gem** use the game's accent.
- **B** is always cyan, as in the reference.
- Shell, keys and hub keep the reference colors (`#1c1c28 → #0c0c14`, `rgba(0, 245, 255, 0.18)` border).

Markup (inside the existing `<div className="av-touch">`), class names are `av-touch-*`, ported from the reference classes:

```
av-touch                shell        (.gp)
  av-touch-body         grid         (.gp-body)
    av-touch-dpad       cross        (.gp-dpad), keys .av-touch-dp (.dp) with an <svg> arrow, hub .av-touch-hub with .av-touch-gem
    av-touch-extra      small pills  (centre of the grid, or its own row, see Decisions)
    av-touch-ab         B then A     (.gp-actions), buttons .av-touch-btn (.ab) with .av-touch-ring and the letter
```

The press logic does not change: every button keeps `data-key={code}`, `data-pressed` while held, `disabled` while paused, `touch-action: none`, `user-select: none`, `onPointerDown/Up/Cancel/LostPointerCapture`, `onMouseDown` and `onContextMenu` preventing default. A disabled direction is a `<button disabled aria-hidden tabIndex={-1}>` with no handlers.

File layout:

```
lib/games.ts                      new TouchControls shape and the four configs
components/ui/touch-controls.tsx  renders the pad, same behavior
app/globals.css                   av-touch-* ported from the reference
lib/games.test.ts                 touch checks for the new shape
CLAUDE.md                         documents the above
```

---

## Implementation plan

1. **Inspect before changing.** Run `npm test` and `npm run build` on the clean tree. Open `references/gamepad-assets/gamepad.html` in the browser next to `/game/snake/play` with touch emulation. Manual test: both commands pass, and the list of things to port (shell, key, hub, ring, pressed travel) matches the Scope.
2. **Catalog shape.** In `lib/games.ts` replace `TouchControls` and the four `touch` configs with the table above. Update the other code that reads `touch.move.layout` or `touch.actions` (`touch-controls.tsx`, `lib/games.test.ts`) just enough to type-check. Manual test: `npm run lint` and the type check pass, and `/game/<id>/play` still renders for the four games.
3. **Markup.** Rewrite the return of `TouchControls` for the pad (shell, full D-pad with the unused directions disabled, hub and gem, B and A, `extra` row) without touching the press logic. Arrow glyphs are inline SVG triangles, A and B draw their letter. Manual test, in Chrome device emulation with touch: every enabled button still sends `down: true` on press and `down: false` on release, two buttons can be held together, `drop` still repeats on its left, right and down keys, a disabled direction sends nothing.
4. **Styles.** In `app/globals.css` replace the old `av-touch`, `av-touch-move`, `av-touch-cross`, `av-touch-actions` and `av-touch-btn` rules with the ones ported from the reference: shell with gradient, double border, dot grid and glow; keys with 3D travel (`translateY(3px)`) and the pressed glow on `[data-pressed]`; hub and pulsing gem; A and B glossy radial fill with the ring shown while pressed; small pills; the `max-width: 620px` sizes. Drop the `:hover` rules (a finger has no hover) and respect `prefers-reduced-motion` for the gem pulse. Manual test: at 375×812 and at 412×915 the pad matches `gamepad-neon.png` (shell, D-pad, B cyan, A in the game's accent), and no part of it is cut at the right edge.
5. **Small buttons and narrow screens.** Lay the `extra` pills in the middle of the grid when the shell is wide enough, and in a full-width row under the D-pad and A/B when it is not. Manual test: Drop (`HOLD`, `SKILL`) and Brick Buster (`1`, `2`, `3`) at 375×812, 412×915 and in landscape. No overlap, nothing under the safe area, every pill at least 44 px high.
6. **Pressed and paused states.** Check that a held button looks pressed (travel, glow, ring), that the pad dims and ignores touches while the host is paused, and that nothing stays pressed after `pointercancel`, hiding the page or leaving the page. Manual test: Pause from the compact bar, then Resume.
7. **Play each game on touch.** In emulation first, then on a real phone, play a run of every game with the new pad:
   - `asteroids`: rotate with the D-pad, thrust (B) and fire (A) at the same time, restart with A.
   - `drop`: left, right and soft drop repeat while held, rotate (B), hard drop (A), `HOLD` and `SKILL` pills.
   - `brick-buster`: pick a difficulty with the pills, move, launch with A, pause with B, restart from the end screen.
   - `snake`: start with A, steer with the cross, pause with B and resume, restart after game over.
8. **Check the rest of the flow.** Manual test: with `pointer: fine` nothing is rendered and the page looks as before, the pad does not show while loading, at `INSERT COIN` or while the final-score modal is open, and the credit is spent once per start.
9. **Tests.** Update `lib/games.test.ts` as listed in the criteria. Manual test: `npm test` passes, and it fails when a code of `a`, `b`, `move` or `extra` is changed to one the game does not handle, when `a` and `b` share a code, or when `move` has a non-arrow code.
10. **Docs.** Update `CLAUDE.md` as listed in the scope. Run `npm run lint`, `npm test` and `npm run build` last.

---

## Acceptance criteria

- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `TouchControls` in `lib/games.ts` has `move`, `a`, `b` and optional `extra`, with no `layout` or `actions`, and `GAMES` has the config of the table above for `asteroids`, `drop`, `brick-buster` and `snake`.
- [ ] Every key code of every `touch` config is the same as in SPEC 12 (no code is added or dropped), appears in that game's `game.js`, and is in the `KEYS` allowlist of `bridge.js`.
- [ ] `lib/games.test.ts` checks that `a` and `b` exist, that no code is repeated inside a config, that every `move` code is one of the four arrows and that `extra` has at most three buttons.
- [ ] With `pointer: coarse` and a playing game, the pad is drawn below the CRT bezel with the reference's shell, a four-key D-pad with hub and pulsing gem, B (cyan) and A (game accent), side by side, on 375×812 and on 412×915.
- [ ] Directions the game does not use are drawn disabled and send nothing; the four keys are always drawn.
- [ ] Pressing a key or a round button gives the reference's pressed look (3D travel and glow, and the dashed ring on A and B) while it is held, and it goes back when released.
- [ ] `drop` and `brick-buster` show their small pills, `asteroids` and `snake` show none, and no pill is cut or overlapped at 375 px wide.
- [ ] Press behavior is unchanged: two buttons held at once, `drop` repeat on left, right and soft drop, a tap moves one cell, release on `pointerup`, `pointercancel`, `lostpointercapture`, page hidden, host pause and unmount, and nothing is sent while paused.
- [ ] The pad is not cut at the right edge nor under the notch or the home bar, and its buttons keep `touch-action: none` and `user-select: none`.
- [ ] D-pad keys and pills are at least 44 px, and A and B at least 64 px, on a phone.
- [ ] With `pointer: fine` no pad is rendered and the page looks as before.
- [ ] The pad does not render while loading, at `INSERT COIN`, while the final-score modal is open, or when the game has no `touch` config.
- [ ] `public/games/`, `components/ui/game.tsx`, `app/game/[id]/play/game-player.tsx`, `lib/leaderboard.ts`, `lib/scores.ts` and `lib/credits.ts` have no edits (`git diff` is empty for them).
- [ ] `CLAUDE.md` describes the new `touch` shape and the pad.

---

## Decisions

- **Yes:** copy the reference's look (shell, keys, hub, A/B) and keep our own press logic (user decision). **No:** pasting the reference's script, which only toggles a class and sends nothing.
- **Yes:** the two main actions of each game are A and B, the rest are small pills in the same neon style (user decision). **No:** only A and B, which would drop Drop's `HOLD` and `SKILL` and Brick Buster's difficulty and pause and need game changes. **No:** more big round buttons, which grow the shell.
- **Yes:** the A/B mapping of the table (user decision): `asteroids` A=fire, B=thrust; `drop` A=hard drop, B=rotate; `brick-buster` A=launch, B=pause; `snake` A=start, B=pause.
- **Yes:** the D-pad is always the four keys, and unused directions are disabled and dimmed (user decision). **No:** a D-pad with gaps, and mapping ▲ to an action, which would change the configs more.
- **Yes:** A and the D-pad use the game's accent, B is always cyan (user decision). **No:** the reference's fixed colors for everything, which would drop the per-game accent.
- **Yes:** the full shell around the pad (user decision). **No:** loose buttons without a panel.
- **Yes:** the small pills go in the centre of the shell, between the D-pad and A/B (user decision). See the next point for portrait.
- **Yes (game-jam decision, review it):** the pills stay in the centre only when the shell is wide enough (landscape). At 375 px the D-pad and A/B already take the full width of the shell (about 342 px of 343), so in portrait they move to a full-width row under the pad. **No:** shrinking the D-pad or A/B below the reference's mobile sizes to make room.
- **Yes (game-jam decision, review it):** A and B draw only their letter, as the reference does, and `name` stays as the aria-label. **No:** keeping words like `FIRE` on the big buttons, which the reference does not have.
- **Yes (game-jam decision, review it):** the tap target minimum goes from 56 px (SPEC 12) to **44 px** for D-pad keys and pills, and **64 px** for A and B, because the reference keys are 46–50 px and cannot be 56 px in a cross of adjacent keys. **No:** enlarging the D-pad, which would not match the reference. This replaces the 56 px criterion of SPEC 12 for these buttons.
- **Yes:** keep `data-pressed` as the pressed state instead of the reference's `.on` class, so the existing press logic does not change. **No:** renaming it.
- **No:** `:hover` styles, since a finger has no hover, and no `.on` keyboard highlight, since the games read the real keyboard.
- **Yes:** the gem pulse stops under `prefers-reduced-motion`. **No:** an always-on animation.
- **No:** touching `game-player.tsx` or `public/games/`: the pad is a drop-in replacement of `TouchControls`.

---

## Risks

| Risk                                                                                                                                                          | Mitigation                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A and B only show a letter, so a new player does not know that A is fire or B is pause.                                                                       | The `controls` line under the pad stays, and `name` is the aria-label. A caption (for example the name under the button) is a small follow-up spec if it turns out to confuse.        |
| `asteroids` and `brick-buster` have a cyan accent, so A and B are both cyan and look alike. `drop` has a magenta accent, so A is magenta as in the reference. | The letters differ and B is on the left. If it is hard to tell apart on a phone, B can be fixed to another color in a follow-up.                                                      |
| The pad is taller than the SPEC 12 clusters (shell padding, 156 px D-pad, a second row of pills), and on a short phone it may go under the fold.              | Steps 4 and 5 check 375×812 and 412×915. The D-pad drops to the 144 px mobile size under 620 px. If it still does not fit, the `extra` row is the first thing to shrink.              |
| The extra row of pills in portrait makes the `drop` and `brick-buster` pads taller than the `asteroids` and `snake` ones.                                     | Accepted, since the content differs. The pill row is thin (44 px).                                                                                                                    |
| D-pad keys of 46 px are under the 56 px of SPEC 12, so taps can miss a direction.                                                                             | They are separated by 3–7 px, as in the reference, and a held key uses pointer capture. If real-phone play shows misses, raise the key size in a follow-up and accept a bigger cross. |
| `color-mix` for the dark side of A's gradient does not work in an old mobile browser.                                                                         | The existing code already uses `rgba(var(--av-touch-rgb), …)`. Use that pattern, and avoid `color-mix` unless step 4 shows it works on the target phones.                             |
| Replacing the `TouchControls` type breaks code that still reads `layout` or `actions`.                                                                        | Step 2 lists the readers, and the type check and `lib/games.test.ts` fail if one is left.                                                                                             |
| Emulation in desktop Chrome does not reproduce the real shadows, safe areas and multi-touch of a phone.                                                       | Step 7 requires a run on a real phone.                                                                                                                                                |

---

## What is **not** in this spec

- Changes to the games, the bridge, the readers or the key allowlist.
- Moving the pad, changing when it shows, or redesigning the Pause and Exit row.
- Pad themes, a light variant, haptics, sound or swipes.
- A caption for A and B.
- Desktop gamepad rendering, gamepad API support or key remapping.

Each one of those, if it lands, goes in its own spec.
