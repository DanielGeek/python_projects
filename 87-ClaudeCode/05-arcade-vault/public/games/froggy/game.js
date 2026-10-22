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
  frog: '#ffd400',
  frogBelly: '#fff3a8',
  frogDark: '#1a1530',
  text: '#e8e8ff',
};

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// The small frog that sits on a filled pad.
function drawSittingFrog(cx, cy) {
  ctx.save();
  ctx.shadowColor = COLORS.yellow;
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLORS.frog;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLORS.frogDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * 6, cy - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
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
    if (pads[i]) drawSittingFrog(cx, 28);
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

// The frog is drawn facing up and rotated to the direction of its last hop. While a hop tweens
// (frog.hop < 1) it lifts off the board and stretches its legs.
function drawFrog() {
  const cx = frog.fx;
  const cy = frog.frow * CELL + CELL / 2;
  const air = frog.hop < 1 ? Math.sin(frog.hop * Math.PI) : 0;
  ctx.save();
  ctx.translate(cx, cy - air * 6);
  ctx.rotate(FACE_ANGLE[faceDir]);
  const s = 1 + air * 0.15;
  ctx.scale(s, s);
  // Shadow on the board.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 4 + air * 6, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Back legs: folded when sitting, stretched back in the air.
  ctx.fillStyle = COLORS.frogDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 14, 8 + air * 9, 5, 9 + air * 5, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body and belly.
  ctx.shadowColor = COLORS.yellow;
  ctx.shadowBlur = 10;
  const g = ctx.createRadialGradient(-3, -4, 3, 0, 0, 18);
  g.addColorStop(0, '#fff68a');
  g.addColorStop(1, COLORS.frog);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.frogBelly;
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes with a white glint.
  for (const side of [-1, 1]) {
    ctx.fillStyle = COLORS.frogDark;
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

function drawCenterText(text, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y);
}

function drawTitle() {
  ctx.fillStyle = 'rgba(7, 7, 15, 0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.shadowColor = COLORS.yellow;
  ctx.shadowBlur = 24;
  drawCenterText('FROGGY', 250, 84, COLORS.yellow);
  ctx.restore();
  drawCenterText('Dodge the traffic, ride the logs, fill every pad.', 300, 18, COLORS.text);
  drawCenterText('ARROWS or SWIPE to hop', 370, 20, COLORS.cyan);
  if (Math.floor(performance.now() / 500) % 2 === 0) {
    drawCenterText('PRESS SPACE TO START', 440, 24, COLORS.magenta);
  }
}

// Drawn in the start row: score on the left, level and lives on the right, and the timer as a bar
// across the bottom that turns magenta under 8 s.
function drawHud() {
  const y = 11 * CELL;
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('SCORE ' + String(score).padStart(6, '0'), 14, y + 22);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.cyan;
  ctx.fillText('LEVEL ' + level, W - 150, y + 22);
  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = COLORS.frog;
    ctx.beginPath();
    ctx.arc(W - 124 + i * 36, y + 22, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.frogDark;
    ctx.beginPath();
    ctx.arc(W - 124 + i * 36 - 4, y + 18, 2.2, 0, Math.PI * 2);
    ctx.arc(W - 124 + i * 36 + 4, y + 18, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(232, 232, 255, 0.12)';
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillStyle = timeLeft < 8 ? COLORS.magenta : COLORS.cyan;
  ctx.fillRect(0, H - 8, W * (timeLeft / TIME_LIMIT), 8);
}

function drawCleared() {
  ctx.fillStyle = 'rgba(7, 7, 15, 0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.shadowColor = COLORS.yellow;
  ctx.shadowBlur = 20;
  drawCenterText('SET CLEARED', H / 2 + 14, 64, COLORS.yellow);
  ctx.restore();
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
  if (state !== 'ready') {
    drawHud();
    if (state !== 'cleared') drawFrog();
  }
  if (state === 'ready') drawTitle();
  if (state === 'cleared') drawCleared();
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

buildLanes();
requestAnimationFrame(frame);
