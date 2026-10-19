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
  snake.unshift(head);
  snake.pop();
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

  snake.forEach((c, i) => {
    ctx.fillStyle = i === 0 ? '#7dffb0' : '#00ff88';
    ctx.fillRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4);
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  drawText('SCORE ' + score, 12, 10, 18, '#e8e8ff');
  ctx.textAlign = 'right';
  drawText('LEVEL ' + level, canvas.width - 12, 10, 18, '#e8e8ff');

  if (state === 'ready') {
    ctx.fillStyle = 'rgba(10, 10, 24, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawText('SNAKE', canvas.width / 2, canvas.height / 2 - 30, 56, '#00ff88');
    drawText('PRESS SPACE TO START', canvas.width / 2, canvas.height / 2 + 30, 20, '#e8e8ff');
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
  if (state === 'playing' && KEY_DIRS[e.code]) queueTurn(KEY_DIRS[e.code]);
});

resetGame();
requestAnimationFrame(frame);
