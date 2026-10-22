// Snake: 20x20 grid, one life, walls kill. Classic script: the bridge reads score, level and state.
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const COLS = 20, ROWS = 20, CELL = 30;   // 600x600 canvas
const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const KEY_DIRS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

let state = 'ready';                     // 'ready' | 'playing' | 'paused' | 'gameover'
let won = false;                         // true when the snake fills the grid
let snake = [];                          // [{ x, y }], head first, grid cells
let dir = 'right', queue = [];           // current direction and up to 2 queued turns
let fruit = null;                        // { x, y, sprite }
let score = 0, level = 1, eaten = 0;

const fruitsImg = new Image();
let fruitsReady = false;
fruitsImg.onload = () => { fruitsReady = true; };
fruitsImg.src = window.SPRITE_ATLAS.sources.fruits;
const FRUIT_NAMES = Object.keys(window.SPRITE_ATLAS.fruits);

// ── Skins ─────────────────────────────────────────────────────────────────────
// A skin changes only colors, strokes, glow, fonts and the backdrop; never gameplay.
// colors(light) returns the palette for the active theme. The fruit sprites are
// third-party art (sprites.js, fruits.png): skins never redraw them, they only tint
// (retro) or halo (neon) them. The play area of `neon` stays dark in both themes.
const SKINS = {
  classic: {
    name: 'Classic',
    font: 'monospace',
    glow: 0,
    segment: 'solid',
    fruitTint: false,
    scanlines: false,
    frame: false,
    colors: (light) => light ? {
      bg: '#f2f3ea', grid: '#dcdfcf', body: '#00733a', head: '#003d1f', fruitGlow: null, fruitEdge: '#14142a',
      hud: '#14142a', overlay: 'rgba(242, 243, 234, 0.85)', title: '#00733a',
      pause: '#6b5000', over: '#a3007f', win: '#6b5000', text: '#14142a',
    } : {
      bg: '#0a0a18', grid: '#14142a', body: '#00ff88', head: '#7dffb0', fruitGlow: null, fruitEdge: '#e8e8ff',
      hud: '#e8e8ff', overlay: 'rgba(10, 10, 24, 0.75)', title: '#00ff88',
      pause: '#ffee00', over: '#ff2bd6', win: '#ffee00', text: '#e8e8ff',
    },
  },
  retro: {
    name: 'Retro',
    font: '"Courier New", Courier, monospace',
    glow: 0,
    segment: 'tile',
    fruitTint: true,
    scanlines: true,
    frame: false,
    colors: (light) => light ? {
      bg: '#cfe0b4', grid: '#bccf9e', body: '#306230', head: '#0f380f', fruit: '#0f380f',
      fruitGlow: null, hud: '#0f380f', overlay: 'rgba(207, 224, 180, 0.85)', title: '#0f380f',
      pause: '#0f380f', over: '#0f380f', win: '#0f380f', text: '#1d3511',
      scan: 'rgba(15, 56, 15, 0.07)',
    } : {
      bg: '#150d00', grid: '#2a1a00', body: '#ffb000', head: '#fff0b3', fruit: '#ff6a00',
      fruitGlow: null, hud: '#ffb000', overlay: 'rgba(21, 13, 0, 0.8)', title: '#ffb000',
      pause: '#ffd34d', over: '#ff6a00', win: '#ffd34d', text: '#ffb000',
      scan: 'rgba(0, 0, 0, 0.28)',
    },
  },
  neon: {
    name: 'Neon',
    font: 'monospace',
    glow: 12,
    segment: 'outline',
    fruitTint: false,
    scanlines: false,
    frame: true,
    colors: () => ({
      bg: '#04040a', grid: '#0b1622', body: '#39ff14', head: '#00f0ff', fruitGlow: '#ff2bd6', fruitEdge: '#ff2bd6',
      hud: '#e8ffff', overlay: 'rgba(4, 4, 10, 0.78)', title: '#39ff14',
      pause: '#ffee00', over: '#ff2bd6', win: '#ffee00', text: '#e8ffff', frame: '#00f0ff',
    }),
  },
};

let skin = SKINS.classic;
let palette = skin.colors(false);
const tintCache = {};                    // 'sprite|color' -> offscreen canvas

// A flat silhouette of a fruit sprite in one phosphor color (retro). The sprite
// pixels stay the source; only their color is replaced.
function tintedFruit(name, color) {
  const key = name + '|' + color;
  if (tintCache[key]) return tintCache[key];
  const s = window.SPRITE_ATLAS.fruits[name];
  const c = document.createElement('canvas');
  c.width = s.w;
  c.height = s.h;
  const g = c.getContext('2d');
  g.drawImage(fruitsImg, s.x, s.y, s.w, s.h, 0, 0, s.w, s.h);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, s.w, s.h);
  tintCache[key] = c;
  return c;
}

let acc = 0, lastTime = performance.now();

function tickRate() {
  return Math.min(20, 7 + level);        // cells per second
}

function resetGame() {
  const y = Math.floor(ROWS / 2), x = Math.floor(COLS / 2);
  snake = [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
  dir = 'right';
  queue = [];
  fruit = null;
  score = 0;
  level = 1;
  eaten = 0;
  won = false;
  acc = 0;
  spawnFruit();
}

function spawnFruit() {
  const taken = new Set(snake.map((c) => c.x + ',' + c.y));
  const free = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(x + ',' + y)) free.push({ x, y });
    }
  }
  if (!free.length) {
    fruit = null;
    return;
  }
  const cell = free[Math.floor(Math.random() * free.length)];
  fruit = { x: cell.x, y: cell.y, sprite: FRUIT_NAMES[Math.floor(Math.random() * FRUIT_NAMES.length)] };
}

function queueTurn(next) {
  if (queue.length >= 2) return;
  const last = queue.length ? queue[queue.length - 1] : dir;
  if (next === last || next === OPPOSITE[last]) return;
  queue.push(next);
}

function step() {
  if (queue.length) dir = queue.shift();
  const d = DIRS[dir];
  const head = { x: snake[0].x + d.x, y: snake[0].y + d.y };
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    state = 'gameover';
    return;
  }
  const eating = fruit !== null && head.x === fruit.x && head.y === fruit.y;
  // The tail cell moves away this tick, so it is only a hit when the snake grows.
  const body = eating ? snake : snake.slice(0, -1);
  if (body.some((c) => c.x === head.x && c.y === head.y)) {
    state = 'gameover';
    return;
  }
  snake.unshift(head);
  if (!eating) {
    snake.pop();
    return;
  }
  score += 10 * level;
  eaten++;
  if (eaten % 5 === 0) level++;
  if (snake.length === COLS * ROWS) {
    fruit = null;
    won = true;
    state = 'gameover';
    return;
  }
  spawnFruit();
}

function drawText(text, x, y, size, color) {
  ctx.font = 'bold ' + size + 'px ' + skin.font;
  // Outline in the play-area color so the text stays readable over snake cells.
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = palette.bg;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = skin.glow ? skin.glow / 2 : 0;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function drawSnake() {
  const p = palette;
  if (skin.segment === 'outline') {
    // Neon: outlined cells with glow, body in one path so the glow is drawn once.
    ctx.save();
    ctx.lineWidth = 2;
    ctx.shadowBlur = skin.glow;
    ctx.shadowColor = p.body;
    ctx.strokeStyle = p.body;
    ctx.fillStyle = 'rgba(57, 255, 20, 0.14)';
    ctx.beginPath();
    for (let i = 1; i < snake.length; i++) {
      ctx.rect(snake[i].x * CELL + 4, snake[i].y * CELL + 4, CELL - 8, CELL - 8);
    }
    ctx.fill();
    ctx.stroke();
    const h = snake[0];
    ctx.shadowColor = p.head;
    ctx.strokeStyle = p.head;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.fillRect(h.x * CELL + 3, h.y * CELL + 3, CELL - 6, CELL - 6);
    ctx.strokeRect(h.x * CELL + 3, h.y * CELL + 3, CELL - 6, CELL - 6);
    ctx.restore();
    return;
  }
  snake.forEach((c, i) => {
    ctx.fillStyle = i === 0 ? p.head : p.body;
    ctx.fillRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4);
    if (skin.segment === 'tile' && i > 0) {
      // Retro: an 8-bit tile, a hollow pixel in the middle of each body block.
      ctx.fillStyle = p.bg;
      ctx.fillRect(c.x * CELL + 11, c.y * CELL + 11, CELL - 22, CELL - 22);
    }
  });
}

function drawFruit() {
  if (!fruit || !fruitsReady) return;
  const s = window.SPRITE_ATLAS.fruits[fruit.sprite];
  const scale = Math.min(CELL / s.w, CELL / s.h);
  const w = s.w * scale, h = s.h * scale;
  const dx = fruit.x * CELL + (CELL - w) / 2, dy = fruit.y * CELL + (CELL - h) / 2;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (palette.fruitGlow) {
    ctx.shadowColor = palette.fruitGlow;
    ctx.shadowBlur = skin.glow + 4;
  }
  if (palette.fruitEdge) {
    // Outline: the sprite silhouette in the edge color, nudged around the sprite,
    // so dark or pale fruits keep 3:1 against the play area.
    const edge = tintedFruit(fruit.sprite, palette.fruitEdge);
    for (const [ox, oy] of [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      ctx.drawImage(edge, 0, 0, s.w, s.h, dx + ox, dy + oy, w, h);
    }
    ctx.shadowBlur = 0; // glow once, on the outline
  }
  if (skin.fruitTint) ctx.drawImage(tintedFruit(fruit.sprite, palette.fruit), 0, 0, s.w, s.h, dx, dy, w, h);
  else ctx.drawImage(fruitsImg, s.x, s.y, s.w, s.h, dx, dy, w, h);
  ctx.restore();
}

function drawScanlines() {
  ctx.fillStyle = palette.scan;
  for (let y = 0; y < canvas.height; y += 3) ctx.fillRect(0, y, canvas.width, 1);
}

// The glowing frame never changes while a palette is active, and a full-canvas
// shadowBlur every frame is costly without a GPU: paint it once, then copy its
// four edge strips (the glow fades well inside FRAME_EDGE px). Cleared in refreshAppearance().
const FRAME_EDGE = 40;
let frameSprite = null;

function drawFrame() {
  const W = canvas.width, H = canvas.height, E = FRAME_EDGE;
  if (!frameSprite) {
    frameSprite = document.createElement('canvas');
    frameSprite.width = W;
    frameSprite.height = H;
    const g = frameSprite.getContext('2d');
    g.strokeStyle = palette.frame;
    g.lineWidth = 2;
    g.shadowColor = palette.frame;
    g.shadowBlur = skin.glow;
    g.strokeRect(1, 1, W - 2, H - 2);
  }
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.drawImage(frameSprite, 0, 0, W, E, 0, 0, W, E);
  ctx.drawImage(frameSprite, 0, H - E, W, E, 0, H - E, W, E);
  ctx.drawImage(frameSprite, 0, E, E, H - 2 * E, 0, E, E, H - 2 * E);
  ctx.drawImage(frameSprite, W - E, E, E, H - 2 * E, W - E, E, E, H - 2 * E);
  ctx.restore();
}

function draw() {
  const p = palette;
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = p.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < COLS; i++) {
    ctx.moveTo(i * CELL + 0.5, 0);
    ctx.lineTo(i * CELL + 0.5, canvas.height);
  }
  for (let j = 1; j < ROWS; j++) {
    ctx.moveTo(0, j * CELL + 0.5);
    ctx.lineTo(canvas.width, j * CELL + 0.5);
  }
  ctx.stroke();

  drawFruit();
  drawSnake();
  if (skin.frame) drawFrame();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawText('SCORE ' + score, 12, 10, 18, p.hud);
  ctx.textAlign = 'right';
  drawText('LEVEL ' + level, canvas.width - 12, 10, 18, p.hud);

  if (state !== 'playing') {
    ctx.fillStyle = p.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = canvas.width / 2, cy = canvas.height / 2;
    if (state === 'ready') {
      drawText('SNAKE', cx, cy - 30, 56, p.title);
      drawText('PRESS SPACE TO START', cx, cy + 30, 20, p.text);
    } else if (state === 'paused') {
      drawText('PAUSED', cx, cy - 20, 48, p.pause);
      drawText('PRESS P TO RESUME', cx, cy + 30, 20, p.text);
    } else {
      drawText(won ? 'YOU WIN' : 'GAME OVER', cx, cy - 50, 52, won ? p.win : p.over);
      drawText('SCORE ' + score, cx, cy + 5, 24, p.text);
      drawText('SPACE TO PLAY AGAIN', cx, cy + 50, 20, p.text);
    }
  }

  if (skin.scanlines) drawScanlines();
}

function frame() {
  const now = performance.now();
  const dt = Math.min(250, now - lastTime);
  lastTime = now;
  if (state === 'playing') {
    acc += dt;
    const interval = 1000 / tickRate();
    while (acc >= interval && state === 'playing') {
      acc -= interval;
      step();
    }
  }
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code in KEY_DIRS) e.preventDefault();
  if (e.code === 'Space' || e.code === 'Enter') {
    if (state === 'ready' || state === 'gameover') {
      resetGame();
      state = 'playing';
    }
    return;
  }
  if (e.code === 'KeyP') {
    if (state === 'playing') state = 'paused';
    else if (state === 'paused') state = 'playing';
    return;
  }
  if (state === 'playing' && KEY_DIRS[e.code]) queueTurn(KEY_DIRS[e.code]);
});

// The host frame can be smaller than the 600x600 canvas: scale the page down to fit, never up.
function fitToFrame() {
  if (!innerWidth || !innerHeight) return; // hidden iframe: nothing to measure
  const scale = Math.min(1, innerWidth / canvas.width, innerHeight / canvas.height);
  document.getElementById('stage').style.zoom = scale < 1 ? String(scale) : '';
}

window.addEventListener('resize', fitToFrame);
fitToFrame();

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

// The canvas cannot read CSS variables, so the palette is cached here.
function refreshAppearance() {
  palette = skin.colors(document.documentElement.dataset.theme === 'light');
  frameSprite = null;
  // The loop may be frozen (host pause), so repaint explicitly.
  if (snake.length) draw();
}

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  skinSelect.blur(); // keep arrows/Space from changing the skin mid-game
});

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  themeToggle.blur(); // keep Space/Enter from re-triggering the toggle
});

skinSelect.innerHTML = Object.entries(SKINS).map(([id, k]) => `<option value="${id}">${k.name}</option>`).join('');

// Repaint once the sprite sheet arrives, in case the loop is frozen.
fruitsImg.addEventListener('load', () => { if (snake.length) draw(); });

resetGame();
applySkin('classic');
applyTheme('dark');
requestAnimationFrame(frame);
