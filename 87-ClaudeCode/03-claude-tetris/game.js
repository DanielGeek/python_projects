'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
  null,
  '#4dd0e1', // I - cyan
  '#ffd54f', // O - yellow
  '#ba68c8', // T - purple
  '#81c784', // S - green
  '#e57373', // Z - red
  '#90caf9', // J - pale blue
  '#ffb74d', // L - orange
  '#4db6ac', // + - teal
  '#a1887f', // U - brown
  '#dce775', // Y - lime
  '#cfd8dc', // single - silver
  '#ff8a65', // ring - coral
  '#c9a227', // nut - brass
];

// Slightly deeper tones so pieces and the ghost stay visible on a white board.
const LIGHT_COLORS = [
  null,
  '#00acc1', // I
  '#f9a825', // O
  '#8e24aa', // T
  '#43a047', // S
  '#e53935', // Z
  '#1e88e5', // J
  '#fb8c00', // L
  '#00897b', // +
  '#6d4c41', // U
  '#afb42b', // Y
  '#546e7a', // single
  '#f4511e', // ring
  '#9e7c0c', // nut
];

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[0,8,0],[8,8,8],[0,8,0]],                  // + (pentomino)
  [[9,0,9],[9,9,9],[0,0,0]],                  // U (pentomino)
  [[0,10,0,0],[10,10,10,10],[0,0,0,0],[0,0,0,0]], // Y (pentomino)
  [[11]],                                      // single (reward after a Tetris)
  [[12,12,12],[12,0,12],[12,12,12]],          // hollow 3x3 ring (challenge)
  [[0,13,0],[13,0,13],[0,13,0]],              // nut: hex-like diamond, empty center (challenge)
];

// Non-standard pieces. Types 1-7 are the classic set; the rest appear occasionally.
const PENTOMINOES = [8, 9, 10];
const SINGLE = 11;
const RING = 12;
const NUT = 13;
const PENTOMINO_CHANCE = 0.12;
const RING_CHANCE = 0.03;
const NUT_CHANCE = 0.03;

// Combo / bonus scoring. Line points are multiplied by the current level.
const TSPIN_SCORES = [400, 800, 1200, 1600]; // by lines cleared (0-3)
const B2B_MULTIPLIER = 1.5; // consecutive "difficult" clears (Tetris / T-spin with lines)
const PERFECT_CLEAR_BONUS = 2000;
const CLEAR_NAMES = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'];
const BANNER_MS = 1400;
const MAX_BANNERS = 4;
const MUTE_KEY = 'tetris-muted';

const LINE_SCORES = [0, 100, 300, 500, 800];

// Power-ups: a one-block special piece appears every POWER_EVERY lines.
const POWER_BLOCK = 14; // shape cell value for a power-up block (never stored on the board)
const POWER_EVERY = 5;
const FREEZE_MS = 5000;
const POWER_SCORE = 10; // per block destroyed
const POWER_GLYPHS = { bomb: '💣', bolt: '⚡', tint: '🎨', gravity: '⏬', freeze: '❄️' };

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const resumeBtn = document.getElementById('resume-btn');
const comboEl = document.getElementById('combo');
const b2bEl = document.getElementById('b2b');
const muteText = document.getElementById('mute-text');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleText = document.getElementById('theme-toggle-text');

const THEME_KEY = 'tetris-theme';
let gridColor = '#22222e';
let powerColor = '#f06292';
let comboColor = '#ffca28';
let palette = COLORS;

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let nextPowerAt, powerPending, freezeLeft, singlePending;
let combo, b2b, banners, flash;
let audioCtx = null;
let muted = false;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function pieceOfType(type) {
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function randomPiece() {
  const roll = Math.random();
  if (roll < RING_CHANCE) return pieceOfType(RING);
  if (roll < RING_CHANCE + NUT_CHANCE) return pieceOfType(NUT);
  if (roll < RING_CHANCE + NUT_CHANCE + PENTOMINO_CHANCE)
    return pieceOfType(PENTOMINOES[Math.floor(Math.random() * PENTOMINOES.length)]);
  return pieceOfType(Math.floor(Math.random() * 7) + 1);
}

function powerUpPiece() {
  const names = Object.keys(POWER_GLYPHS);
  return {
    type: POWER_BLOCK,
    power: names[Math.floor(Math.random() * names.length)],
    axis: Math.random() < 0.5 ? 'row' : 'col', // only used by bolt
    shape: [[POWER_BLOCK]],
    x: Math.floor(COLS / 2),
    y: 0,
  };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      current.rotated = true; // T-spin detection needs the last move to be a rotation
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function isTSpin(piece) {
  if (piece.type !== 3 || !piece.rotated) return false;
  // 3-corner rule: at least 3 of the 4 corners around the T's center are blocked.
  let filled = 0;
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = piece.x + 1 + dx;
    const y = piece.y + 1 + dy;
    if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x])) filled++;
  }
  return filled >= 3;
}

function clearLines(tspin) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  scoreClear(cleared, tspin); // uses the level before this clear raises it
  if (cleared) {
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    if (cleared === 4) singlePending = true; // Tetris reward: next piece is a single block
    if (lines >= nextPowerAt) {
      powerPending = true;
      nextPowerAt = (Math.floor(lines / POWER_EVERY) + 1) * POWER_EVERY;
    }
  }
  updateHUD();
}

function scoreClear(cleared, tspin) {
  if (cleared) {
    combo++;
  } else {
    combo = 0; // a lock without a line clear breaks the chain
    if (!tspin) return;
  }
  const hard = cleared === 4 || (tspin && cleared > 0);
  let points = (tspin ? TSPIN_SCORES[cleared] : LINE_SCORES[cleared]) * level;
  let b2bHit = false;
  let perfect = false;
  if (tspin) addBanner(`T-SPIN ${CLEAR_NAMES[cleared]}`.trim(), 'combo');
  else if (cleared === 4) addBanner('TETRIS', 'combo');
  if (cleared) {
    if (hard && b2b) {
      b2bHit = true;
      points = Math.floor(points * B2B_MULTIPLIER);
      addBanner('BACK-TO-BACK', 'combo');
    }
    b2b = hard; // a plain 1-3 line clear ends the back-to-back chain
    if (combo >= 2) {
      points *= combo;
      addBanner(`COMBO x${combo}`, 'combo');
    }
    perfect = board.every(row => row.every(v => v === 0));
    if (perfect) {
      points += PERFECT_CLEAR_BONUS * level;
      addBanner('PERFECT CLEAR!', 'perfect');
    }
  }
  score += points;
  if (points) addBanner(`+${points.toLocaleString()}`, 'plain');
  if (perfect) startFlash(0.5, 900);
  else if (hard || tspin) startFlash(0.3, 450);
  else startFlash(0.15, 250);
  playClearSound(cleared, tspin, b2bHit, perfect);
}

function addBanner(text, kind) {
  banners.push({ text, kind, age: 0 });
  if (banners.length > MAX_BANNERS) banners.shift();
}

function startFlash(alpha, total) {
  flash = { alpha, total, left: total };
}

function updateEffects(dt) {
  for (const b of banners) b.age += dt;
  banners = banners.filter(b => b.age < BANNER_MS);
  if (flash.left > 0) flash.left = Math.max(0, flash.left - dt);
}

function drawEffects() {
  if (flash.left > 0) {
    ctx.globalAlpha = flash.alpha * (flash.left / flash.total);
    ctx.fillStyle = comboColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  banners.forEach((b, i) => {
    const t = b.age / BANNER_MS;
    ctx.globalAlpha = t < 0.7 ? 1 : (1 - t) / 0.3;
    ctx.font = `bold ${b.kind === 'plain' ? 16 : 22}px sans-serif`;
    ctx.fillStyle = b.kind === 'perfect' ? `hsl(${(performance.now() / 4) % 360} 90% 60%)` : comboColor;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillText(b.text, canvas.width / 2, 150 + i * 32 - t * 24);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
}

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function ensureAudio() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch {
    audioCtx = null; // audio unavailable; the game stays silent
  }
}

function toggleMute() {
  muted = !muted;
  muteText.textContent = muted ? 'unmute' : 'mute';
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* storage unavailable */ }
}

function tone(freq, delay, dur, type = 'square', vol = 0.06) {
  if (muted || !audioCtx) return;
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

function playClearSound(cleared, tspin, b2bHit, perfect) {
  // Pitch climbs one semitone per combo step so chains sound like they escalate.
  const base = 261.63 * 2 ** (Math.min(Math.max(combo - 1, 0), 12) / 12);
  const steps = perfect ? [1, 1.25, 1.5, 2, 2.5, 3] : [1, 1.25, 1.5, 2].slice(0, Math.max(cleared, 1));
  steps.forEach((m, i) => tone(base * m, i * 0.07, 0.18, tspin ? 'sawtooth' : 'square'));
  if (b2bHit) tone(base * 4, steps.length * 0.07, 0.25, 'triangle', 0.08);
}

function destroyCell(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS || !board[r][c]) return;
  board[r][c] = 0;
  score += POWER_SCORE;
}

function colorBelow(x, y) {
  if (y + 1 < ROWS && board[y + 1][x]) return board[y + 1][x];
  // Landed on the floor: fall back to the most common color on the board.
  const counts = new Array(COLORS.length).fill(0);
  for (const row of board) for (const v of row) if (v) counts[v]++;
  const best = Math.max(...counts);
  return best ? counts.indexOf(best) : 0;
}

function compactColumns() {
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][c]) continue;
      board[write][c] = board[r][c];
      if (write !== r) board[r][c] = 0;
      write--;
    }
  }
}

function boltClear(x, y, axis) {
  if (axis === 'row') {
    for (let c = 0; c < COLS; c++) destroyCell(y, c);
    board.splice(y, 1);
    board.unshift(new Array(COLS).fill(0));
  } else {
    for (let r = 0; r < ROWS; r++) destroyCell(r, x);
  }
}

function tintClear(x, y) {
  const color = colorBelow(x, y);
  if (!color) return;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c] === color) destroyCell(r, c);
}

function applyPower(piece) {
  const { x, y } = piece;
  switch (piece.power) {
    case 'bomb':
      for (let r = y - 1; r <= y + 1; r++)
        for (let c = x - 1; c <= x + 1; c++) destroyCell(r, c);
      break;
    case 'bolt':
      boltClear(x, y, piece.axis);
      break;
    case 'tint':
      tintClear(x, y);
      break;
    case 'gravity':
      compactColumns();
      break;
    case 'freeze':
      freezeLeft = FREEZE_MS;
      break;
  }
  updateHUD();
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  if (gy !== current.y) current.rotated = false;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    current.rotated = false;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  const tspin = !current.power && isTSpin(current);
  if (current.power) applyPower(current);
  else merge();
  clearLines(tspin);
  spawn();
}

function spawn() {
  current = next;
  if (powerPending) {
    powerPending = false;
    next = powerUpPiece();
  } else if (singlePending) {
    singlePending = false;
    next = pieceOfType(SINGLE);
  } else {
    next = randomPiece();
  }
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
  comboEl.textContent = combo >= 2 ? `x${combo}` : '–';
  b2bEl.hidden = !b2b;
}

function drawBlock(context, x, y, colorIndex, size, alpha, power) {
  if (!colorIndex) return;
  const color = power ? powerColor : palette[colorIndex];
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  // highlight
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  if (power) {
    // fillStyle is still the 12%-alpha highlight here; reset it or the glyph is near-invisible.
    context.fillStyle = '#fff';
    context.font = `${Math.floor(size * 0.6)}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(POWER_GLYPHS[power], x * size + size / 2, y * size + size / 2 + 1);
  }
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2, current.power);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK, 1, current.power);

  if (freezeLeft > 0) {
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = powerColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = powerColor;
    ctx.fillText(`❄️ FROZEN ${Math.ceil(freezeLeft / 1000)}s`, canvas.width / 2, 8);
  }

  drawEffects();
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB, 1, next.power);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Score: ${score.toLocaleString()}`;
  resumeBtn.hidden = true;
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    overlay.classList.add('hidden');
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'PAUSED';
    overlayScore.textContent = 'Press P to resume';
    resumeBtn.hidden = false;
    overlay.classList.remove('hidden');
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  if (freezeLeft > 0) {
    freezeLeft = Math.max(0, freezeLeft - dt);
    dropAccum = 0;
  } else {
    dropAccum += dt;
  }
  updateEffects(dt);
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
      current.rotated = false;
    } else {
      lockPiece();
    }
  }
  draw();
  // lockPiece() may have ended the game from inside this frame; don't re-arm the loop.
  if (gameOver) return;
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  nextPowerAt = POWER_EVERY;
  powerPending = false;
  singlePending = false;
  freezeLeft = 0;
  combo = 0;
  b2b = false;
  banners = [];
  flash = { alpha: 0, total: 1, left: 0 };
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  ensureAudio(); // browsers only allow audio after a user gesture
  if (e.code === 'KeyM') { toggleMute(); return; }
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) { current.x--; current.rotated = false; }
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) { current.x++; current.rotated = false; }
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);
resumeBtn.addEventListener('click', () => {
  resumeBtn.blur(); // keep Space/Enter from re-triggering the button
  togglePause();
});

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = theme;
  palette = isLight ? LIGHT_COLORS : COLORS;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggleIcon.textContent = isLight ? '☾' : '☀';
  themeToggleText.textContent = isLight ? 'Dark' : 'Light';
  // The canvas can't read CSS variables, so cache the grid color here.
  const styles = getComputedStyle(document.documentElement);
  gridColor = styles.getPropertyValue('--grid').trim() || gridColor;
  powerColor = styles.getPropertyValue('--power').trim() || powerColor;
  comboColor = styles.getPropertyValue('--combo').trim() || comboColor;
  // The loop is stopped while paused/game over, so repaint explicitly.
  if (board) { draw(); drawNext(); }
}

themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable */ }
  applyTheme(theme);
  themeToggle.blur(); // keep Space/Enter from re-triggering the toggle
});

muted = loadMuted();
muteText.textContent = muted ? 'unmute' : 'mute';
applyTheme(loadTheme());

init();
