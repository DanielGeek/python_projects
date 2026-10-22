# Mobile porting status

Memory of the `mobile-porter` subagent (`.claude/agents/mobile-porter.md`). One row per route the user asked it to check. A route with no row was never requested.

Cells: `ok`, `fixed`, `issue` or `not checked`.

| Route | 375×812 | 412×915 | Landscape | Desktop 1280 | Last run | Notes |
| ----- | ------- | ------- | --------- | ------------ | -------- | ----- |
| `/game/froggy` | not checked | not checked | not checked | not checked | 2026-10-22 | No screenshots: Playwright package not installed. Static audit of `av-detail-*`, `av-stats`, `av-board`, `av-btn` at 343px content width: single column below 860, tags/stars/actions wrap, no overflow found. No CSS changed. Shared navbar `.av-burger` is 40×40 (< 44) on every route: not changed, needs the user's go-ahead since it touches all routes. |
| `/game/froggy/play` | not checked | not checked | not checked | not checked | 2026-10-22 | No screenshots (Playwright missing). Fixes in `app/globals.css`: `.av-touch-mini::after` hit area to 44px tall inside `(pointer: coarse)` (row stays 32px thin); `.av-modal-scrim` scrolls from the top under `(max-height: 520px)` (final-score modal was ~460px tall and cut off in phone landscape; `Modal` is only used by the player). Known: pad body overflows its padding by 1px at 375 (dpad 144 + gap 14 + A/B 144 = 302 vs 301), invisible, no page scroll. For `/spec`: the game's own skin/theme toolbar is ~9px tall at the 319×239 frame (zoom 0.40), untappable on a phone (`public/games/froggy/`); landscape CRT is ~610px tall at 812×375, so screen and pad never fit together (SPEC 12 leaves landscape untuned). |
