# Quickstart: Manual Validation Guide

This feature has no automated tests (constitution Principle V). Validate it by running the app and walking
through the scenarios below. Color roles and values: [contracts/color-roles.md](contracts/color-roles.md).

## Prerequisites

- `npm install` completed; a modern browser.
- Seed the board from the browser console (DevTools) so every status is visible. Dates are relative to today:

```js
const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toLocaleDateString("en-CA"); };
const g = (id, title, n, status = "current", completedAt = null) =>
  ({ id, title, endDate: d(n), status, createdAt: new Date().toISOString(), completedAt });
localStorage.setItem("doit:goals:v1", JSON.stringify([
  g("a", "Ten days away", 10), g("b", "Two days away", 2), g("c", "Due today", 0), g("d", "Overdue", -1),
  g("e", "A very long goal title that keeps going to check wrapping inside the card", 20),
  g("f", "Finished goal", -3, "completed", d(-4)),
])); location.reload();
```

## Run

```bash
npm run dev        # open http://localhost:3000
```

Quality gates before calling the feature done:

```bash
npm run lint
npm run build
```

## Walkthrough

| # | Steps | Expected outcome |
|---|-------|------------------|
| 1 | Open the seeded board. | Cream page, two white columns with soft borders, one violet "Add goal" button; nothing else violet except the checkbox and focus ring (FR-002, FR-003). |
| 2 | Compare the three goal states. | Due-soon cards are peach with a thick border, alarm icon and label; the 10-day and long-title goals are cream cards; the completed goal is soft green (FR-004, FR-005). |
| 3 | Look at the board in grayscale (DevTools > Rendering > Emulate vision deficiencies > Achromatopsia). | Due-soon is still distinguishable by border, icon and label (FR-005). |
| 4 | Clear the key and reload (`localStorage.removeItem("doit:goals:v1")`). | Both empty states are legible and use the same palette (US1 scenario 3). |
| 5 | Check a due-soon goal's checkbox. | Checkbox fills violet; "Move to completed" and "Delete permanently" show on the peach card and stay readable (US2 scenario 4). |
| 6 | Open "Add goal" and submit empty. | Error text is the danger color, readable on the white dialog; invalid inputs show it too (US3 scenario 1). |
| 7 | Tab through the page, both dialogs included. | Every control shows a full-strength violet ring with an offset, also on the filled violet button and on the peach card (FR-007, US3 scenario 2). |
| 8 | Open "Delete permanently" confirmation. | "Delete" uses the danger color on its soft fill; "Cancel" is neutral with a visible border (FR-008, US3 scenario 3). |
| 9 | Inspect contrast: DevTools > Elements > pick text/border > contrast ratio, for the pairs in [research.md](research.md). | Text at least 4.5:1; checkbox outline, input border and focus ring at least 3:1 (SC-001, SC-002). |
| 10 | Set the OS or browser to dark mode and reload. | App stays light, including the date picker popup (FR-010). |
| 11 | Resize from 360 px to 1920 px. | Layout identical to before; no horizontal scroll (SC-006). |
| 12 | Run `grep -rnE "#[0-9a-fA-F]{3,8}\b\|(sky\|mint\|lavender\|peach\|rose)-" components app --include='*.tsx'`. | No matches; hex values live only in the theme block of `app/globals.css` (FR-009, SC-005). |
| 13 | Show the old and new look side by side (`git stash` or the 001 branch) to 3 or more people and ask which they prefer. | Most prefer the new look (SC-004; informal check, not a gate for merging). |

## References

- Requirements: [spec.md](spec.md)
- Decisions and measured contrast: [research.md](research.md)
- Roles and status treatments: [data-model.md](data-model.md)
