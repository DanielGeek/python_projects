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

One row per game and place. `latency` is keydown to next paint in ms. Heap in MB after a forced GC.

| Target       | Where      | CPU | avg FPS | p95 ms | frames > 33 ms | latency | heap 1 min | heap 10 min | p95 10 min | notes |
| ------------ | ---------- | --- | ------- | ------ | -------------- | ------- | ---------- | ----------- | ---------- | ----- |
| froggy       | standalone | 1x  |         |        |                |         |            |             |            |       |
| froggy       | standalone | 4x  |         |        |                |         |            |             |            |       |
| froggy       | host       | 1x  |         |        |                |         |            |             |            |       |
| froggy       | host       | 4x  |         |        |                |         |            |             |            |       |
| froggy       | phone      | -   |         |        |                |         |            |             |            |       |
| asteroids    | standalone | 1x  |         |        |                |         |            |             |            |       |
| asteroids    | standalone | 4x  |         |        |                |         |            |             |            |       |
| asteroids    | host       | 1x  |         |        |                |         |            |             |            |       |
| asteroids    | host       | 4x  |         |        |                |         |            |             |            |       |
| asteroids    | phone      | -   |         |        |                |         |            |             |            |       |
| drop         | standalone | 1x  |         |        |                |         |            |             |            |       |
| drop         | standalone | 4x  |         |        |                |         |            |             |            |       |
| drop         | host       | 1x  |         |        |                |         |            |             |            |       |
| drop         | host       | 4x  |         |        |                |         |            |             |            |       |
| drop         | phone      | -   |         |        |                |         |            |             |            |       |
| brick-buster | standalone | 1x  |         |        |                |         |            |             |            |       |
| brick-buster | standalone | 4x  |         |        |                |         |            |             |            |       |
| brick-buster | host       | 1x  |         |        |                |         |            |             |            |       |
| brick-buster | host       | 4x  |         |        |                |         |            |             |            |       |
| brick-buster | phone      | -   |         |        |                |         |            |             |            |       |
| snake        | standalone | 1x  |         |        |                |         |            |             |            |       |
| snake        | standalone | 4x  |         |        |                |         |            |             |            |       |
| snake        | host       | 1x  |         |        |                |         |            |             |            |       |
| snake        | host       | 4x  |         |        |                |         |            |             |            |       |
| snake        | phone      | -   |         |        |                |         |            |             |            |       |

**HOST** (cost of the iframe, CRT overlay, zoom and touch pad) = host minus standalone, per game:

| Game         | Δ avg FPS | Δ p95 ms | notes |
| ------------ | --------- | -------- | ----- |
| froggy       |           |          |       |
| asteroids    |           |          |       |
| drop         |           |          |       |
| brick-buster |           |          |       |
| snake        |           |          |       |

## Causes found

_Filled in step 5, before the first fix. One line per cause: target, evidence (number or trace), expected gain, the line or file._

## After

Same table as **Before**, filled in step 9.

## Follow-ups

_Budgets that could not be met, with the reason._
