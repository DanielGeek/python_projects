# Quickstart: Manual Validation Guide

This feature has no automated tests (constitution Principle V). Validate it by running the app and
walking through the scenarios below.

## Prerequisites

- Node.js compatible with Next.js 16.4.5 and `npm install` completed.
- A modern browser. Clear the `doit:goals:v1` key (DevTools > Application > Local Storage) to start from an empty board.

## Run

```bash
npm install
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
| 1 | Open the app with no saved goals. | "Doit" header, "Add goal" button, two columns with friendly empty states (FR-001, FR-002, FR-015). |
| 2 | Click "Add goal", leave the title empty, submit. | Submission blocked with a clear message (FR-006). |
| 3 | Enter a title and pick yesterday's date, submit. | Blocked: choose today or later (FR-006). |
| 4 | Enter "Read one book" and a date 10 days ahead, submit. | Modal closes; goal appears on the left showing "10 days left", not highlighted (FR-003, FR-010). |
| 5 | Add a goal ending in 10 days, one ending in 2 days, and one ending today. | Goals appear ordered by end date, nearest first; goals with 3 days or less are highlighted (FR-010, FR-016). |
| 6 | Open the modal, press Escape; open it again and click outside. | Modal closes each time, no goal created (FR-011). |
| 7 | Check a goal's checkbox. | "Move to completed" and "Delete permanently" actions appear; unchecking hides them (FR-007). |
| 8 | Choose "Move to completed". | Goal leaves the left column and appears on the right with its title and today's date (FR-008). |
| 9 | Check another goal, choose "Delete permanently", then cancel the confirmation. | Goal stays unchanged (FR-009). |
| 10 | Repeat and confirm the deletion. | Goal disappears from both columns (FR-009). |
| 11 | Reload the page. | Both columns show the same goals as before (FR-012). |
| 12 | Resize from 360 px to 1920 px wide. | Columns stack on narrow screens and sit side by side on wide ones; no horizontal scroll (FR-013). |
| 13 | Tab through the page with the keyboard. | Every control is reachable with a visible focus ring; dialogs trap focus. |
| 14 | In DevTools, set `doit:goals:v1` to `not json` and reload. | App shows an empty board and does not crash. |
| 15 | Starting from an empty board, time yourself adding a goal, then checking it and moving it to completed. Review every button and field for a plain-text label. | Adding takes under 20 seconds (SC-001); completing takes under 5 seconds (SC-002); no icon-only controls, so a first-time user needs no instructions (SC-006). |

## References

- Data model: [data-model.md](data-model.md)
- Storage contract: [contracts/storage.md](contracts/storage.md)
- Requirements: [spec.md](spec.md)
