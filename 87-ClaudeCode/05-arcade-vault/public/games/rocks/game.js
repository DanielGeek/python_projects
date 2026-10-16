'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap = (v, max) => ((v % max) + max) % max;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// Triple-shot power-up
const TRIPLE_DURATION = 5;   // s of triple fire after pickup
const DROP_CHANCE = 0.15;    // per destroyed asteroid, until one drops this level
const FORCE_DROP_REMAINING = 2;   // guaranteed drop once this few asteroids are left
const SPREAD = 0.2;          // rad between fan bullets
const POWERUP_TTL = 8;       // s before an uncollected pickup vanishes

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII = [0, 16, 30, 50];   // by size 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // base speed by size
const POINTS = [0, 100, 50, 20];  // points by size

// Fixed large-asteroid silhouette (traced from a reference image, 400x400 px)
const NOTCHED_SHAPE = {
  center: [195, 199],
  extent: 137,
  points: [[188, 63], [265, 86], [251, 171], [331, 195], [308, 282],
  [238, 279], [205, 335], [108, 287], [62, 206], [83, 119]],
};

class Asteroid {
  constructor(x, y, size = 3) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    this.verts = [];
    if (size === 3 && Math.random() < 0.25) {
      // One of the large-asteroid variants: the fixed notched shape
      const { center, extent, points } = NOTCHED_SHAPE;
      const k = this.radius / extent;
      for (const [px, py] of points) {
        this.verts.push([(px - center[0]) * k, (py - center[1]) * k]);
      }
    } else {
      // Irregular polygon
      const n = randInt(8, 13);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = this.radius * rand(0.6, 1.0);
        this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
    }
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() {
    this.tripleShot = 0;   // not in reset(): survives level change
    this.reset();
  }

  reset() {
    this.x = W / 2;
    this.y = H / 2;
    this.angle = -Math.PI / 2;
    this.vx = 0;
    this.vy = 0;
    this.radius = 12;
    this.thrusting = false;
    this.invincible = 3;
    this.shootCooldown = 0;
    this.dead = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.tripleShot > 0) this.tripleShot = Math.max(0, this.tripleShot - dt);

    const ROT = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG = 0.987;

    if (keys['ArrowLeft']) this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot > 0) {
      return [-SPREAD, 0, SPREAD].map(d => new Bullet(ox, oy, this.angle + d));
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Blink during respawn invincibility
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    // Classic silhouette: triangle with rear notch
    ctx.beginPath();
    ctx.moveTo(20, 0);   // nose
    ctx.lineTo(-12, -9);   // left wing
    ctx.lineTo(-7, 0);   // rear notch
    ctx.lineTo(-12, 9);   // right wing
    ctx.closePath();
    ctx.stroke();

    // Thruster flame
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8, 4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Particles (explosion) ─────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUp (triple shot pickup) ──────────────────────────────────────────────
class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    this.vx = Math.cos(angle) * 20;
    this.vy = Math.sin(angle) * 20;
    this.radius = 10;
    this.ttl = POWERUP_TTL;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Blink during the last 2 s
    if (this.ttl < 2 && Math.floor(this.ttl * 6) % 2 === 0) return;
    ctx.strokeStyle = '#0ff';
    ctx.fillStyle = '#0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('3', this.x, this.y + 5);
  }
}

// ── Game state ────────────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let tripleDropped;   // at most one triple-shot drop per level (reset in nextLevel)
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship = new Ship();
  bullets = [];
  asteroids = [];
  particles = [];
  powerups = [];
  tripleDropped = false;
  score = 0;
  lives = 3;
  level = 1;
  state = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets = [];
  particles = [];
  tripleDropped = false;
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  ship.tripleShot = 0;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Shoot
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups = powerups.filter(p => !p.dead);

  // Ship vs power-up
  for (const p of powerups) {
    if (dist(ship, p) < ship.radius + p.radius) {
      ship.tripleShot = TRIPLE_DURATION;
      p.dead = true;
      explode(p.x, p.y, 6);
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Bullet vs asteroid
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        const remaining = asteroids.filter(x => !x.dead).length + newAsteroids.length;
        if (!tripleDropped && (Math.random() < DROP_CHANCE || remaining <= FORCE_DROP_REMAINING)) {
          powerups.push(new PowerUp(a.x, a.y));
          tripleDropped = true;
        }
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets = bullets.filter(b => !b.dead);

  // Ship vs asteroid
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Level complete
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, 5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);
  if (ship.tripleShot > 0) {
    ctx.fillStyle = '#0ff';
    ctx.fillText(`TRIPLE ${Math.ceil(ship.tripleShot)}s`, 14, 46);
    ctx.fillStyle = '#fff';
  }

  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font = '18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `SCORE: ${score}   —   PRESS SPACE TO RESTART`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
