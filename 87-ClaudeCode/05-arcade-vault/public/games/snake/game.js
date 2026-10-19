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
  ctx.font = 'bold ' + size + 'px monospace';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function draw() {
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#14142a';
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

  if (fruit && fruitsReady) {
    const s = window.SPRITE_ATLAS.fruits[fruit.sprite];
    const scale = Math.min(CELL / s.w, CELL / s.h);
    const w = s.w * scale, h = s.h * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fruitsImg, s.x, s.y, s.w, s.h,
      fruit.x * CELL + (CELL - w) / 2, fruit.y * CELL + (CELL - h) / 2, w, h);
  }

  snake.forEach((c, i) => {
    ctx.fillStyle = i === 0 ? '#7dffb0' : '#00ff88';
    ctx.fillRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4);
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawText('SCORE ' + score, 12, 10, 18, '#e8e8ff');
  ctx.textAlign = 'right';
  drawText('LEVEL ' + level, canvas.width - 12, 10, 18, '#e8e8ff');

  if (state === 'playing') return;
  ctx.fillStyle = 'rgba(10, 10, 24, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = canvas.width / 2, cy = canvas.height / 2;
  if (state === 'ready') {
    drawText('SNAKE', cx, cy - 30, 56, '#00ff88');
    drawText('PRESS SPACE TO START', cx, cy + 30, 20, '#e8e8ff');
  } else if (state === 'paused') {
    drawText('PAUSED', cx, cy - 20, 48, '#ffee00');
    drawText('PRESS P TO RESUME', cx, cy + 30, 20, '#e8e8ff');
  } else {
    drawText(won ? 'YOU WIN' : 'GAME OVER', cx, cy - 50, 52, won ? '#ffee00' : '#ff2bd6');
    drawText('SCORE ' + score, cx, cy + 5, 24, '#e8e8ff');
    drawText('SPACE TO PLAY AGAIN', cx, cy + 50, 20, '#e8e8ff');
  }
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

resetGame();
requestAnimationFrame(frame);
