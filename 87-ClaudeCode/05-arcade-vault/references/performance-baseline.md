# Performance baseline

Memory of SPEC 14 (`specs/14-game-performance.md`). Not part of the build. The measuring code lives here and is never shipped in `public/games/` or `app/`.

## Budgets

| Metric             | Budget                                                         |
| ------------------ | -------------------------------------------------------------- |
| Desktop frame time | p95 under 20 ms with CPU throttle 4x, inside the host          |
| Phone              | average 50 FPS or more over 60 s of play, with the touch pad   |
| Degradation        | p95 at minute 10 at most 20 % over p95 at minute 1             |
| Memory             | heap after a forced GC at minute 10 at most 20 % over minute 1 |
| Input latency      | keydown to next paint within 2 frames (33 ms) at CPU 4x        |
| Look               | no visible difference in before/after screenshots              |

## Protocol

- **Machine:** _(browser and version, computer)_
- **Phone:** _(model, OS, browser and version)_
- **Desktop:** Chrome. Targets are measured **standalone** (`/games/<id>/index.html`) and **inside the host** (`/game/<id>/play`). CPU throttle 1x and 4x (DevTools Performance panel, gear icon). 60 s of real play per row, with the title screen skipped and at least one lost life.
- **Trace:** Performance panel, record the same 60 s, and split the main thread into Scripting, Rendering and Painting. Note the longest frames.
- **Frame counter:** paste the snippet below in the DevTools console. For a game inside the host, pick the iframe in the console context selector (the dropdown that says `top`) first. Read the result with `__perf.report()`.
- **Input latency:** in the trace, time from the `keydown` event to the end of the next frame that paints. On the phone, note it by feel and with the counter's long frames.
- **Soak:** 10 min of play per game at CPU 4x. At minute 1 and at minute 10 run `__perf.report()`, then force a GC (trash can icon in the Memory panel) and read the JS heap. Take a heap snapshot at both minutes if the heap grows.
- **Phone:** inspect remotely (Chrome on Android: `chrome://inspect`; Safari on iOS: Web Inspector), paste the same snippet in the iframe context. Note how hot the phone gets after 5 min.
- **Screenshots:** each skin the game has in the dark theme, plus one in the light theme, before and after, saved outside the repo.

### Frame counter snippet

Records the time between `requestAnimationFrame` calls. It uses the (bridge-wrapped) `requestAnimationFrame` of the page, so a host pause freezes it like the game. `__perf.report()` prints the stats of the frames recorded since it was pasted or since the last `reset`.

```js
(() => {
  if (window.__perf) window.__perf.stop();
  const times = [];
  let last = null;
  let id = 0;
  let running = true;
  function tick(t) {
    if (!running) return;
    if (last !== null) times.push(t - last);
    last = t;
    id = requestAnimationFrame(tick);
  }
  id = requestAnimationFrame(tick);
  const pct = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
  window.__perf = {
    reset() { times.length = 0; last = null; },
    stop() { running = false; cancelAnimationFrame(id); },
    report() {
      if (!times.length) return 'no frames yet';
      const s = [...times].sort((a, b) => a - b);
      const sum = times.reduce((x, y) => x + y, 0);
      const out = {
        frames: times.length,
        seconds: +(sum / 1000).toFixed(1),
        avgFps: +(1000 / (sum / times.length)).toFixed(1),
        p50: +pct(s, 0.5).toFixed(1),
        p95: +pct(s, 0.95).toFixed(1),
        over33: times.filter((x) => x > 33.4).length,
        heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : 'n/a',
      };
      console.table(out);
      return out;
    },
  };
  return 'perf counter running: __perf.report(), __perf.reset(), __perf.stop()';
})();
```

Notes: canvas drawing is recorded by JavaScript and rasterized later by the browser, so a script timer around `draw()` (about 0.1 ms for `froggy` in headless Chrome, which scales 4x and 8x with CPU throttle 4x and 6x) hides the real cost of `shadowBlur`. Trust the frame counter and the trace (Rendering and Painting rows) on a headed browser, and above all the real phone, not a timer around the draw call. The monitor refresh rate caps the FPS (a 60 Hz screen reads at most about 60). `performance.memory` only exists in Chrome. Frame times larger than 50 ms right after the page loads or after a host pause are not real, so call `__perf.reset()` after the game starts or resumes.

## Before

Desktop rows: Chrome 155 on an Apple M1 Max (real GPU), 1280×860 window, 10 s of scripted random play per row after a 1.5 s warm-up (the user asked for a short run, the protocol says 60 s; a game close to its budget gets a 60 s repeat), CPU throttle through CDP. Script: a throwaway Playwright runner outside the repo that presses random keys and records rAF intervals with the snippet above. Heap here is the whole renderer (host + iframe), not a forced-GC reading. Phone rows and the soak columns are filled in steps 3 and 4.

One row per game and place. `latency` is keydown to next paint in ms. Heap in MB after a forced GC.

| Target       | Where      | CPU | avg FPS | p95 ms | frames > 33 ms | latency | heap 1 min | heap 10 min | p95 10 min | notes |
| ------------ | ---------- | --- | ------- | ------ | -------------- | ------- | ---------- | ----------- | ---------- | ----- |
| froggy       | standalone | 1x  | 60      | 17     | 0              |         |            |             |            | max 17.8 ms, renderer heap 2.2 MB |
| froggy       | standalone | 4x  | 60      | 17.5   | 0              |         |            |             |            | max 17.7 ms, renderer heap 2.2 MB |
| froggy       | host       | 1x  | 60      | 16.8   | 0              |         |            |             |            | max 17.7 ms, renderer heap 16.5 MB |
| froggy       | host       | 4x  | 60      | 17.5   | 0              |         | 9.38       | 9.56        | 17.5       | max 17.8 ms, renderer heap 16.8 MB; soak: heap +1.9 % and p95 17.5→17.5 ms between minute 1 and minute 4, DOM nodes 389→389 |
| froggy       | phone      | -   | n/m     | n/m    | n/m            | n/m     |            |             |            | not measured: the user tested on an Android phone over the LAN and reported it plays fine, with no numbers |
| asteroids    | standalone | 1x  | 60      | 17.6   | 0              |         |            |             |            | max 17.7 ms, renderer heap 2.2 MB |
| asteroids    | standalone | 4x  | 60      | 17.5   | 0              |         |            |             |            | max 17.7 ms, renderer heap 2 MB |
| asteroids    | host       | 1x  | 60      | 17.7   | 0              |         |            |             |            | max 17.7 ms, renderer heap 15.7 MB |
| asteroids    | host       | 4x  | 60      | 17.5   | 0              |         | 9.16       | 9.32        | 17.5       | max 17.7 ms, renderer heap 15.8 MB; soak: heap +1.7 % and p95 17.6→17.5 ms between minute 1 and minute 4, DOM nodes 387→387 |
| asteroids    | phone      | -   | n/m     | n/m    | n/m            | n/m     |            |             |            | not measured: the user tested on an Android phone over the LAN and reported it plays fine, with no numbers |
| drop         | standalone | 1x  | 60      | 17.5   | 0              |         |            |             |            | max 20.3 ms, renderer heap 1.6 MB |
| drop         | standalone | 4x  | 60      | 17.4   | 0              |         |            |             |            | max 17.7 ms, renderer heap 2.2 MB |
| drop         | host       | 1x  | 60      | 17.6   | 0              |         |            |             |            | max 17.8 ms, renderer heap 16.4 MB |
| drop         | host       | 4x  | 60      | 17.4   | 0              |         | 8.75       | 8.83        | 17.5       | max 17.7 ms, renderer heap 15.4 MB; soak: heap +0.9 % and p95 17.5→17.5 ms between minute 1 and minute 4, DOM nodes 575→575 |
| drop         | phone      | -   | n/m     | n/m    | n/m            | n/m     |            |             |            | not measured: the user tested on an Android phone over the LAN and reported it plays fine, with no numbers |
| brick-buster | standalone | 1x  | 60      | 17.4   | 0              |         |            |             |            | max 17.8 ms, renderer heap 1.7 MB |
| brick-buster | standalone | 4x  | 60      | 17.4   | 0              |         |            |             |            | max 17.6 ms, renderer heap 2.2 MB |
| brick-buster | host       | 1x  | 60      | 17.3   | 0              |         |            |             |            | max 17.7 ms, renderer heap 15.6 MB |
| brick-buster | host       | 4x  | 60      | 17.5   | 0              |         | 9.35       | 9.54        | 17.5       | max 17.8 ms, renderer heap 16 MB; soak: heap +2.0 % and p95 17.5→17.5 ms between minute 1 and minute 4, DOM nodes 469→469 |
| brick-buster | phone      | -   | n/m     | n/m    | n/m            | n/m     |            |             |            | not measured: the user tested on an Android phone over the LAN and reported it plays fine, with no numbers |
| snake        | standalone | 1x  | 60      | 17.3   | 0              |         |            |             |            | max 18.5 ms, renderer heap 1.5 MB |
| snake        | standalone | 4x  | 60      | 17.5   | 0              |         |            |             |            | max 17.8 ms, renderer heap 1.6 MB |
| snake        | host       | 1x  | 60      | 17.3   | 0              |         |            |             |            | max 17.7 ms, renderer heap 17.8 MB |
| snake        | host       | 4x  | 60      | 17.4   | 0              |         | 9.21       | 9.34        | 17.5       | max 17.6 ms, renderer heap 15.5 MB; soak: heap +1.4 % and p95 17.5→17.5 ms between minute 1 and minute 4, DOM nodes 394→404 |
| snake        | phone      | -   | n/m     | n/m    | n/m            | n/m     |            |             |            | not measured: the user tested on an Android phone over the LAN and reported it plays fine, with no numbers |

**HOST** (cost of the iframe, CRT overlay, zoom and touch pad) = host minus standalone, per game:

| Game         | Δ avg FPS | Δ p95 ms | notes |
| ------------ | --------- | -------- | ----- |
| froggy       | 0         | about 0  | host and standalone both at 60 FPS on the M1 Max, no cost visible |
| asteroids    | 0         | about 0  | host and standalone both at 60 FPS on the M1 Max, no cost visible |
| drop         | 0         | about 0  | host and standalone both at 60 FPS on the M1 Max, no cost visible |
| brick-buster | 0         | about 0  | host and standalone both at 60 FPS on the M1 Max, no cost visible |
| snake        | 0         | about 0  | host and standalone both at 60 FPS on the M1 Max, no cost visible |

Extra reading, same script and same froggy page on Chrome for Testing (software rasterization, no GPU), 8 s, CPU 1x: standalone 17 FPS (p95 67 ms), inside the host 8.8 FPS (p95 133 ms). With `shadowBlur` turned into a no-op by an init script: standalone 30 FPS, host 11 FPS. Reading: the glow is a large part of the raster cost, and the host adds a cost of its own. This is what a device without a strong GPU may look like; the real phone (step 3) decides.

Soak (step 4): **4 minutes instead of 10** (the user capped every task at 5 minutes), the 5 games in parallel (one Chrome context each, inside the host, CPU 4x, scripted random play), a window every 20 s with a forced GC (`HeapProfiler.collectGarbage`) and the JS heap from `Performance.getMetrics`. In the soak columns, `heap 1 min` is the reading at 60 s, `heap 10 min` and `p95 10 min` are the readings at **240 s** (not 600 s). The games ran in parallel on the same GPU, so the FPS of that run is not a clean measure (the windows show 58 to 60), only the trend is. Result: no game degrades, p95 stays at 17.5 ms and the heap grows 0.8 to 1.9 % in 3 minutes (flattening). `snake` adds about 14 DOM nodes over the run (390 to 404); small, and worth a look in step 5 only if the 10-minute question comes back.

Phone (step 3): **skipped by the user decision, no measurements** (`n/m`). The phone loaded the host and the touch pad over the LAN (`allowedDevOrigins` from `NEXT_PUBLIC_LOCAL_URL`) and the user reported it ok by feel. The 50 FPS phone budget is therefore **unverified**, not met.

## Causes found

Status against the budgets, measured on Chrome 155 with a real GPU: **all five games and the host are within budget** (60 FPS, p95 about 17.5 ms at CPU 4x, no degradation in 4 minutes). The phone is not measured (`n/m`), so the 50 FPS budget is unverified.

The causes below come from a **stress run**: Chrome for Testing without a GPU (software rasterization, 1x CPU, 5 s per case, scripted play), which stands in for a device with a weak GPU. Numbers are avg FPS in that run. They rank what to fix if the phone is slow; none of them breaks a desktop budget today.

| # | Where | Cause | Evidence (stress run) | Expected gain | Fix that keeps the look |
| - | ----- | ----- | --------------------- | ------------- | ----------------------- |
| 1 | Host, `app/globals.css` `.av-backdrop-floor::before` (used by `Backdrop` in `components/ui/basics.tsx`, behind every page) | A fixed, full-viewport perspective grid with `mask-image` animates `background-position` (`av-floor`, 8 s, infinite). That property is not compositor-only, so the layer is repainted every frame behind the game. | Stopping only this animation in the host: `drop` 12.9 → 60 FPS, `asteroids` 16.5 → 33, `froggy` 9.2 → 12.7. Stopping every CSS animation gave the same for `drop` (60) and `asteroids` (33), so this one is the cost. Hiding the layer instead of stopping it: same numbers. On a GPU desktop it is not visible. | Large on weak GPUs, hits all five games | Move the scroll to a `transform: translateY()` on a tall tile (compositor only) or give the layer `will-change: transform` and animate a transform, same speed and pattern |
| 2 | `froggy`, `public/games/froggy/game.js` | `shadowBlur` on every glowing shape each frame (20 `glow`/`shadowBlur` sites) plus the full board redrawn every frame. | Standalone with `shadowBlur` turned into a no-op: 17 → 30 FPS. The other four games run at 60 FPS standalone with their glow on, so glow is only a problem in Froggy. | About 2x on weak GPUs, Froggy only | Draw the static scenery (lanes, water, road, pads) once into an offscreen canvas and rebuild it on skin, theme and zoom change; set the glow only for the shapes that need it |
| 3 | `asteroids` (and probably the others) in the host, **not attributed** | With cause 1 removed the host still runs at 33 FPS against 60 standalone. Removing `.av-backdrop-scan` (35 FPS) and the CRT box-shadows (32 FPS) changes nothing. The remaining suspects are the iframe itself and the CSS `zoom` of `fitToFrame()` (the 800×600 canvas is scaled down inside the smaller frame). | Not measured yet; listed so it is not forgotten | Unknown | Measure `fitToFrame()` off, and standalone at the iframe size, before touching anything |

**Fixed (step 6, cause 1), by user decision:** the floor grid is paused on the play route only: `.av-app:has(.av-player) .av-backdrop-floor::before { animation-play-state: paused; }` in `app/globals.css`. Checked in the browser: `paused` on `/game/<id>/play`, `running` on `/`, `/library`, `/about`, `/game/<id>` and `/hall-of-fame`. No-GPU stress run, host, 5 s, avg FPS before → after: `froggy` 9.2 → 11.8, `asteroids` 16.5 → 30.2, `drop` 12.9 → 60, `brick-buster` 16.8 → 33.7, `snake` 16.1 → 30.8. The only visible change: the grid stands still behind the game. Note for dev: after a `git stash` or `git checkout` of `app/globals.css` the dev server may keep serving old CSS; a real edit of the file wakes it.

**Tried and reverted (step 6, cause 1):** the floor grid animated with a `transform` (an outer plane with the perspective, mask and opacity, plus an inner grid that slides one 60 px tile; two new `div` in `ArcadeBackdrop`). Look: pixel-identical on `/library` and `/about` (0 differing px) and inside the noise on `/`. Speed: **no gain** in the no-GPU stress run, three alternating A/B runs, host, 5 s each: old CSS `drop` 12.2 and 12.3 FPS, new 12.6, 11.1 and 10.7; old `asteroids` 14.8 and 16.1, new 15.8, 13.8 and 14.1 (the first old run of each pair is discarded: it overlapped the CSS reload and showed no floor at all, 60 and 34 FPS). Reading: without a GPU the browser recomposites the big masked 3D layer every frame whether it moves by repaint or by transform, so the transform only helps where a GPU does the compositing, and that cannot be measured here. Reverted, because SPEC 14 keeps only changes that measurably help. The only thing that gave the big gain was **not animating the floor at all** (drop 13 → 60 FPS), which changes the look and needs a user decision. The diff is saved outside the repo as `floor-transform.patch` in the session scratchpad; the recipe is the one in this paragraph.

Not measured, because the desktop run has no touch pointer and the phone is `n/m`: the `drop-shadow` filters and the pulsing gem of the touch pad (`av-touch-*`). They stay open until there is a phone number.

Rejected after measuring, with no change needed: the CRT scanline overlay (`.av-crt-screen::after`, removing it: no change in all five games), the bridge `report()` polling and rAF wrapper (the host run with them in place is the one that is fast once cause 1 is gone), and per-frame growth in any game (4-minute soak flat).

## After

Same table as **Before**, filled in step 9.

## Follow-ups

_Budgets that could not be met, with the reason._
