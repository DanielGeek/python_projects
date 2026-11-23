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
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
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
const RADII  = [0, 16, 30, 50];   // by size 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // base speed by size
const POINTS = [0, 100, 50, 20];  // points by size

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.rgb    = '255,255,255';   // stroke and particle color
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Irregular polygon
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
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
    ctx.strokeStyle = `rgb(${this.rgb})`;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Shooting star: fast asteroid with limited lifetime ────────────────────────
const SHOOTING_STAR_SPEED  = 260;  // px/s, much faster than regular asteroids
const SHOOTING_STAR_TTL    = 8;    // seconds before expiring on its own
const SHOOTING_STAR_POINTS = 200;  // bonus score when shot down
const SHOOTING_STAR_SPAWN_INTERVAL = 20;  // seconds between spawns
const SHOOTING_STAR_FIRST_DELAY   = 12;  // delay before the first spawn
const SHOOTING_STAR_SAFE_DIST     = 150; // min distance from the ship
const SHOOTING_STAR_RGB = '255,215,0';   // gold: stroke, tail and particles

class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 1);
    this.points  = SHOOTING_STAR_POINTS;
    this.rgb     = SHOOTING_STAR_RGB;
    this.ttl     = SHOOTING_STAR_TTL;
    this.expired = false;

    const angle = rand(0, Math.PI * 2);
    this.vx = Math.cos(angle) * SHOOTING_STAR_SPEED;
    this.vy = Math.sin(angle) * SHOOTING_STAR_SPEED;
    this.rotSpeed = rand(-3, 3);
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.expired = true;
      this.dead = true;
    }
  }

  split() { return []; }

  draw() {
    this.drawTail();
    super.draw();
  }

  // Comet tail: fading golden streaks behind the direction of motion
  drawTail() {
    const speed = Math.hypot(this.vx, this.vy);
    if (speed === 0) return;
    const tx = -this.vx / speed;
    const ty = -this.vy / speed;

    ctx.save();
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const from = this.radius + i * 9;
      const to   = from + 8 + rand(-2, 2);
      ctx.strokeStyle = `rgba(${this.rgb},${(0.55 / (i + 1)).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(this.x + tx * from, this.y + ty * from);
      ctx.lineTo(this.x + tx * to,   this.y + ty * to);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Power-ups: Velocity and Shield ────────────────────────────────────────────
const POWERUP_TTL       = 10;    // seconds before despawning
const POWERUP_SAFE_DIST = 150;   // min distance from the ship on periodic spawn
const SPAWN_INTERVAL    = 15;    // seconds between periodic spawns
const FIRST_SPAWN_DELAY = 10;    // delay before the first periodic spawn
const DROP_CHANCE       = 0.10;  // chance a destroyed asteroid drops a power-up

const VELOCITY_DURATION   = 5;   // seconds of doubled thrust
const VELOCITY_MULTIPLIER = 2;
const VELOCITY_RGB        = '0,255,255';

const SHIELD_DURATION = 6;      // seconds of collision protection
const SHIELD_RADIUS   = 22;     // bubble radius around the ship
const SHIELD_RGB      = '0,255,0';

// Each kind fixes the pickup color, burst and HUD bar
const POWERUP_COLORS = { velocity: VELOCITY_RGB, shield: SHIELD_RGB };
const POWERUP_KINDS  = Object.keys(POWERUP_COLORS);
const randomKind     = () => POWERUP_KINDS[randInt(0, POWERUP_KINDS.length - 1)];

class PowerUp {
  constructor(x, y, kind) {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.rgb    = POWERUP_COLORS[kind];
    this.radius = 11;
    this.ttl = POWERUP_TTL;
    this.dead = false;
  }

  update(dt) {
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = `rgb(${this.rgb})`;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Hexagon outline
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * this.radius;
      const py = Math.sin(a) * this.radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    this.drawGlyph();

    // Despawn bar: depletes as expiry approaches
    drawTimerBar(-13, this.radius + 5, 26, 3, this.ttl / POWERUP_TTL, this.rgb);

    ctx.restore();
  }

  // Inner glyph identifies the effect
  drawGlyph() {
    ctx.beginPath();
    if (this.kind === 'shield') {
      // Shield: dome sitting on a base line
      ctx.arc(0, 2, 5, Math.PI, 0);
      ctx.moveTo(-5, 2);
      ctx.lineTo( 5, 2);
    } else {
      // Velocity: double chevron ">>"
      ctx.moveTo(-5, -4);
      ctx.lineTo(-1,  0);
      ctx.lineTo(-5,  4);
      ctx.moveTo( 1, -4);
      ctx.lineTo( 5,  0);
      ctx.lineTo( 1,  4);
    }
    ctx.stroke();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.velocityTimer = 0;
    this.shieldTimer   = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.velocityTimer > 0) this.velocityTimer  = Math.max(0, this.velocityTimer - dt);
    if (this.shieldTimer   > 0) this.shieldTimer    = Math.max(0, this.shieldTimer - dt);

    const ROT   = 3.5;   // rad/s
    const BASE_THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    const thrust = this.velocityTimer > 0 ? BASE_THRUST * VELOCITY_MULTIPLIER : BASE_THRUST;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * thrust * dt;
      this.vy += Math.sin(this.angle) * thrust * dt;
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
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Blink while invincible after respawn
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Classic silhouette: triangle with a rear notch
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nose
    ctx.lineTo(-12, -9);   // left wing
    ctx.lineTo( -7,  0);   // rear notch
    ctx.lineTo(-12,  9);   // right wing
    ctx.closePath();
    ctx.stroke();

    // Thruster flame (cyan while Velocity is active)
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = this.velocityTimer > 0
        ? `rgba(${VELOCITY_RGB}, 0.85)`
        : 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    // Shield bubble: gentle pulse while Shield is active
    if (this.shieldTimer > 0) {
      const r = SHIELD_RADIUS + Math.sin(this.shieldTimer * 6) * 1.5;
      ctx.strokeStyle = `rgba(${SHIELD_RGB}, 0.7)`;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Particles (explosion) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y, rgb = '255,255,255') {
    this.x  = x;
    this.y  = y;
    this.rgb = rgb;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${this.rgb},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Game state ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let powerupTimer;
let shootingStarTimer;

function randomPositionAwayFrom(px, py, safeDist) {
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - px, y - py) < safeDist);
  return [x, y];
}

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    const [x, y] = randomPositionAwayFrom(W / 2, H / 2, SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  powerupTimer = FIRST_SPAWN_DELAY;
  shootingStarTimer = SHOOTING_STAR_FIRST_DELAY;
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  ship.reset();
  shootingStarTimer = SHOOTING_STAR_FIRST_DELAY;
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8, rgb) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, rgb));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

function updateAsteroids(dt) {
  for (const a of asteroids) {
    a.update(dt);
    // An expired shooting star bursts into golden sparks (no points)
    if (a.expired) explode(a.x, a.y, 14, a.rgb);
  }
  asteroids = asteroids.filter(a => !a.dead);
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
    updateAsteroids(dt);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Shoot
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  updateAsteroids(dt);
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  bullets    = bullets.filter(b => !b.dead);
  particles  = particles.filter(p => !p.dead);
  powerups   = powerups.filter(p => !p.dead);

  // Periodic power-up spawn, only when none is on screen
  if (powerups.length === 0) {
    powerupTimer -= dt;
    if (powerupTimer <= 0) {
      const [x, y] = randomPositionAwayFrom(ship.x, ship.y, POWERUP_SAFE_DIST);
      powerups.push(new PowerUp(x, y, randomKind()));
      powerupTimer = SPAWN_INTERVAL;
    }
  }

  // Periodic shooting-star spawn, only when none is on screen
  if (!asteroids.some(a => a instanceof ShootingStar)) {
    shootingStarTimer -= dt;
    if (shootingStarTimer <= 0) {
      const [x, y] = randomPositionAwayFrom(ship.x, ship.y, SHOOTING_STAR_SAFE_DIST);
      asteroids.push(new ShootingStar(x, y));
      shootingStarTimer = SHOOTING_STAR_SPAWN_INTERVAL;
    }
  }

  // Bullet vs asteroid
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points;
        explode(a.x, a.y, a.size * 5, a.rgb);
        if (Math.random() < DROP_CHANCE) powerups.push(new PowerUp(a.x, a.y, randomKind()));
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Ship vs asteroid: an active shield vaporizes it, otherwise the ship dies
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shieldTimer > 0) {
          a.dead = true;
          explode(a.x, a.y, a.size * 5, a.rgb);
        } else {
          killShip();
          break;
        }
      }
    }
    asteroids = asteroids.filter(a => !a.dead);
  }

  // Ship vs power-up: collect Velocity or Shield
  for (const p of powerups) {
    if (!p.dead && !ship.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.kind === 'shield') ship.shieldTimer   = SHIELD_DURATION;
      else                     ship.velocityTimer = VELOCITY_DURATION;
      explode(p.x, p.y, 12, p.rgb);
    }
  }

  // Level completed
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
// Timer bar: dim track plus a bright fill that depletes with ratio (0–1)
function drawTimerBar(x, y, width, height, ratio, rgb) {
  const clamped = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = `rgba(${rgb}, 0.25)`;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.fillRect(x, y, width * clamped, height);
}

function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Effect label with a depleting bar, stacked under the score
function drawEffect(label, ratio, rgb, y) {
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.font = '13px monospace';
  ctx.fillText(label, 14, y);
  drawTimerBar(14, y + 6, 62, 4, ratio, rgb);
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  let effectY = 46;
  if (ship.velocityTimer > 0) {
    drawEffect('VELOCITY', ship.velocityTimer / VELOCITY_DURATION, VELOCITY_RGB, effectY);
    effectY += 20;
  }
  if (ship.shieldTimer > 0) {
    drawEffect('SHIELD', ship.shieldTimer / SHIELD_DURATION, SHIELD_RGB, effectY);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `SCORE: ${score}   —   PRESS SPACE TO RESTART`);
}

// ── Main loop ────────────────────────────────────────────────────────────
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
