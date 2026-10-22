'use strict';

const canvas = document.getElementById( 'canvas' );
const ctx = canvas.getContext( '2d' );
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────

const keys = {};
const justPressed = {};

window.addEventListener( 'keydown', e => {
  // Inside the host iframe these keys would scroll the parent page.
  if ( [ 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' ].includes( e.code ) ) e.preventDefault();
  if ( !keys[ e.code ] ) justPressed[ e.code ] = true;
  keys[ e.code ] = true;
} );
window.addEventListener( 'keyup', e => { keys[ e.code ] = false; } );

function pressed( code ) {
  const val = justPressed[ code ];
  justPressed[ code ] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap = ( v, max ) => ( ( v % max ) + max ) % max;
const dist = ( a, b ) => Math.hypot( a.x - b.x, a.y - b.y );
const rand = ( min, max ) => min + Math.random() * ( max - min );
const randInt = ( min, max ) => Math.floor( rand( min, max + 1 ) );

// ── Skins ─────────────────────────────────────────────────────────────────────
// A skin changes only colors, strokes, glow, fonts and the backdrop; never gameplay.
// colors(light) returns the palette for the active theme. The play area of `neon`
// stays dark in both themes.
const SKINS = {
  classic: {
    name: 'Classic',
    font: 'monospace',
    glow: 0,
    lineWidth: 1.5,
    lineJoin: 'round',
    squareBullets: false,
    scanlines: false,
    colors: light => light ? {
      bg: '#f4f4ee', ship: '#111111', rock: '#111111', bullet: '#111111', power: '#006a8e',
      flame: '#b34700', hud: '#111111', sub: 'rgba(17,17,17,0.75)', spark: '17,17,17',
    } : {
      bg: '#000000', ship: '#ffffff', rock: '#ffffff', bullet: '#ffffff', power: '#00ffff',
      flame: 'rgba(255, 130, 0, 0.85)', hud: '#ffffff', sub: 'rgba(255,255,255,0.65)', spark: '255,255,255',
    },
  },
  retro: {
    name: 'Retro',
    font: '"Courier New", Courier, monospace',
    glow: 0,
    lineWidth: 2.5,
    lineJoin: 'miter',
    squareBullets: true,
    scanlines: true,
    colors: light => light ? {
      bg: '#cfe0b4', ship: '#1d3511', rock: '#1d3511', bullet: '#1d3511', power: '#0b4a2a',
      flame: '#7a3300', hud: '#1d3511', sub: '#2c4a1c', spark: '29,53,17',
    } : {
      bg: '#150d00', ship: '#ffb000', rock: '#ffb000', bullet: '#ffd34d', power: '#ffe58a',
      flame: '#ff6a00', hud: '#ffb000', sub: '#e09a00', spark: '255,176,0',
    },
  },
  neon: {
    name: 'Neon',
    font: 'monospace',
    glow: 12,
    lineWidth: 1.8,
    lineJoin: 'round',
    squareBullets: false,
    scanlines: false,
    batchRocks: true, // one stroke (one shadow pass) for all rocks, see drawAsteroids()
    colors: () => ( {
      bg: '#04040a', ship: '#39ff14', rock: '#00f0ff', bullet: '#ffee00', power: '#ff2bd6',
      flame: '#ff7a00', hud: '#e8ffff', sub: '#b8f4ff', spark: '0,240,255',
    } ),
  },
};

let skin = SKINS.classic;
let palette = skin.colors( false );

// Stroke/fill color plus the skin's glow. Call inside save()/restore().
function glow( color ) {
  ctx.shadowColor = color;
  ctx.shadowBlur = skin.glow;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const POWERUP_DROP_CHANCE = 0.15;
const POWERUP_DURATION = 5;
const POWERUP_TTL = 12;
const TRIPLE_SPREAD = 0.18;

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor( x, y, angle ) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos( angle ) * SPEED;
    this.vy = Math.sin( angle ) * SPEED;
    this.ttl = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update( dt ) {
    this.x = wrap( this.x + this.vx * dt, W );
    this.y = wrap( this.y + this.vy * dt, H );
    this.ttl -= dt;
    if ( this.ttl <= 0 ) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.fillStyle = palette.bullet;
    glow( palette.bullet );
    if ( skin.squareBullets ) {
      ctx.fillRect( Math.round( this.x ) - 2, Math.round( this.y ) - 2, 4, 4 );
    } else {
      ctx.beginPath();
      ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2 );
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII = [ 0, 16, 30, 50 ];   // by size 1, 2, 3
const SPEEDS = [ 0, 85, 55, 32 ];   // base speed by size
const POINTS = [ 0, 100, 50, 20 ];  // points by size

class Asteroid {
  constructor( x, y, size = 3 ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = RADII[ size ];
    this.dead = false;

    const angle = rand( 0, Math.PI * 2 );
    const speed = SPEEDS[ size ] + rand( -15, 15 );
    this.vx = Math.cos( angle ) * speed;
    this.vy = Math.sin( angle ) * speed;
    this.rotSpeed = rand( -1.2, 1.2 );
    this.rot = rand( 0, Math.PI * 2 );

    // Irregular polygon
    const n = randInt( 8, 13 );
    this.verts = [];
    for ( let i = 0; i < n; i++ ) {
      const a = ( i / n ) * Math.PI * 2;
      const r = this.radius * rand( 0.6, 1.0 );
      this.verts.push( [ Math.cos( a ) * r, Math.sin( a ) * r ] );
    }
  }

  update( dt ) {
    this.x = wrap( this.x + this.vx * dt, W );
    this.y = wrap( this.y + this.vy * dt, H );
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if ( this.size <= 1 ) return [];
    return [
      new Asteroid( this.x, this.y, this.size - 1 ),
      new Asteroid( this.x, this.y, this.size - 1 ),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( this.rot );
    ctx.strokeStyle = palette.rock;
    ctx.lineWidth = skin.lineWidth;
    ctx.lineJoin = skin.lineJoin;
    glow( palette.rock );
    ctx.beginPath();
    ctx.moveTo( this.verts[ 0 ][ 0 ], this.verts[ 0 ][ 1 ] );
    for ( let i = 1; i < this.verts.length; i++ )
      ctx.lineTo( this.verts[ i ][ 0 ], this.verts[ i ][ 1 ] );
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── PowerUp ───────────────────────────────────────────────────────────────────
class PowerUp {
  constructor( x, y ) {
    this.x = x;
    this.y = y;
    const angle = rand( 0, Math.PI * 2 );
    const speed = rand( 20, 40 );
    this.vx = Math.cos( angle ) * speed;
    this.vy = Math.sin( angle ) * speed;
    this.radius = 12;
    this.ttl = POWERUP_TTL;
    this.dead = false;
  }

  update( dt ) {
    this.x = wrap( this.x + this.vx * dt, W );
    this.y = wrap( this.y + this.vy * dt, H );
    this.ttl -= dt;
    if ( this.ttl <= 0 ) this.dead = true;
  }

  draw() {
    if ( this.ttl < 2 && Math.floor( this.ttl * 8 ) % 2 === 0 ) return;
    const pulse = 0.85 + Math.sin( performance.now() / 150 ) * 0.15;
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( Math.PI / 4 );
    ctx.strokeStyle = palette.power;
    ctx.lineWidth = 2;
    glow( palette.power );
    const r = this.radius * pulse;
    ctx.strokeRect( -r, -r, r * 2, r * 2 );
    ctx.restore();
    ctx.save();
    ctx.fillStyle = palette.power;
    glow( palette.power );
    ctx.font = `bold 12px ${ skin.font }`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText( '3x', this.x, this.y );
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() {
    this.tripleShot = 0;
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

  update( dt ) {
    if ( this.dead ) return;
    if ( this.invincible > 0 ) this.invincible -= dt;
    if ( this.shootCooldown > 0 ) this.shootCooldown -= dt;
    if ( this.tripleShot > 0 ) this.tripleShot -= dt;

    const ROT = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG = 0.987;

    if ( keys[ 'ArrowLeft' ] ) this.angle -= ROT * dt;
    if ( keys[ 'ArrowRight' ] ) this.angle += ROT * dt;

    this.thrusting = !!keys[ 'ArrowUp' ];
    if ( this.thrusting ) {
      this.vx += Math.cos( this.angle ) * THRUST * dt;
      this.vy += Math.sin( this.angle ) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap( this.x + this.vx * dt, W );
    this.y = wrap( this.y + this.vy * dt, H );
  }

  tryShoot() {
    if ( this.shootCooldown > 0 || this.dead ) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos( this.angle ) * NOSE;
    const oy = this.y + Math.sin( this.angle ) * NOSE;
    if ( this.tripleShot > 0 ) {
      return [
        new Bullet( ox, oy, this.angle - TRIPLE_SPREAD ),
        new Bullet( ox, oy, this.angle ),
        new Bullet( ox, oy, this.angle + TRIPLE_SPREAD ),
      ];
    }
    return [ new Bullet( ox, oy, this.angle ) ];
  }

  draw() {
    if ( this.dead ) return;
    // Blink while invincible after respawn
    if ( this.invincible > 0 && Math.floor( this.invincible * 8 ) % 2 === 0 ) return;

    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
    ctx.strokeStyle = palette.ship;
    ctx.lineWidth = skin.lineWidth;
    ctx.lineJoin = skin.lineJoin;
    glow( palette.ship );

    // Classic silhouette: triangle with a rear notch
    ctx.beginPath();
    ctx.moveTo( 20, 0 );   // nose
    ctx.lineTo( -12, -9 );   // left wing
    ctx.lineTo( -7, 0 );   // rear notch
    ctx.lineTo( -12, 9 );   // right wing
    ctx.closePath();
    ctx.stroke();

    // Thruster flame
    if ( this.thrusting && Math.random() > 0.35 ) {
      ctx.beginPath();
      ctx.moveTo( -8, -4 );
      ctx.lineTo( -8 - rand( 6, 14 ), 0 );
      ctx.lineTo( -8, 4 );
      ctx.strokeStyle = palette.flame;
      glow( palette.flame );
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Particles (explosion) ─────────────────────────────────────────────────────
class Particle {
  constructor( x, y ) {
    this.x = x;
    this.y = y;
    const angle = rand( 0, Math.PI * 2 );
    const speed = rand( 30, 130 );
    this.vx = Math.cos( angle ) * speed;
    this.vy = Math.sin( angle ) * speed;
    this.life = rand( 0.4, 1.1 );
    this.ttl = this.life;
    this.dead = false;
  }

  update( dt ) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if ( this.ttl <= 0 ) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${ palette.spark },${ alpha.toFixed( 2 ) })`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.x - this.vx * 0.05, this.y - this.vy * 0.05 );
    ctx.stroke();
  }
}

// ── Game state ────────────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerUps;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let powerUpSpawned;
let killsSinceSpawn;

function spawnAsteroids( count ) {
  const SAFE_DIST = 130;
  for ( let i = 0; i < count; i++ ) {
    let x, y;
    do {
      x = rand( 0, W );
      y = rand( 0, H );
    } while ( Math.hypot( x - W / 2, y - H / 2 ) < SAFE_DIST );
    asteroids.push( new Asteroid( x, y, 3 ) );
  }
}

function initGame() {
  ship = new Ship();
  bullets = [];
  asteroids = [];
  particles = [];
  powerUps = [];
  powerUpSpawned = false;
  killsSinceSpawn = 0;
  score = 0;
  lives = 3;
  level = 1;
  state = 'playing';
  spawnAsteroids( 4 );
}

function nextLevel() {
  level++;
  bullets = [];
  particles = [];
  powerUps = [];
  powerUpSpawned = false;
  killsSinceSpawn = 0;
  ship.reset();
  spawnAsteroids( 3 + level );
}

function explode( x, y, count = 8 ) {
  for ( let i = 0; i < count; i++ ) particles.push( new Particle( x, y ) );
}

function killShip() {
  explode( ship.x, ship.y, 14 );
  ship.dead = true;
  lives--;
  if ( lives <= 0 ) {
    state = 'gameover';
  } else {
    state = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update( dt ) {
  if ( state === 'gameover' ) {
    if ( pressed( 'Space' ) ) initGame();
    particles.forEach( p => p.update( dt ) );
    particles = particles.filter( p => !p.dead );
    return;
  }

  if ( state === 'dead' ) {
    deadTimer -= dt;
    particles.forEach( p => p.update( dt ) );
    particles = particles.filter( p => !p.dead );
    asteroids.forEach( a => a.update( dt ) );
    if ( deadTimer <= 0 ) { state = 'playing'; ship.reset(); }
    return;
  }

  // Shoot
  if ( pressed( 'Space' ) ) {
    bullets.push( ...ship.tryShoot() );
  }

  ship.update( dt );
  bullets.forEach( b => b.update( dt ) );
  asteroids.forEach( a => a.update( dt ) );
  particles.forEach( p => p.update( dt ) );
  powerUps.forEach( p => p.update( dt ) );

  bullets = bullets.filter( b => !b.dead );
  particles = particles.filter( p => !p.dead );
  powerUps = powerUps.filter( p => !p.dead );

  for ( const p of powerUps ) {
    if ( !p.dead && dist( ship, p ) < ship.radius + p.radius ) {
      p.dead = true;
      ship.tripleShot = POWERUP_DURATION;
    }
  }

  // Bullet vs asteroid
  const newAsteroids = [];
  for ( const b of bullets ) {
    for ( const a of asteroids ) {
      if ( !a.dead && !b.dead && dist( b, a ) < a.radius ) {
        b.dead = true;
        a.dead = true;
        score += POINTS[ a.size ];
        explode( a.x, a.y, a.size * 5 );
        newAsteroids.push( ...a.split() );
        if ( !powerUpSpawned ) {
          killsSinceSpawn++;
          const guaranteed = killsSinceSpawn >= 5;
          if ( guaranteed || Math.random() < POWERUP_DROP_CHANCE ) {
            powerUps.push( new PowerUp( a.x, a.y ) );
            powerUpSpawned = true;
          }
        }
      }
    }
  }
  asteroids = asteroids.filter( a => !a.dead ).concat( newAsteroids );
  bullets = bullets.filter( b => !b.dead );

  // Ship vs asteroid
  if ( ship.invincible <= 0 ) {
    for ( const a of asteroids ) {
      if ( dist( ship, a ) < ship.radius + a.radius * 0.82 ) {
        killShip();
        break;
      }
    }
  }

  // Level complete
  if ( asteroids.length === 0 ) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon( x, y ) {
  ctx.save();
  ctx.translate( x, y );
  ctx.rotate( -Math.PI / 2 );
  ctx.strokeStyle = palette.ship;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = skin.lineJoin;
  glow( palette.ship );
  ctx.beginPath();
  ctx.moveTo( 9, 0 );
  ctx.lineTo( -6, -5 );
  ctx.lineTo( -3, 0 );
  ctx.lineTo( -6, 5 );
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.save();
  ctx.fillStyle = palette.hud;
  ctx.font = `15px ${ skin.font }`;
  glow( palette.hud );

  ctx.textAlign = 'left';
  ctx.fillText( `SCORE  ${ score }`, 14, 26 );

  ctx.textAlign = 'center';
  ctx.fillText( `LEVEL ${ level }`, W / 2, 26 );

  for ( let i = 0; i < lives; i++ )
    drawLifeIcon( W - 16 - i * 22, 18 );

  if ( ship.tripleShot > 0 ) {
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.power;
    glow( palette.power );
    ctx.fillText( `3x  ${ ship.tripleShot.toFixed( 1 ) }s`, 14, 46 );
  }
  ctx.restore();
}

function drawOverlay( title, sub ) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.hud;
  glow( palette.hud );
  ctx.font = `bold 46px ${ skin.font }`;
  ctx.fillText( title, W / 2, H / 2 - 18 );
  ctx.font = `18px ${ skin.font }`;
  ctx.fillStyle = palette.sub;
  ctx.fillText( sub, W / 2, H / 2 + 22 );
  ctx.restore();
}

// A glowing skin pays one shadow blur per stroke, so its rocks go into a single
// path and a single stroke. The rotation is applied by hand, so the outlines are
// the same as Asteroid.draw(); only overlapping glows blend once instead of twice.
function drawAsteroids() {
  if ( !skin.batchRocks ) {
    asteroids.forEach( a => a.draw() );
    return;
  }
  ctx.save();
  ctx.strokeStyle = palette.rock;
  ctx.lineWidth = skin.lineWidth;
  ctx.lineJoin = skin.lineJoin;
  glow( palette.rock );
  ctx.beginPath();
  for ( const a of asteroids ) {
    const c = Math.cos( a.rot );
    const s = Math.sin( a.rot );
    const v = a.verts;
    ctx.moveTo( a.x + v[ 0 ][ 0 ] * c - v[ 0 ][ 1 ] * s, a.y + v[ 0 ][ 0 ] * s + v[ 0 ][ 1 ] * c );
    for ( let i = 1; i < v.length; i++ )
      ctx.lineTo( a.x + v[ i ][ 0 ] * c - v[ i ][ 1 ] * s, a.y + v[ i ][ 0 ] * s + v[ i ][ 1 ] * c );
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.fillStyle = palette.bg;
  ctx.fillRect( 0, 0, W, H );

  particles.forEach( p => p.draw() );
  drawAsteroids();
  powerUps.forEach( p => p.draw() );
  bullets.forEach( b => b.draw() );
  ship.draw();

  drawHUD();

  if ( state === 'gameover' )
    drawOverlay( 'GAME OVER', `SCORE: ${ score }   —   PRESS SPACE TO RESTART` );

  if ( skin.scanlines ) {
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for ( let y = 0; y < H; y += 4 ) ctx.fillRect( 0, y, W, 1 );
  }
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop( ts ) {
  const dt = lastTime === null ? 0 : Math.min( ( ts - lastTime ) / 1000, 0.05 );
  lastTime = ts;
  update( dt );
  draw();
  requestAnimationFrame( loop );
}

// ── Appearance (skin + theme) ─────────────────────────────────────────────────
// Always starts with skin `classic` and theme `dark`; nothing is stored.
const skinSelect = document.getElementById( 'skin-select' );
const themeToggle = document.getElementById( 'theme-toggle' );
const themeToggleIcon = document.getElementById( 'theme-toggle-icon' );
const themeToggleText = document.getElementById( 'theme-toggle-text' );

function applySkin( id ) {
  skin = SKINS[ id ];
  document.documentElement.dataset.skin = id;
  skinSelect.value = id;
  refreshAppearance();
}

function applyTheme( theme ) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute( 'aria-pressed', String( isLight ) );
  themeToggleIcon.textContent = isLight ? '\u263E' : '\u2600';
  themeToggleText.textContent = isLight ? 'Dark' : 'Light';
  refreshAppearance();
}

// The canvas cannot read CSS variables, so the palette is cached here.
function refreshAppearance() {
  palette = skin.colors( document.documentElement.dataset.theme === 'light' );
  // The loop may be frozen (host pause), so repaint explicitly.
  if ( ship ) draw();
}

skinSelect.addEventListener( 'change', () => {
  applySkin( skinSelect.value );
  skinSelect.blur(); // keep arrows/Space from changing the skin mid-game
} );

themeToggle.addEventListener( 'click', () => {
  applyTheme( document.documentElement.dataset.theme === 'light' ? 'dark' : 'light' );
  themeToggle.blur(); // keep Space/Enter from re-triggering the toggle
} );

skinSelect.innerHTML = Object.entries( SKINS ).map( ( [ id, k ] ) => `<option value="${ id }">${ k.name }</option>` ).join( '' );

initGame();
applySkin( 'classic' );
applyTheme( 'dark' );
requestAnimationFrame( loop );
