// Froggy: lane crosser on an 800x600 board (16x12 cells of 50 px). Classic script: the bridge reads
// score, lives, level and state. All art is drawn on the canvas; there are no image or audio files.
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d'); // `let`: stamp() swaps it for an offscreen context while it paints a sprite

const W = 800, H = 600, CELL = 50;
const PAD_X = [100, 250, 400, 550, 700];   // pad centres in the goal row
const PAD_HALF = 30;                       // a landing counts when |frog.x - PAD_X[i]| <= PAD_HALF
const TIME_LIMIT = 30;                     // seconds per attempt

let state = 'ready';                       // 'ready' | 'playing' | 'dead' | 'cleared' | 'gameover'
let score = 0, lives = 3, level = 1;
let frog = { x: 400, row: 11, fx: 400, frow: 11, hop: 1 }; // logical cell; fx, frow, hop only animate the drawing
let bestRow = 11;                          // highest row reached in this attempt, for the hop points
let timeLeft = TIME_LIMIT;                 // seconds
let pads = [false, false, false, false, false]; // filled pads of the current set
let lanes = [];                            // [{ row, kind, item, dir, speed, len, gap, n, period, items: [x] }]
let pause = 0;                             // seconds left of the dead / cleared screen
let laneByRow = {};                        // row -> lane, rebuilt with the lanes
let deathCause = '';                       // 'vehicle' | 'drowned' | 'carried off' while state is 'dead'

// ── Lanes ─────────────────────────────────────────────────────────────────────
// Each lane is a row of identical items that wrap around the screen. len is in cells, gap is the
// distance in px between the starts of two items, speed is in px per second at level 1.
const LANE_DEFS = [
  { row: 1,  kind: 'river', item: 'log',     dir: -1, speed: 110, len: 3, gap: 330 },
  { row: 2,  kind: 'river', item: 'log',     dir: 1,  speed: 75,  len: 2, gap: 220 },
  { row: 3,  kind: 'river', item: 'log',     dir: -1, speed: 90,  len: 4, gap: 380 },
  { row: 4,  kind: 'river', item: 'log',     dir: 1,  speed: 60,  len: 3, gap: 300 },
  { row: 6,  kind: 'road',  item: 'van',     dir: 1,  speed: 100, len: 2, gap: 330 },
  { row: 7,  kind: 'road',  item: 'scooter', dir: -1, speed: 150, len: 1, gap: 280 },
  { row: 8,  kind: 'road',  item: 'truck',   dir: 1,  speed: 70,  len: 3, gap: 400 },
  { row: 9,  kind: 'road',  item: 'van',     dir: -1, speed: 120, len: 2, gap: 300 },
  { row: 10, kind: 'road',  item: 'scooter', dir: 1,  speed: 90,  len: 1, gap: 250 },
];

function speedMul() {
  return Math.min(2.2, 1 + 0.12 * (level - 1));
}

// An item that leaves one side is fully off-screen before it re-enters on the other, so the
// pattern keeps the same gap across the seam: the period is a whole number of gaps that covers
// the screen plus one item.
function buildLanes() {
  lanes = LANE_DEFS.map((d) => {
    const n = Math.ceil((W + d.len * CELL) / d.gap);
    const period = n * d.gap;
    const base = (d.row * 97) % d.gap;
    const items = [];
    for (let i = 0; i < n; i++) items.push(-d.len * CELL + ((base + i * d.gap) % period));
    return { ...d, n, period, items };
  });
  laneByRow = {};
  for (const lane of lanes) laneByRow[lane.row] = lane;
}

// ── Hazards ───────────────────────────────────────────────────────────────────
const FROG_HALF = 18;                       // the frog's box is 36 px wide, centred on frog.x

function laneStep(lane, dt) {
  return lane.speed * speedMul() * lane.dir * dt;
}

// The log under the frog's centre in a river lane, or null.
function logUnder(lane, x) {
  for (const lx of lane.items) {
    if (x >= lx && x <= lx + lane.len * CELL) return lane;
  }
  return null;
}

// Why the frog dies where it stands, or '' when it is safe. Vehicles are as wide as they are drawn.
function hazardCause() {
  const lane = laneByRow[frog.row];
  if (!lane) return '';                     // goal, median and start rows
  if (lane.kind === 'road') {
    for (const vx of lane.items) {
      if (frog.x + FROG_HALF > vx + 3 && frog.x - FROG_HALF < vx + lane.len * CELL - 3) return 'vehicle';
    }
    return '';
  }
  if (frog.x < 0 || frog.x > W) return 'carried off';
  return logUnder(lane, frog.x) ? '' : 'drowned';
}

// Each death costs one life at once and shows the frog's fate for 0.9 s.
function killFrog(cause) {
  state = 'dead';
  deathCause = cause;
  lives = Math.max(0, lives - 1);
  pause = 0.9;
}

function checkHazards() {
  const cause = hazardCause();
  if (cause) killFrog(cause);
}

function updateLanes(dt) {
  const mul = speedMul();
  for (const lane of lanes) {
    const lo = -lane.len * CELL;
    const step = lane.speed * mul * lane.dir * dt;
    for (let i = 0; i < lane.items.length; i++) {
      const x = lane.items[i] + step - lo;
      lane.items[i] = lo + (((x % lane.period) + lane.period) % lane.period);
    }
  }
}

// ── Skins ─────────────────────────────────────────────────────────────────────
// A skin changes only colors, strokes, glow and fonts. colors(light) returns the palette of a theme;
// the hooks draw the board and the pieces. refreshAppearance() caches the palette in `pal`.
const FONT_MONO = 'monospace';
const FONT_CRT = '"Courier New", Courier, monospace';

const SKINS = {
  classic: {
    name: 'Classic',
    colors(light) {
      if (!light) {
        return {
          void: '#07070f', water: ['#0b1f4a', '#07142f'], ripple: 'rgba(120, 200, 255, 0.16)',
          hedge: '#0d3b2c', hedgeLeaf: '#14634a', padBg: '#07142f',
          lotus: '#ff6ec7', lotusFill: 'rgba(255, 110, 199, 0.35)',
          strip: '#121a2e', stripTile: '#1b2640', road: '#10101c', roadLine: 'rgba(232, 232, 255, 0.22)',
          vehA: '#00f0ff', vehB: '#ff2bd6', windscreen: 'rgba(7, 7, 15, 0.7)',
          headlight: '#ffee00', taillight: '#ff3860',
          logLight: '#1b7480', logDark: '#0f4a52', logRim: '#4fc3cf',
          logRing: 'rgba(190, 255, 240, 0.35)', logGlow: 'rgba(0, 240, 255, 0.35)',
          frog: '#ffd400', frogHi: '#fff68a', frogBelly: '#fff3a8', frogDark: '#1a1530',
          frogEdge: null, frogGlow: '#ffee00', frogShadow: 'rgba(0, 0, 0, 0.35)',
          text: '#e8e8ff', hud: '#00f0ff', timerTrack: 'rgba(232, 232, 255, 0.12)',
          timerA: '#00f0ff', timerB: '#ff2bd6',
          shade: '7, 7, 15', title: '#ffee00', prompt: '#ff2bd6', cta: '#00f0ff', cta2: '#ffee00',
          danger: '#ff3860', glow: 1, font: FONT_MONO,
        };
      }
      // Daylight board: light water, asphalt and sand; deeper vehicle colors and an ink edge on the
      // yellow frog so the pieces keep 3:1 on the light play area.
      return {
        void: '#eef1f7', water: ['#8fd0f5', '#5fb4e8'], ripple: 'rgba(255, 255, 255, 0.6)',
        hedge: '#9fd9a8', hedgeLeaf: '#5fae73', padBg: '#bfe6fa',
        lotus: '#a3006f', lotusFill: 'rgba(214, 51, 143, 0.35)',
        strip: '#e6e1d0', stripTile: '#f3efe2', road: '#c9ccd8', roadLine: 'rgba(26, 21, 48, 0.35)',
        vehA: '#006570', vehB: '#b0087f', windscreen: 'rgba(255, 255, 255, 0.6)',
        headlight: '#ffee00', taillight: '#ff5a78',
        logLight: '#1b7480', logDark: '#0f4a52', logRim: '#0b3a40',
        logRing: 'rgba(190, 255, 240, 0.5)', logGlow: 'rgba(0, 60, 70, 0.3)',
        frog: '#ffd400', frogHi: '#fff68a', frogBelly: '#fff3a8', frogDark: '#1a1530',
        frogEdge: '#1a1530', frogGlow: 'rgba(255, 212, 0, 0.6)', frogShadow: 'rgba(26, 21, 48, 0.25)',
        text: '#1a1530', hud: '#006570', timerTrack: 'rgba(26, 21, 48, 0.15)',
        timerA: '#00838f', timerB: '#b0087f',
        shade: '244, 246, 251', title: '#6b5000', prompt: '#b0087f', cta: '#006570', cta2: '#6b5000',
        danger: '#b00020', glow: 0.4, textGlow: 0, font: FONT_MONO,
      };
    },
    board: drawBoardSmooth,
    pad: drawPadClassic,
    log: drawLogClassic,
    vehicle: drawVehicleClassic,
    frog: drawFrogClassic,
    sittingFrog: drawSittingFrogClassic,
    lifeIcon: drawLifeClassic,
    post: null,
    stamp: true,
  },
  retro: {
    name: 'Retro',
    // CRT phosphor: amber in the dark theme, LCD green in the light one. Blocky fills, no gradients.
    colors(light) {
      if (!light) {
        return {
          void: '#150d00', water: ['#2a1a00', '#2a1a00'], ripple: '#5c3d00',
          hedge: '#3d2800', hedgeLeaf: '#7a5200', padBg: '#150d00',
          lotus: '#ffcc66', lotusFill: '#7a5200',
          strip: '#241600', stripTile: '#2e1d00', road: '#150d00', roadLine: '#7a5200',
          vehA: '#ffb000', vehB: '#cc8a00', windscreen: '#150d00',
          headlight: '#fff0b3', taillight: '#150d00',
          logLight: '#b37b00', logDark: '#6b4800',
          frog: '#fff0b3', frogDark: '#150d00', frogEdge: '#150d00',
          text: '#ffb000', hud: '#ffd966', timerTrack: '#3d2800', timerA: '#ffb000', timerB: '#fff0b3',
          shade: '21, 13, 0', title: '#ffcc33', prompt: '#fff0b3', cta: '#ffb000', cta2: '#ffcc33',
          danger: '#ff7a1a', glow: 0.35, font: FONT_CRT, scan: 'rgba(0, 0, 0, 0.24)',
        };
      }
      return {
        void: '#cfe0b4', water: ['#a9c787', '#a9c787'], ripple: '#8bac6f',
        hedge: '#9cb86a', hedgeLeaf: '#306230', padBg: '#cfe0b4',
        lotus: '#0f380f', lotusFill: '#8bac6f',
        strip: '#e3efd0', stripTile: '#d6e6bd', road: '#cfe0b4', roadLine: '#306230',
        vehA: '#306230', vehB: '#306230', windscreen: '#cfe0b4',
        headlight: '#e3efd0', taillight: '#0f380f',
        logLight: '#306230', logDark: '#0f380f',
        frog: '#0f380f', frogDark: '#e3efd0', frogEdge: '#e3efd0',
        text: '#0f380f', hud: '#306230', timerTrack: '#b5cc95', timerA: '#306230', timerB: '#0f380f',
        shade: '207, 224, 180', title: '#0f380f', prompt: '#0f380f', cta: '#306230', cta2: '#0f380f',
        danger: '#0f380f', glow: 0, font: FONT_CRT, scan: 'rgba(15, 56, 15, 0.08)',
      };
    },
    board: drawBoardRetro,
    pad: drawPadRetro,
    log: drawLogRetro,
    vehicle: drawVehicleRetro,
    frog: drawFrogRetro,
    sittingFrog: (cx, cy) => drawPixelFrogAt(cx, cy + 1, 3),
    lifeIcon: (cx, cy) => drawPixelFrogAt(cx, cy, 2.5),
    post: drawScanlines,
  },
  neon: {
    name: 'Neon',
    // The play area stays near-black in both themes; only the page around it changes.
    colors() {
      return {
        void: '#04040a', water: ['#060b1e', '#04081a'], ripple: 'rgba(0, 240, 255, 0.22)',
        hedge: '#03100b', hedgeLeaf: 'rgba(57, 255, 20, 0.28)', padBg: '#04040a',
        lotus: '#ff2bd6', lotusFill: 'rgba(255, 43, 214, 0.16)',
        strip: '#0a0a16', stripTile: '#0e0e1e', road: '#05050c', roadLine: 'rgba(0, 240, 255, 0.3)',
        vehA: '#00f0ff', vehB: '#ff2bd6', vehAFill: 'rgba(0, 240, 255, 0.14)', vehBFill: 'rgba(255, 43, 214, 0.14)',
        headlight: '#ffee00', taillight: '#ff3860',
        logLight: '#39ff14', logDark: 'rgba(57, 255, 20, 0.1)', logRing: 'rgba(57, 255, 20, 0.45)',
        frog: '#ffee00', frogFill: 'rgba(255, 238, 0, 0.16)', frogDark: '#04040a',
        text: '#e8ffff', hud: '#00f0ff', timerTrack: 'rgba(0, 240, 255, 0.12)', timerA: '#00f0ff', timerB: '#ff2bd6',
        shade: '4, 4, 10', title: '#ffee00', prompt: '#ff2bd6', cta: '#00f0ff', cta2: '#39ff14',
        danger: '#ff3860', glow: 1.4, font: FONT_MONO, frame: '#00f0ff',
      };
    },
    board: drawBoardSmooth,
    pad: drawPadNeon,
    log: drawLogNeon,
    vehicle: drawVehicleNeon,
    frog: drawFrogNeon,
    sittingFrog: drawSittingFrogNeon,
    lifeIcon: drawLifeNeon,
    post: drawNeonFrame,
    stamp: true,
  },
};

let skin = SKINS.classic;
let pal = SKINS.classic.colors(false);

// ── Drawing ───────────────────────────────────────────────────────────────────
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function glow(color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * pal.glow;
}

// Big overlay titles: a light theme can turn their glow off (a dark halo on a light board smudges).
function textGlow(color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * (pal.textGlow ?? pal.glow);
}

// The small frog that sits on a filled pad.
function drawSittingFrogClassic(cx, cy) {
  ctx.save();
  glow(pal.frogGlow, 8);
  ctx.fillStyle = pal.frog;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (pal.frogEdge) {
    ctx.strokeStyle = pal.frogEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = pal.frogDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * 6, cy - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPadClassic(cx, filled) {
  ctx.fillStyle = pal.padBg;
  rr(cx - 36, 4, 72, CELL - 4, 8);
  ctx.fill();
  ctx.strokeStyle = pal.lotus;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, 28, 24, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = pal.lotusFill;
  ctx.beginPath();
  ctx.ellipse(cx, 28, 15, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  if (filled) skin.sittingFrog(cx, 28);
}

function drawPadNeon(cx, filled) {
  ctx.save();
  glow(pal.lotus, 14);
  ctx.strokeStyle = pal.lotus;
  ctx.lineWidth = 2.5;
  rr(cx - 34, 6, 68, CELL - 8, 10);
  ctx.stroke();
  ctx.fillStyle = pal.lotusFill;
  ctx.beginPath();
  ctx.ellipse(cx, 28, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  if (filled) skin.sittingFrog(cx, 28);
}

// Board for the classic and neon skins: hedge, river gradient, ripples, strips and road lines.
function drawBoardSmooth(t) {
  // Goal row: a hedge with five pad notches.
  ctx.fillStyle = pal.hedge;
  ctx.fillRect(0, 0, W, CELL);
  ctx.fillStyle = pal.hedgeLeaf;
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(((i * 53) % W) + 4, 6 + ((i * 17) % 38), 6, 4);
  }

  // River: rows 1-4.
  const wg = ctx.createLinearGradient(0, CELL, 0, 5 * CELL);
  wg.addColorStop(0, pal.water[0]);
  wg.addColorStop(1, pal.water[1]);
  ctx.fillStyle = wg;
  ctx.fillRect(0, CELL, W, 4 * CELL);
  ctx.strokeStyle = pal.ripple;
  ctx.lineWidth = 2;
  for (let row = 0; row < 5; row++) {
    for (let k = 0; k < 9; k++) {
      const drift = (row % 2 ? 1 : -1) * t * 14;
      const x = (((k * 97 + row * 41 + drift) % (W + 80)) + (W + 80)) % (W + 80) - 40;
      const y = (row + 0.25 + (k % 3) * 0.22) * CELL;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 26, y);
      ctx.stroke();
    }
  }

  // Pads, drawn over the river edge of the hedge.
  for (let i = 0; i < PAD_X.length; i++) drawPad(i);

  // Median (row 5) and start (row 11).
  for (const row of [5, 11]) {
    ctx.fillStyle = pal.strip;
    ctx.fillRect(0, row * CELL, W, CELL);
    ctx.fillStyle = pal.stripTile;
    for (let x = 0; x < W; x += CELL) {
      ctx.fillRect(x + 2, row * CELL + 2, CELL - 4, CELL - 4);
    }
  }

  // Road: rows 6-10 with dashed lane lines.
  ctx.fillStyle = pal.road;
  ctx.fillRect(0, 6 * CELL, W, 5 * CELL);
  ctx.strokeStyle = pal.roadLine;
  ctx.lineWidth = 2;
  ctx.setLineDash([22, 18]);
  for (let row = 7; row <= 10; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * CELL);
    ctx.lineTo(W, row * CELL);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// Retro board: flat phosphor fills on a 4 px grid, dashed pixel ripples and blocky lane marks.
function drawBoardRetro(t) {
  ctx.fillStyle = pal.hedge;
  ctx.fillRect(0, 0, W, CELL);
  ctx.fillStyle = pal.hedgeLeaf;
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(Math.floor(((i * 53) % W) / 4) * 4 + 4, Math.floor((6 + ((i * 17) % 34)) / 4) * 4, 8, 4);
  }
  ctx.fillStyle = pal.water[0];
  ctx.fillRect(0, CELL, W, 4 * CELL);
  ctx.fillStyle = pal.ripple;
  for (let row = 1; row < 5; row++) {
    for (let k = 0; k < 9; k++) {
      const drift = (row % 2 ? 1 : -1) * t * 14;
      const x = (((k * 97 + row * 41 + drift) % (W + 80)) + (W + 80)) % (W + 80) - 40;
      const y = (row + 0.25 + (k % 3) * 0.22) * CELL;
      ctx.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, 24, 4);
    }
  }
  for (let i = 0; i < PAD_X.length; i++) drawPad(i);
  for (const row of [5, 11]) {
    ctx.fillStyle = pal.strip;
    ctx.fillRect(0, row * CELL, W, CELL);
    ctx.fillStyle = pal.stripTile;
    for (let x = 0; x < W; x += CELL) {
      if ((x / CELL) % 2 === 0) ctx.fillRect(x, row * CELL, CELL, CELL);
    }
  }
  ctx.fillStyle = pal.road;
  ctx.fillRect(0, 6 * CELL, W, 5 * CELL);
  ctx.fillStyle = pal.roadLine;
  for (let row = 7; row <= 10; row++) {
    for (let x = 8; x < W; x += 40) ctx.fillRect(x, row * CELL - 2, 20, 4);
  }
}

function drawPadRetro(cx, filled) {
  ctx.fillStyle = pal.padBg;
  ctx.fillRect(cx - 32, 4, 64, CELL - 4);
  ctx.fillRect(cx - 36, 8, 72, CELL - 8);
  // A stepped lotus ring: two 4 px frames, the inner one in the dim tone.
  ctx.fillStyle = pal.lotus;
  ctx.fillRect(cx - 20, 14, 40, 4);
  ctx.fillRect(cx - 20, 38, 40, 4);
  ctx.fillRect(cx - 24, 18, 4, 20);
  ctx.fillRect(cx + 20, 18, 4, 20);
  ctx.fillStyle = pal.lotusFill;
  ctx.fillRect(cx - 12, 24, 24, 8);
  if (filled) skin.sittingFrog(cx, 28);
}

// Classic logs: teal gradient with growth rings. The rim keeps the log edge at 3:1 on the water.
function drawLogClassic(x, row, len) {
  const w = len * CELL - 4, y = row * CELL + 7, h = CELL - 14;
  ctx.save();
  glow(pal.logGlow, 10);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, pal.logLight);
  g.addColorStop(1, pal.logDark);
  ctx.fillStyle = g;
  rr(x + 2, y, w, h, 9);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = pal.logRim;
  ctx.lineWidth = 2;
  rr(x + 3, y + 1, w - 2, h - 2, 8);
  ctx.stroke();
  // Growth rings.
  ctx.strokeStyle = pal.logRing;
  ctx.lineWidth = 2;
  for (let k = 0; k < len; k++) {
    const cx = x + k * CELL + CELL / 2;
    ctx.beginPath();
    ctx.ellipse(cx, y + h / 2, 9, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, y + h / 2, 4, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawLogRetro(x, row, len) {
  const w = len * CELL - 4, y = row * CELL + 8, h = CELL - 16;
  const l = Math.round((x + 2) / 2) * 2;
  ctx.fillStyle = pal.logLight;
  ctx.fillRect(l + 4, y, w - 8, h);
  ctx.fillRect(l, y + 4, w, h - 8);
  // Bark grain and square end rings.
  ctx.fillStyle = pal.logDark;
  ctx.fillRect(l + 12, y + 6, w - 28, 4);
  ctx.fillRect(l + 20, y + h - 10, w - 32, 4);
  for (let k = 0; k < len; k++) {
    const cx = l + k * CELL + CELL / 2 - 2;
    ctx.fillRect(cx - 6, y + h / 2 - 4, 12, 8);
    ctx.fillStyle = pal.logLight;
    ctx.fillRect(cx - 2, y + h / 2 - 2, 4, 4);
    ctx.fillStyle = pal.logDark;
  }
}

function drawLogNeon(x, row, len) {
  const w = len * CELL - 4, y = row * CELL + 8, h = CELL - 16;
  ctx.save();
  glow(pal.logLight, 10);
  ctx.fillStyle = pal.logDark;
  ctx.strokeStyle = pal.logLight;
  ctx.lineWidth = 2.5;
  rr(x + 2, y, w, h, 9);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = pal.logRing;
  ctx.lineWidth = 1.5;
  for (let k = 0; k < len; k++) {
    const cx = x + k * CELL + CELL / 2;
    ctx.beginPath();
    ctx.ellipse(cx, y + h / 2, 8, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawVehicleClassic(x, lane) {
  const w = lane.len * CELL - 6, y = lane.row * CELL + 9, h = CELL - 18;
  const color = lane.row % 2 ? pal.vehB : pal.vehA;
  const left = x + 3;
  const front = lane.dir > 0 ? left + w : left;
  ctx.save();
  glow(color, 12);
  ctx.fillStyle = color;
  rr(left, y, w, h, h / 2);
  ctx.fill();
  ctx.restore();
  // Windscreen near the front.
  if (lane.item !== 'scooter') {
    ctx.fillStyle = pal.windscreen;
    const sw = Math.min(16, w * 0.25);
    rr(lane.dir > 0 ? left + w - sw - 8 : left + 8, y + 4, sw, h - 8, 3);
    ctx.fill();
  }
  // Headlights at the front, tail lights at the back.
  ctx.fillStyle = pal.headlight;
  ctx.fillRect(front - (lane.dir > 0 ? 5 : -1), y + 3, 4, 4);
  ctx.fillRect(front - (lane.dir > 0 ? 5 : -1), y + h - 7, 4, 4);
  ctx.fillStyle = pal.taillight;
  const back = lane.dir > 0 ? left : left + w;
  ctx.fillRect(back - (lane.dir > 0 ? -1 : 5), y + 3, 4, 4);
  ctx.fillRect(back - (lane.dir > 0 ? -1 : 5), y + h - 7, 4, 4);
}

// Retro vehicles: stepped blocks. Odd rows get a dark stripe so the two tones read apart.
function drawVehicleRetro(x, lane) {
  const w = lane.len * CELL - 6, y = lane.row * CELL + 10, h = CELL - 20;
  const left = Math.round((x + 3) / 2) * 2;
  const front = lane.dir > 0 ? left + w : left;
  ctx.fillStyle = lane.row % 2 ? pal.vehB : pal.vehA;
  ctx.fillRect(left + 4, y, w - 8, h);
  ctx.fillRect(left, y + 4, w, h - 8);
  ctx.fillStyle = pal.windscreen;
  if (lane.row % 2) ctx.fillRect(left + 8, y + h / 2 - 2, w - 16, 4);
  if (lane.item !== 'scooter') {
    ctx.fillRect(lane.dir > 0 ? left + w - 20 : left + 12, y + 4, 8, h - 8);
  }
  ctx.fillStyle = pal.headlight;
  ctx.fillRect(front - (lane.dir > 0 ? 4 : 0), y + 4, 4, 4);
  ctx.fillRect(front - (lane.dir > 0 ? 4 : 0), y + h - 8, 4, 4);
  ctx.fillStyle = pal.taillight;
  const back = lane.dir > 0 ? left : left + w;
  ctx.fillRect(back - (lane.dir > 0 ? 0 : 4), y + 4, 4, 4);
  ctx.fillRect(back - (lane.dir > 0 ? 0 : 4), y + h - 8, 4, 4);
}

function drawVehicleNeon(x, lane) {
  const w = lane.len * CELL - 6, y = lane.row * CELL + 9, h = CELL - 18;
  const odd = lane.row % 2;
  const color = odd ? pal.vehB : pal.vehA;
  const left = x + 3;
  const front = lane.dir > 0 ? left + w : left;
  ctx.save();
  glow(color, 12);
  ctx.fillStyle = odd ? pal.vehBFill : pal.vehAFill;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  rr(left + 1, y + 1, w - 2, h - 2, (h - 2) / 2);
  ctx.fill();
  ctx.stroke();
  if (lane.item !== 'scooter') {
    const sw = Math.min(16, w * 0.25);
    ctx.lineWidth = 1.5;
    rr(lane.dir > 0 ? left + w - sw - 9 : left + 9, y + 6, sw, h - 12, 3);
    ctx.stroke();
  }
  glow(pal.headlight, 8);
  ctx.fillStyle = pal.headlight;
  ctx.fillRect(front - (lane.dir > 0 ? 6 : -2), y + 5, 4, 3);
  ctx.fillRect(front - (lane.dir > 0 ? 6 : -2), y + h - 8, 4, 3);
  glow(pal.taillight, 8);
  ctx.fillStyle = pal.taillight;
  const back = lane.dir > 0 ? left : left + w;
  ctx.fillRect(back - (lane.dir > 0 ? -2 : 6), y + 5, 4, 3);
  ctx.fillRect(back - (lane.dir > 0 ? -2 : 6), y + h - 8, 4, 3);
  ctx.restore();
}

// The frog is drawn facing up and rotated to the direction of its last hop. While a hop tweens
// (frog.hop < 1) it lifts off the board and stretches its legs.
// Moves the context to the frog and rotates it to its last hop. Returns how high it is in the air.
function frogTransform() {
  const air = frog.hop < 1 ? Math.sin(frog.hop * Math.PI) : 0;
  ctx.translate(frog.fx, frog.frow * CELL + CELL / 2 - air * 6);
  ctx.rotate(FACE_ANGLE[faceDir]);
  const s = 1 + air * 0.15;
  ctx.scale(s, s);
  return air;
}

function drawFrogClassic() {
  ctx.save();
  const air = frogTransform();
  // Shadow on the board.
  ctx.fillStyle = pal.frogShadow;
  ctx.beginPath();
  ctx.ellipse(0, 4 + air * 6, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Back legs: folded when sitting, stretched back in the air.
  ctx.fillStyle = pal.frogDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 14, 8 + air * 9, 5, 9 + air * 5, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body and belly.
  glow(pal.frogGlow, 10);
  const g = ctx.createRadialGradient(-3, -4, 3, 0, 0, 18);
  g.addColorStop(0, pal.frogHi);
  g.addColorStop(1, pal.frog);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  if (pal.frogEdge) {
    ctx.strokeStyle = pal.frogEdge;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.fillStyle = pal.frogBelly;
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes with a white glint.
  for (const side of [-1, 1]) {
    ctx.fillStyle = pal.frogDark;
    ctx.beginPath();
    ctx.arc(side * 8, -11, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(side * 8 - 1.5, -12.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLifeClassic(cx, cy) {
  ctx.fillStyle = pal.frog;
  ctx.beginPath();
  ctx.arc(cx, cy, 11, 0, Math.PI * 2);
  ctx.fill();
  if (pal.frogEdge) {
    ctx.strokeStyle = pal.frogEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = pal.frogDark;
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 4, 2.2, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

// 8-bit frog facing up: X is body, E is an eye. Drawn cell by cell, with a one-cell-wide edge.
const FROG_BITS = [
  '.XX...XX.',
  'XEX...XEX',
  'XXXXXXXXX',
  '.XXXXXXX.',
  'X.XXXXX.X',
  'X.XXXXX.X',
  '.XXXXXXX.',
  'XX.XXX.XX',
  'X.......X',
];

function drawPixelFrog(cell) {
  const o = -FROG_BITS.length * cell / 2;
  const e = Math.max(2, cell / 2);
  for (const pass of ['edge', 'body']) {
    for (let r = 0; r < FROG_BITS.length; r++) {
      for (let c = 0; c < FROG_BITS[r].length; c++) {
        const ch = FROG_BITS[r][c];
        if (ch === '.') continue;
        const x = o + c * cell, y = o + r * cell;
        if (pass === 'edge') {
          if (!pal.frogEdge) continue;
          ctx.fillStyle = pal.frogEdge;
          ctx.fillRect(x - e, y - e, cell + 2 * e, cell + 2 * e);
        } else {
          ctx.fillStyle = ch === 'E' ? pal.frogDark : pal.frog;
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }
  }
}

function drawPixelFrogAt(cx, cy, cell) {
  ctx.save();
  ctx.translate(cx, cy);
  drawPixelFrog(cell);
  ctx.restore();
}

function drawFrogRetro() {
  ctx.save();
  frogTransform();
  drawPixelFrog(4);
  ctx.restore();
}

// Neon frog: glowing outline with a faint fill.
function neonFrogShape(air) {
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = pal.frog;
  ctx.fillStyle = pal.frogFill;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 14, 8 + air * 9, 4, 8 + air * 5, side * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * 8, -11, 5, 0, Math.PI * 2);
    ctx.fillStyle = pal.frogDark;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pal.frog;
    ctx.beginPath();
    ctx.arc(side * 8, -11, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFrogNeon() {
  ctx.save();
  const air = frogTransform();
  glow(pal.frog, 12);
  neonFrogShape(air);
  ctx.restore();
}

function drawSittingFrogNeon(cx, cy) {
  ctx.save();
  ctx.translate(cx, cy + 1);
  ctx.scale(0.72, 0.72);
  glow(pal.frog, 10);
  neonFrogShape(0);
  ctx.restore();
}

function drawLifeNeon(cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.62, 0.62);
  glow(pal.frog, 8);
  neonFrogShape(0);
  ctx.restore();
}

// Retro: a CRT scanline overlay over the whole canvas.
function drawScanlines() {
  ctx.fillStyle = pal.scan;
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

// Neon: a glowing frame around the play area.
function drawNeonFrame() {
  ctx.save();
  glow(pal.frame, 14);
  ctx.strokeStyle = pal.frame;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
  ctx.restore();
}

function shade(alpha) {
  ctx.fillStyle = 'rgba(' + pal.shade + ', ' + alpha + ')';
}

function drawCenterText(text, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px ' + pal.font;
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y);
}

function drawTitle() {
  shade(0.78);
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  textGlow(pal.title, 24);
  drawCenterText('FROGGY', 250, 84, pal.title);
  ctx.restore();
  drawCenterText('Dodge the traffic, ride the logs, fill every pad.', 300, 18, pal.text);
  drawCenterText('ARROWS or SWIPE to hop', 370, 20, pal.cta);
  if (Math.floor(performance.now() / 500) % 2 === 0) {
    drawCenterText('PRESS SPACE TO START', 440, 24, pal.prompt);
  }
}

// Drawn in the start row: score on the left, level and lives on the right, and the timer as a bar
// across the bottom that turns magenta under 8 s.
function drawHud() {
  const y = 11 * CELL;
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px ' + pal.font;
  ctx.textAlign = 'left';
  ctx.fillStyle = pal.text;
  ctx.fillText('SCORE ' + String(score).padStart(6, '0'), 14, y + 22);
  ctx.textAlign = 'right';
  ctx.fillStyle = pal.hud;
  ctx.fillText('LEVEL ' + level, W - 150, y + 22);
  for (let i = 0; i < lives; i++) drawLife(W - 124 + i * 36, y + 22);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = pal.timerTrack;
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillStyle = timeLeft < 8 ? pal.timerB : pal.timerA;
  ctx.fillRect(0, H - 8, W * (timeLeft / TIME_LIMIT), 8);
}

function drawCleared() {
  shade(0.55);
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  textGlow(pal.title, 20);
  drawCenterText('SET CLEARED', H / 2 + 14, 64, pal.title);
  ctx.restore();
}

const DEATH_TEXT = {
  vehicle: 'HIT BY TRAFFIC',
  drowned: 'DROWNED',
  'carried off': 'CARRIED AWAY',
  'missed pad': 'MISSED THE PAD',
  time: "TIME'S UP",
};

// The frog's fate stays on screen for the 0.9 s of the dead state: a red cross over the frog and
// the cause on a band across the board.
function drawDead() {
  const cx = frog.fx, cy = frog.frow * CELL + CELL / 2;
  ctx.save();
  ctx.strokeStyle = pal.danger;
  ctx.lineWidth = 5;
  glow(pal.danger, 12);
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 16);
  ctx.lineTo(cx + 16, cy + 16);
  ctx.moveTo(cx + 16, cy - 16);
  ctx.lineTo(cx - 16, cy + 16);
  ctx.stroke();
  ctx.restore();
  shade(0.7);
  ctx.fillRect(0, H / 2 - 40, W, 80);
  drawCenterText(DEATH_TEXT[deathCause] || 'OUCH', H / 2 + 14, 48, pal.danger);
}

function drawGameOver() {
  shade(0.8);
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  textGlow(pal.prompt, 24);
  drawCenterText('GAME OVER', 270, 76, pal.prompt);
  ctx.restore();
  drawCenterText('SCORE ' + String(score).padStart(6, '0'), 340, 28, pal.text);
  drawCenterText('LEVEL ' + level, 380, 20, pal.cta);
  if (Math.floor(performance.now() / 500) % 2 === 0) {
    drawCenterText('SPACE to play again', 450, 24, pal.cta2);
  }
}

// A glow costs a shadow blur every time it is drawn, and most glowing parts never change their art:
// logs, vehicles, pads, life icons and the neon frame. For the skins with `stamp` each one is painted
// once per palette into an offscreen canvas and then copied with drawImage. The skin's own draw
// function paints the sprite, so the look is the same. The frog turns and tweens, so it is not
// cached. The cache is emptied when the skin or theme changes (refreshAppearance).
const SPRITE_MARGIN = 32; // room around the art for its glow
const sprites = new Map();

function sprite(key, w, h, paint) {
  let s = sprites.get(key);
  if (!s) {
    s = document.createElement('canvas');
    s.width = w;
    s.height = h;
    const board = ctx;
    ctx = s.getContext('2d');
    paint();
    ctx = board;
    sprites.set(key, s);
  }
  return s;
}

function stamp(x, lane) {
  const parity = lane.kind === 'river' ? 0 : lane.row % 2; // vehicles pick their colour by row parity
  const key = lane.kind + '|' + lane.item + '|' + lane.len + '|' + parity + '|' + lane.dir;
  const s = sprite(key, lane.len * CELL + 2 * SPRITE_MARGIN, CELL + 2 * SPRITE_MARGIN, () => {
    // The skin paints at lane.row * CELL, so a row of that parity is moved back to the top of the sprite.
    ctx.translate(SPRITE_MARGIN, SPRITE_MARGIN - parity * CELL);
    if (lane.kind === 'river') skin.log(0, 0, lane.len);
    else skin.vehicle(0, { ...lane, row: parity });
  });
  ctx.drawImage(s, x - SPRITE_MARGIN, lane.row * CELL - SPRITE_MARGIN);
}

function drawPad(i) {
  if (!skin.stamp) {
    skin.pad(PAD_X[i], pads[i]);
    return;
  }
  const s = sprite('pad|' + pads[i], 80 + 2 * SPRITE_MARGIN, CELL + 2 * SPRITE_MARGIN, () => {
    ctx.translate(SPRITE_MARGIN, SPRITE_MARGIN);
    skin.pad(40, pads[i]);
  });
  ctx.drawImage(s, PAD_X[i] - 40 - SPRITE_MARGIN, -SPRITE_MARGIN);
}

function drawLife(cx, cy) {
  if (!skin.stamp) {
    skin.lifeIcon(cx, cy);
    return;
  }
  const s = sprite('life', 2 * SPRITE_MARGIN, 2 * SPRITE_MARGIN, () => skin.lifeIcon(SPRITE_MARGIN, SPRITE_MARGIN));
  ctx.drawImage(s, cx - SPRITE_MARGIN, cy - SPRITE_MARGIN);
}

function drawPost() {
  if (!skin.stamp) {
    skin.post();
    return;
  }
  ctx.drawImage(sprite('post', W, H, skin.post), 0, 0);
}

function draw(t) {
  ctx.fillStyle = pal.void;
  ctx.fillRect(0, 0, W, H);
  skin.board(t);
  for (const lane of lanes) {
    for (const x of lane.items) {
      if (x > W || x + lane.len * CELL < 0) continue;
      if (skin.stamp) stamp(x, lane);
      else if (lane.kind === 'river') skin.log(x, lane.row, lane.len);
      else skin.vehicle(x, lane);
    }
  }
  if (state !== 'ready') {
    drawHud();
    if (state === 'playing' || state === 'dead') skin.frog();
  }
  if (state === 'ready') drawTitle();
  if (state === 'cleared') drawCleared();
  if (state === 'dead') drawDead();
  if (state === 'gameover') drawGameOver();
  if (skin.post) drawPost();
}

// ── Run, attempts and input ───────────────────────────────────────────────────
const HOP_TIME = 0.09; // seconds the drawing takes to tween one hop
const FACE_ANGLE = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
let faceDir = 'up';

function newAttempt() {
  frog = { x: 400, row: 11, fx: 400, frow: 11, hop: 1, fromX: 400, fromRow: 11 };
  faceDir = 'up';
  bestRow = 11;
  timeLeft = TIME_LIMIT;
}

function startRun() {
  score = 0;
  lives = 3;
  level = 1;
  pads = [false, false, false, false, false];
  pause = 0;
  buildLanes();
  newAttempt();
  state = 'playing';
}

// The move is logical and instant; only the drawing tweens it.
function hopFrog(dir) {
  if (state !== 'playing') return;
  let x = frog.x, row = frog.row;
  if (dir === 'up') row -= 1;
  else if (dir === 'down') row += 1;
  else if (dir === 'left') x -= CELL;
  else x += CELL;
  if (row < 0 || row > 11) return;      // down in the start row, up past the goal row
  if (x < 25 || x > 775) return;        // never leave the board sideways
  faceDir = dir;
  frog.fromX = frog.fx;
  frog.fromRow = frog.frow;
  frog.x = x;
  frog.row = row;
  frog.hop = 0;
  if (row === 0) landOnPad();
  else {
    // Only a hop up to a row above the best one of this attempt scores.
    if (dir === 'up' && row < bestRow) { score += 10; bestRow = row; }
    checkHazards();                     // a landing in the water or on a vehicle is a death at once
  }
}

// Row 0 scores as a pad, not as a hop. Landing beside a pad or on a filled one is a death.
function landOnPad() {
  const i = PAD_X.findIndex((px, k) => !pads[k] && Math.abs(frog.x - px) <= PAD_HALF);
  if (i < 0) { killFrog('missed pad'); return; }
  pads[i] = true;
  score += 100 + 10 * Math.floor(timeLeft);
  if (pads.every(Boolean)) { state = 'cleared'; pause = 1.4; }
  else newAttempt();
}

// A cleared set raises the level (the lanes speed up with it) and gives no extra points.
function nextSet() {
  level += 1;
  pads = [false, false, false, false, false];
  newAttempt();
  state = 'playing';
}

function updateFrog(dt) {
  if (frog.hop < 1) {
    frog.hop = Math.min(1, frog.hop + dt / HOP_TIME);
    frog.fx = frog.fromX + (frog.x - frog.fromX) * frog.hop;
    frog.frow = frog.fromRow + (frog.row - frog.fromRow) * frog.hop;
  } else {
    frog.fx = frog.x;
    frog.frow = frog.row;
  }
}

const KEY_DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

document.addEventListener('keydown', (e) => {
  // The arrows and Space always scroll the host page inside the iframe, so they are always blocked.
  if (e.code in KEY_DIRS || e.code === 'Space') e.preventDefault();
  if (e.repeat) return;                 // one hop per press
  if (e.code in KEY_DIRS) hopFrog(KEY_DIRS[e.code]);
  else if (e.code === 'Space' || e.code === 'Enter') {
    if (state === 'ready' || state === 'gameover') startRun();
  }
});

// ── Swipe ─────────────────────────────────────────────────────────────────────
// One hop per swipe: the first move of 30 px or more (client pixels, on the axis with the larger
// movement) hops and ends the gesture. A touch that never reaches 30 px is a tap: it hops up while
// playing and starts or restarts the run on the title and end screens. Mouse drags work the same.
const SWIPE_MIN = 30;
let gesture = null;                     // { id, x, y, hopped } while a pointer is down

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or lost pointer */ }
  gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, hopped: false };
});

canvas.addEventListener('pointermove', (e) => {
  if (!gesture || gesture.id !== e.pointerId) return;
  e.preventDefault();
  if (gesture.hopped) return;
  const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
  if (Math.hypot(dx, dy) < SWIPE_MIN) return;
  gesture.hopped = true;
  if (Math.abs(dx) > Math.abs(dy)) hopFrog(dx > 0 ? 'right' : 'left');
  else hopFrog(dy > 0 ? 'down' : 'up');
});

function endGesture(e, cancelled) {
  if (!gesture || gesture.id !== e.pointerId) return;
  const tap = !gesture.hopped && !cancelled;
  gesture = null;
  if (!tap) return;
  if (state === 'playing') hopFrog('up');
  else if (state === 'ready' || state === 'gameover') startRun();
}

canvas.addEventListener('pointerup', (e) => endGesture(e, false));
canvas.addEventListener('pointercancel', (e) => endGesture(e, true));
// Keeps the host page from scrolling or zooming under the finger.
canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// ── Fit to the frame ──────────────────────────────────────────────────────────
// The canvas is 800x600. When the iframe is smaller, CSS zoom scales the page down so the whole
// canvas is visible; it never scales up. Swipe distances are read in client pixels, so zoom does
// not change the 30 px threshold.
function fitToFrame() {
  if (!innerWidth || !innerHeight) return; // hidden iframe: nothing to measure
  const scale = Math.min(1, innerWidth / canvas.width, innerHeight / canvas.height);
  document.getElementById('stage').style.zoom = scale < 1 ? String(scale) : '';
}

window.addEventListener('resize', fitToFrame);
fitToFrame();

// ── Loop ──────────────────────────────────────────────────────────────────────
// Timed with performance.now() so the host pause (bridge) freezes it. The lanes move on the title
// screen and while playing, and hold still on the dead, cleared and game over screens.
let lastTime = performance.now();

function frame() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (state === 'playing') {
    // On a log the frog is carried at the log's speed: find the log before the lanes move.
    const lane = laneByRow[frog.row];
    const ridden = lane && lane.kind === 'river' && logUnder(lane, frog.x) ? lane : null;
    updateLanes(dt);
    if (ridden) frog.x += laneStep(ridden, dt);
    updateFrog(dt);
    checkHazards();
    if (state === 'playing') {
      timeLeft = Math.max(0, timeLeft - dt);
      if (timeLeft === 0) killFrog('time');
    }
  } else if (state === 'ready') {
    updateLanes(dt);
  } else if (state === 'cleared') {
    pause -= dt;
    if (pause <= 0) nextSet();
  } else if (state === 'dead') {
    pause -= dt;
    if (pause <= 0) {
      if (lives > 0) { newAttempt(); state = 'playing'; }
      else state = 'gameover';
    }
  }
  draw(now / 1000);
  requestAnimationFrame(frame);
}

// ── Appearance (skin + theme) ─────────────────────────────────────────────────
// Always starts with skin `classic` and theme `dark`; nothing is stored.
const skinSelect = document.getElementById('skin-select');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleText = document.getElementById('theme-toggle-text');

function applySkin(id) {
  skin = SKINS[id];
  document.documentElement.dataset.skin = id;
  skinSelect.value = id;
  refreshAppearance();
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggleIcon.textContent = isLight ? '☾' : '☀';
  themeToggleText.textContent = isLight ? 'Dark' : 'Light';
  refreshAppearance();
}

// The canvas cannot read CSS variables, so the palette is cached here. The loop may be frozen by
// the host pause, so the frame is repainted at once.
function refreshAppearance() {
  pal = skin.colors(document.documentElement.dataset.theme === 'light');
  sprites.clear();
  draw(performance.now() / 1000);
}

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  skinSelect.blur(); // the arrows hop the frog again, not change the skin
});

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  themeToggle.blur(); // Space and Enter go back to the game
});

skinSelect.innerHTML = Object.entries(SKINS).map(([id, k]) => `<option value="${id}">${k.name}</option>`).join('');

buildLanes();
applySkin('classic');
applyTheme('dark');
requestAnimationFrame(frame);
