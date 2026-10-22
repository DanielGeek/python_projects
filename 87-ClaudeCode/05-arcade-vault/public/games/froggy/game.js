// Froggy: lane crosser on an 800x600 board (16x12 cells of 50 px). Classic script: the bridge reads
// score, lives, level and state. All art is drawn on the canvas; there are no image or audio files.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

// ── Drawing ───────────────────────────────────────────────────────────────────
const COLORS = {
  void: '#07070f',
  water: ['#0b1f4a', '#07142f'],
  ripple: 'rgba(120, 200, 255, 0.16)',
  hedge: '#0d3b2c',
  hedgeLeaf: '#14634a',
  strip: '#121a2e',
  stripTile: '#1b2640',
  road: '#10101c',
  roadLine: 'rgba(232, 232, 255, 0.22)',
  cyan: '#00f0ff',
  magenta: '#ff2bd6',
  yellow: '#ffee00',
  logDark: '#0f4a52',
  logLight: '#1b7480',
  logRing: 'rgba(190, 255, 240, 0.35)',
  lotus: '#ff6ec7',
};

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawBoard(t) {
  // Goal row: a hedge with five pad notches.
  ctx.fillStyle = COLORS.hedge;
  ctx.fillRect(0, 0, W, CELL);
  ctx.fillStyle = COLORS.hedgeLeaf;
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(((i * 53) % W) + 4, 6 + ((i * 17) % 38), 6, 4);
  }

  // River: rows 1-4.
  const wg = ctx.createLinearGradient(0, CELL, 0, 5 * CELL);
  wg.addColorStop(0, COLORS.water[0]);
  wg.addColorStop(1, COLORS.water[1]);
  ctx.fillStyle = wg;
  ctx.fillRect(0, CELL, W, 4 * CELL);
  ctx.strokeStyle = COLORS.ripple;
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
  for (let i = 0; i < PAD_X.length; i++) {
    const cx = PAD_X[i];
    ctx.fillStyle = COLORS.water[1];
    rr(cx - 36, 4, 72, CELL - 4, 8);
    ctx.fill();
    ctx.strokeStyle = COLORS.lotus;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, 28, 24, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 110, 199, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, 28, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Median (row 5) and start (row 11).
  for (const row of [5, 11]) {
    ctx.fillStyle = COLORS.strip;
    ctx.fillRect(0, row * CELL, W, CELL);
    ctx.fillStyle = COLORS.stripTile;
    for (let x = 0; x < W; x += CELL) {
      ctx.fillRect(x + 2, row * CELL + 2, CELL - 4, CELL - 4);
    }
  }

  // Road: rows 6-10 with dashed lane lines.
  ctx.fillStyle = COLORS.road;
  ctx.fillRect(0, 6 * CELL, W, 5 * CELL);
  ctx.strokeStyle = COLORS.roadLine;
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

function drawLog(x, row, len) {
  const w = len * CELL - 4, y = row * CELL + 7, h = CELL - 14;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 240, 255, 0.35)';
  ctx.shadowBlur = 10;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, COLORS.logLight);
  g.addColorStop(1, COLORS.logDark);
  ctx.fillStyle = g;
  rr(x + 2, y, w, h, 9);
  ctx.fill();
  ctx.restore();
  // Growth rings.
  ctx.strokeStyle = COLORS.logRing;
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

function drawVehicle(x, lane) {
  const w = lane.len * CELL - 6, y = lane.row * CELL + 9, h = CELL - 18;
  const color = lane.row % 2 ? COLORS.magenta : COLORS.cyan;
  const left = x + 3;
  const front = lane.dir > 0 ? left + w : left;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  rr(left, y, w, h, h / 2);
  ctx.fill();
  ctx.restore();
  // Windscreen near the front.
  if (lane.item !== 'scooter') {
    ctx.fillStyle = 'rgba(7, 7, 15, 0.7)';
    const sw = Math.min(16, w * 0.25);
    rr(lane.dir > 0 ? left + w - sw - 8 : left + 8, y + 4, sw, h - 8, 3);
    ctx.fill();
  }
  // Headlights at the front, tail lights at the back.
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(front - (lane.dir > 0 ? 5 : -1), y + 3, 4, 4);
  ctx.fillRect(front - (lane.dir > 0 ? 5 : -1), y + h - 7, 4, 4);
  ctx.fillStyle = '#ff3860';
  const back = lane.dir > 0 ? left : left + w;
  ctx.fillRect(back - (lane.dir > 0 ? -1 : 5), y + 3, 4, 4);
  ctx.fillRect(back - (lane.dir > 0 ? -1 : 5), y + h - 7, 4, 4);
}

function draw(t) {
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, W, H);
  drawBoard(t);
  for (const lane of lanes) {
    for (const x of lane.items) {
      if (x > W || x + lane.len * CELL < 0) continue;
      if (lane.kind === 'river') drawLog(x, lane.row, lane.len);
      else drawVehicle(x, lane);
    }
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
// Timed with performance.now() so the host pause (bridge) freezes it.
let lastTime = performance.now();

function frame() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateLanes(dt);
  draw(now / 1000);
  requestAnimationFrame(frame);
}

buildLanes();
requestAnimationFrame(frame);
