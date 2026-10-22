# SPEC 14 — Game performance: measure, then fix

> **Status:** Approved
> **Depends on:** SPEC 05, SPEC 09, SPEC 10, SPEC 11, SPEC 12, SPEC 13, SPEC GJ froggy-01 (`specs/game-jam/froggy/01-froggy-core.md`)
> **Date:** 2026-10-22
> **Objective:** Measure the frame time, input latency, memory growth and CPU load of the five catalog games and of the host page that embeds them, and fix what is over budget so each game runs at 60 FPS on desktop and at 50 FPS or more on a real phone without changing how it plays or looks.

---

## Why this spec exists

The user reports performance problems in Froggy and, possibly, in the other games, on desktop and on a phone. The symptoms, all four:

- Low or uneven FPS.
- Input lag (a hop, a key, or a touch button answers late).
- The game degrades the longer it runs.
- The device heats up or drains the battery.

Nothing has been measured yet, so the cause is not known. A first read of the code gives **suspects, not findings**:

- **Canvas glow.** Every game sets `ctx.shadowBlur` for many shapes per frame. `shadowBlur` is one of the most expensive canvas operations. Count of `glow`/`shadowBlur`/`shadowColor` lines in each `game.js`: `froggy` 20, `asteroids` 13, `snake` 11, `brick-buster` 8, `drop` 6. Froggy also creates 3 gradients, and the neon skin has the most glow.
- **Static scenery redrawn every frame.** Froggy draws the whole board (lanes, water, road, pads) on every `requestAnimationFrame`, even on the title, dead, cleared and game over screens, where only a few things move.
- **Host cost on top of the game.** The game runs inside an iframe under a `.av-crt-screen::after` overlay (a `repeating-linear-gradient` scanline layer plus an inset `box-shadow`), scaled with CSS `zoom` (`fitToFrame()`), and the touch pad uses `drop-shadow` filters on pressed keys. The bridge wraps `requestAnimationFrame` and runs `JSON.stringify` of the state every 200 ms.
- **Degradation over time.** A first look at `froggy/game.js` shows no listener or array that grows per frame, so this symptom may come from somewhere else (other games, the host, GC pressure from per-frame allocations). It must be measured with a long run before anything is changed.

The user decided the shape of this work: all five games and the host in one spec, **measure all first, then fix by priority**, and the look may change only if nobody can see it.

---

## Scope

**In:**

- `references/performance-baseline.md` (new): the measuring protocol, the console snippet for the frame-time counter, and two tables, **before** and **after**, with one row per game and one row for the host. It is the memory of this spec; the product gets no new code for measuring.
- Measuring, with Chrome DevTools, of `froggy`, `asteroids`, `drop`, `brick-buster` and `snake`, each one **standalone** (`/games/<id>/index.html`) and **inside the host** (`/game/<id>/play`), on desktop and on the user's real phone.
- Fixes in the places the baseline marks as over budget. Candidate places, only touched if the table points to them:
  - `public/games/<id>/game.js` and `index.html`: the drawing code and per-frame allocations (for example: set `shadowBlur` once per batch of shapes and reset it to 0 for shapes without glow, cache static layers on an offscreen canvas, create gradients once per palette change instead of once per frame, avoid new objects/arrays/strings in the loop, skip the repaint of a frozen screen).
  - `public/games/bridge.js`: only the cost of the rAF wrapper and the `report()` polling. The public contract does not change.
  - `app/globals.css`: the CRT overlay and the `av-touch-*` effects, if they are costly on a phone.
- A soak test of 10 minutes per game to look for growth in memory and in frame time.
- `CLAUDE.md`: a short note on how to measure (pointer to the reference file) and any rule that came out of the work (for example "a game must not call `shadowBlur` for shapes without glow").

**Out of scope (for future specs):**

- Gameplay, difficulty, scoring, level design, hitboxes, timing constants or anything the player can feel as "the game changed".
- New skins, new themes, or a visible simplification of the glow. Only a change nobody can see is allowed.
- The `readers` map, the global state variable names, the messages of the bridge protocol and the `KEYS` allowlist. They stay as they are.
- A high-DPI (`devicePixelRatio`) canvas, a quality setting for the player, adaptive quality, or an FPS counter inside the product.
- `lib/`, `app/game/[id]/play/game-player.tsx` behavior, `components/ui/game.tsx`, Supabase, scores and credits. If the baseline shows the host React code is a real cost, that goes to its own spec.
- Service workers, PWA, and any bundle-size work on the Next.js pages (this spec is about the running game, not page load).
- Games that are not in `GAMES` (the `rocks` folder stays untouched).

---

## Data model

No new persistence and no new types. The only new file is documentation.

`references/performance-baseline.md` has this shape:

```
# Performance baseline

## Protocol
- Browser, version, machine, phone model and browser (filled by the user).
- Desktop: Chrome, DevTools Performance panel, CPU throttle 1x and 4x, 60 s trace with real play.
- Frame counter: a snippet pasted in the DevTools console of the iframe context, which records
  the time between rAF calls and prints avg FPS, p50, p95 and the number of frames over 33 ms.
- Input latency: keydown timestamp to the timestamp of the next paint, from the trace.
- Soak: 10 min of play, JS heap after a forced GC at minute 1 and at minute 10, and p95 at minute 1 and 10.
- Phone: the same counter, read from remote debugging (Chrome on Android, or Safari Web Inspector on iOS).

## Before / After tables (one row per game plus HOST)
| Target | Where | CPU | avg FPS | p95 frame ms | frames > 33 ms | latency (ms) | heap 1 min | heap 10 min | notes |
```

Budgets (the numbers the criteria use; the FPS targets were chosen by the user, the other three are proposed):

| Metric             | Budget                                                                         |
| ------------------ | ------------------------------------------------------------------------------ |
| Desktop frame time | p95 under 20 ms with CPU throttle 4x (60 FPS)                                  |
| Phone              | average of 50 FPS or more over 60 s of play                                    |
| Degradation        | p95 at minute 10 no more than 20 % over p95 at minute 1 (proposed)             |
| Memory             | heap after a forced GC at minute 10 no more than 20 % over minute 1 (proposed) |
| Input latency      | keydown to next paint within 2 frames (33 ms) at CPU 4x (proposed)             |
| Look               | no visible difference in the screenshots listed in the criteria                |

File layout (every code file is a **candidate**; the baseline decides which ones change):

```
references/performance-baseline.md   new: protocol and before/after tables
public/games/<id>/game.js            drawing and loop of the games over budget
public/games/<id>/index.html         only if a game's frame or CSS is the cost
public/games/bridge.js               only the rAF wrapper and the report() polling
app/globals.css                      only the CRT overlay and av-touch-* effects
CLAUDE.md                            how to measure, new rules
```

---

## Implementation plan

1. **Protocol and tooling.** Create `references/performance-baseline.md` with the protocol and the console snippet that counts frames. Check the snippet on one game before using it. Manual test: the snippet prints avg FPS, p50, p95 and frames over 33 ms on `/games/froggy/index.html`, and the numbers move when CPU throttle goes from 1x to 4x.
2. **Baseline, desktop.** For each of the five games, measure standalone and inside `/game/<id>/play` at CPU 1x and 4x with 60 s of real play, plus a Performance trace to split time into scripting, rendering and painting. Fill the **before** table. Manual test: all 5 games × 2 places × 2 CPU settings have a row, and the host row (the difference between standalone and embedded) is filled.
3. **Baseline, phone.** On the user's real phone, measure the same five games inside the host with touch controls, and note FPS, how hot the phone gets after 5 min, and the input lag of the pad. Manual test: five rows with phone model and browser, and the order of the games from worst to best.
4. **Soak.** Play or automate 10 min per game on desktop with CPU 4x. Take the heap after a forced GC at minute 1 and at minute 10, and p95 at the same minutes. Manual test: the table shows which games grow, if any, and a heap snapshot comparison names what grows.
5. **Prioritise.** From the tables, write in the reference file the list of the causes found, ordered by frame time saved per line changed, and mark each game and the host as **over** or **within** the budget. Manual test: every row over budget has at least one named cause with evidence (trace screenshot or number), and nothing is changed before this list exists.
6. **Fix the host and the bridge** if the list names them (CRT overlay, `drop-shadow` of the touch pad, rAF wrapper, `report()`), one change at a time, measuring after each. Manual test: the host row improves, `npm run lint` and `npm test` pass, and the bridge contract (`state` messages, `pause`/`resume`, `key`) works in all five games.
7. **Fix the games, worst first.** For each game over budget, apply the fixes of the list, one change at a time, re-measure after each, and keep only those that help. Look for pixel-identical output: compare a screenshot before and after in every skin the game has (dark theme), plus one in the light theme. Manual test per game: same screenshots, same behavior (a full run: start, score, lose a life, game over, restart, pause and resume from the host), and the game's row inside its budget.
8. **Input latency.** For any game where the baseline shows more than 2 frames from key to paint, find the cause (long frames, work done inside the key handler, a queue of messages) and fix it. Manual test: keyboard and touch pad on the real phone, the latency measured in the trace is inside the budget.
9. **Re-measure everything.** Repeat steps 2 to 4 for all games after the fixes and fill the **after** table. Manual test: every row meets the budgets, or the row has a written reason and a follow-up (see Acceptance criteria).
10. **Docs and checks.** Update `CLAUDE.md` (how to measure, rules learnt). Run `npm run lint`, `npm test` and `npm run build`. Manual test: all three pass, and `git diff` shows no change in `lib/`, `components/ui/game.tsx` and `app/game/[id]/play/game-player.tsx`.

---

## Acceptance criteria

- [ ] `references/performance-baseline.md` exists with the protocol, the console snippet, a **before** table and an **after** table that have one row for each of `froggy`, `asteroids`, `drop`, `brick-buster` and `snake` plus one for the host.
- [ ] The **before** table has desktop numbers (CPU 1x and 4x, standalone and embedded) and phone numbers for every game, and the soak numbers (minute 1 and minute 10) for every game.
- [ ] The list of causes exists before the first fix, and each row over budget has at least one cause with evidence.
- [ ] In the **after** table, every game has a p95 frame time under 20 ms at CPU throttle 4x on desktop, inside the host.
- [ ] In the **after** table, every game has an average of 50 FPS or more over 60 s on the user's real phone, inside the host with the touch pad.
- [ ] After 10 minutes of play, no game has a p95 frame time more than 20 % above its minute-1 p95, and its heap after a forced GC is no more than 20 % above its minute-1 heap.
- [ ] Keydown to next paint is within 2 frames at CPU 4x for every game, on the keyboard and on the touch pad.
- [ ] A game that cannot meet a budget has a written reason in the reference file and a follow-up item; no budget is silently dropped.
- [ ] Screenshots before and after, taken in every skin of each game in the dark theme and one in the light theme, show no visible difference.
- [ ] A full run of each game (start, score, lose a life, game over, restart, host Pause and Resume) behaves exactly as before, and the score is still reported to the host and saved.
- [ ] The `readers` in `bridge.js`, the global variable names they read, the `KEYS` allowlist and the message types are unchanged, and `lib/games.test.ts` passes without edits.
- [ ] `git diff` is empty for `lib/`, `components/ui/game.tsx`, `app/game/[id]/play/game-player.tsx` and `public/games/rocks/`.
- [ ] No measuring code, counter or debug flag is shipped in `public/games/` or in `app/`.
- [ ] `npm run lint`, `npm test` and `npm run build` finish without errors.
- [ ] `CLAUDE.md` points to the reference file and lists any new rule for the games.

---

## Decisions

- **Yes:** one spec for the five games and the host, measuring everything first and fixing by priority (user decision). **No:** one spec per game, six specs to maintain, and a split between host and games.
- **Yes:** measure with Chrome DevTools and a console counter whose code lives in the reference file (user decision). **No:** an FPS overlay or `?perf=1` mode inside the product, which is code to keep and ship, and eyeballing it, which cannot be checked.
- **Yes:** budgets are 60 FPS on desktop (p95 under 20 ms at CPU 4x) and 50 FPS or more on a real phone (user decision). **No:** a relative "30 % better", which would pass a game that is still slow.
- **Yes:** validate on the user's real phone (user decision). **No:** emulation only, which does not reproduce the GPU, heat or multi-touch.
- **Yes:** the look may change only when nobody can see it (user decision): cache, batch, reuse, skip redundant work. **No:** removing or lowering the neon glow, and any change to the palettes.
- **Yes (spec decision, review it):** the degradation and heap budgets (20 %) and the input budget (2 frames) are proposed by this spec, since the user gave only the FPS targets. Change them in review if they are too strict or too loose.
- **Yes:** fix only what the tables mark as over budget, and measure after each change. **No:** optimising by guess, or rewriting a game that is already inside its budget.
- **Yes:** measure each game standalone and inside the host, to separate the cost of the game from the cost of the iframe, the CRT overlay, the zoom and the touch pad.
- **Yes:** `public/games/bridge.js` may change only in its cost (rAF wrapper, polling), not in its contract. **No:** changing messages, readers or the allowlist.
- **No:** a `devicePixelRatio` canvas, adaptive quality or a quality setting, which are features and can make the cost higher.
- **No:** touching `game-player.tsx`: if the host React code shows up as a cost, it gets its own spec.

---

## Risks

| Risk                                                                                                                            | Mitigation                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The spec is wide (five games and the host), and the work may grow past one pass.                                                | Step 5 orders the causes by gain per line. A game inside its budget is not touched. A budget that cannot be met is written down and goes to a follow-up spec. |
| Desktop CPU throttle does not match a phone GPU, so a game passes in DevTools and fails on the phone.                           | Steps 3 and 9 require real-phone numbers, and the phone budget is a separate criterion.                                                                       |
| Batching `shadowBlur` or caching layers changes how the glow looks (overlap, clipping, colour).                                 | Step 7 compares screenshots in every skin, and a change that shows a difference is reverted.                                                                  |
| An offscreen cache must be rebuilt when the skin, the theme or the CSS zoom changes, and a missed rebuild leaves a stale board. | Rebuild in `refreshAppearance()` (Froggy) and the equivalent in each game, and test skin and theme switching during a run.                                    |
| Skipping repaints of a frozen screen breaks the repaint that `refreshAppearance()` does while the host has paused the loop.     | Skip only when nothing changed, never in `refreshAppearance()`, and test the skin toggle while paused.                                                        |
| A change in `bridge.js` affects all five games at once.                                                                         | One change at a time, a full run of every game after it, and no change to the contract.                                                                       |
| The CRT overlay or `drop-shadow` is the main cost and the only real fix is a visible one.                                       | Report it in the reference file as a decision for the user, with the numbers, instead of changing the look inside this spec.                                  |
| The degradation is caused by the browser (iframe, GC) or by the device temperature, not by our code.                            | The soak test measures heap and p95 separately, and the heat is noted on the phone. An effect without a cause in our code is recorded, not "fixed".           |
| `public/games/` is skipped by the format hook, so the edits there are not auto-formatted or linted.                             | Match the style of each file by hand and run the game after every change.                                                                                     |

---

## What is **not** in this spec

- Gameplay or feel changes of any kind.
- A visible simplification of skins, themes or glow.
- A high-DPI canvas, adaptive quality, a quality setting, or an FPS counter in the product.
- Changes to the bridge contract, the readers or the allowlist.
- Host React performance (`game-player.tsx`, `lib/`), page load and bundle size.
- Gamepad API, PWA or service workers.

Each one of those, if it lands, goes in its own spec.
