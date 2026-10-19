# SPEC 07 — Hall of Fame tabs wrap

> **Status:** Implemented
> **Depends on:** SPEC 05, SPEC 06
> **Date:** 2026-10-19
> **Objective:** Make the nine game tabs of `/hall-of-fame` wrap onto several rows so all of them are visible without scrolling sideways.

---

## Why this spec exists

Since SPEC 05 the catalog has nine games, and `/hall-of-fame` shows one tab per game. The tabs do not fit in the 820 px container (`.av-hof`). `.av-tabs` has `overflow-x: auto` with the scrollbar hidden (`scrollbar-width: none`), so `Asteroids`, `Froggy` and `Pixel Duel` are cut off with no hint that the row scrolls. The tabs can still be reached with horizontal scroll or with the arrow keys, but a visitor does not see that those games exist.

This is a bug found by the user while testing SPEC 06. It is not caused by SPEC 06 (`components/ui/interactive.tsx` was not touched there), so it gets its own spec.

---

## Scope

**In:**

- On `/hall-of-fame` only, the tab row wraps onto as many rows as it needs, so the nine tabs are always visible.
- A CSS rule scoped to `.av-hof`, in `app/globals.css`. No change to the `Tabs` component or to its props.
- The selected tab still shows its underline, and the keyboard navigation still works.

**Out of scope (for future specs):**

- Any change to `.av-tabs`, `.av-tab` or the `Tabs` component. They are shared: `app/login/auth-card.tsx` also uses `Tabs`, and it keeps its current look.
- A single-row design with visible scroll cues (edge fade, scroll the active tab into view). Discarded for now, see Decisions.
- Other layout changes in the Hall of Fame (podium, table, spacing, container width).
- Changes to the games catalog or to the data.

---

## Data model

This feature introduces no new data structures. It only changes CSS.

Rule to add in `app/globals.css`, next to the other `.av-hof` rules:

```css
.av-hof .av-tabs {
  flex-wrap: wrap;
  overflow-x: visible;
}
```

Conventions:

- The scope is the `.av-hof` ancestor, so any other `Tabs` keeps `overflow-x: auto` and a single row.
- `overflow-x: visible` is needed as well as `flex-wrap`: the active underline is drawn at `bottom: -2px` (`.av-tab::after`) and must not be clipped.
- Rows of a wrapped tab bar use the existing `gap` (`var(--space-1)`) between tabs. No new tokens.
- The container keeps its `border-bottom: 2px solid var(--line)` under the last row.

File layout:

```
app/globals.css    adds the .av-hof .av-tabs rule
```

---

## Implementation plan

1. **Add the rule.** Add `.av-hof .av-tabs` next to `.av-hof` in `app/globals.css`. Manual test: `npm run dev`, open `/hall-of-fame` at 1280 px wide; all nine tabs are visible, with no horizontal scroll on the tab bar.
2. **Check the states.** Manual test: select a tab on each row. The underline shows under the selected tab and is not cut off. Press `ArrowRight` and `ArrowLeft` and see the selection and focus move through all nine tabs, wrapping from the last to the first.
3. **Check narrow widths.** Manual test at 768 px and 375 px: all tabs stay visible, there is no horizontal page scroll, and the podium and table below keep their layout.
4. **Check the other `Tabs`.** Manual test: `/login` looks the same as before (sign in / sign up tabs on one row).

---

## Acceptance criteria

- [x] On `/hall-of-fame` at 1280 px, the tabs `Brick Buster`, `Drop`, `Serpent`, `Muncher`, `Invaders`, `Rocks`, `Asteroids`, `Froggy` and `Pixel Duel` are all visible without scrolling the tab bar.
- [x] At 375 px and 768 px the nine tabs are also all visible, and the page has no horizontal scroll.
- [x] The tab bar has no horizontal scrollbar and its `overflow-x` is `visible` on `/hall-of-fame`.
- [x] The selected tab shows its cyan underline, whichever row it is on, and the underline is not clipped.
- [x] `ArrowRight` and `ArrowLeft` move the selection through the nine tabs and loop from the last to the first, as before.
- [x] Switching tabs still loads the right scores, and the page height does not change between loading, error, empty and data states (SPEC 06 behavior is kept).
- [x] `/login` still shows its tabs on one row, unchanged.
- [x] `components/ui/interactive.tsx` and `app/hall-of-fame/hall-of-fame.tsx` have no edits (`git diff` is empty for them).
- [x] `npm run lint`, `npm test` and `npm run build` finish without errors.

---

## Decisions

- **Yes:** wrap the tabs onto several rows (user decision, option 1). It shows all nine games at once and needs one CSS rule. **No:** a single row with scroll cues (edge fade and scrolling the active tab into view). It keeps the current look but needs a client-side scroll effect and more code for the same goal.
- **Yes:** scope the rule to `.av-hof`. The user only reported the Hall of Fame, and `Tabs` is shared with `/login`, where two tabs fit and a change would risk its look. **No:** changing `.av-tabs` globally.
- **Yes:** CSS only, with no new prop or modifier class on `Tabs`. The Hall of Fame is the only page that needs it today. If a second page needs wrapping tabs, a `wrap` prop is a better home and goes in its own spec.
- **Yes:** this is a separate spec and branch (`bugfix/hall-of-fame-tabs-wrap`), not an edit to SPEC 06. SPEC 06 is already implemented and merged, and the bug does not come from it.
- **Yes:** quick definition without detailed clarification. The user chose the approach directly and the scope to `.av-hof` follows the recommendation given when the bug was reported.

---

## Risks

| Risk                                                                                           | Mitigation                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| The `::after` underline of a tab in the first row overlaps the tabs of the second row by 2 px. | Checked in step 2. If it shows, add a small `row-gap` to the scoped rule.                   |
| On narrow screens the tabs take three or more rows and push the podium down.                   | Accepted: all games stay reachable. The `.av-hof-results` min-height keeps the rest stable. |
| A new game makes the tab bar longer.                                                           | It wraps again, with no further change.                                                     |
| The `.av-hof` selector loses to a more specific rule on `.av-tabs` added later.                | The acceptance criteria check the computed `overflow-x`, so a regression is visible.        |

---

## What is **not** in this spec

- Changes to the `Tabs` component, `.av-tabs` or `.av-tab`.
- A scrollable single row with scroll cues.
- Any change to `/login` or any other page.
- Layout, data or catalog changes in the Hall of Fame.

Each one of those, if it lands, goes in its own spec.
