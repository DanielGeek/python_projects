const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDLE_W = 120;
const PADDLE_H = 16;
const PADDLE_Y = CANVAS_H - 40;
const PADDLE_SPEED = 600; // px/s
const BALL_R = 8;
const LAUNCH_ANGLE = 15 * Math.PI / 180; // tilt from the vertical
const MAX_BOUNCE_ANGLE = 60 * Math.PI / 180; // paddle edge exit angle from the vertical
const COLS = 10;
const BRICK_W = 72;
const BRICK_H = 24;
const BRICK_MARGIN_X = ( CANVAS_W - COLS * BRICK_W ) / 2;
const BRICK_TOP = 60;
const POINTS_PER_BRICK = 10;
const MAX_STEP = BALL_R / 2; // max ball displacement per sub-step, well below the radius

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

// ── Skins ─────────────────────────────────────────────────────────────────────
// A skin changes only colors, strokes, glow, fonts and the backdrop; never gameplay.
// colors(light) returns the palette for the active theme; the draw hooks read it.
// `classic` is the original spritesheet look. The play area of `neon` stays dark in both themes.
const SKINS = {
  classic: {
    name: 'Classic',
    font: 'monospace',
    glow: 0,
    scanlines: false,
    colors: ( light ) => light ? {
      bg: '#f0f0ea', hud: '#111111', dim: '#5c5c5c', hint: '#444444',
      dimLayer: 'rgba( 240, 240, 234, 0.85 )', overlayText: '#111111',
      outline: '#111111', // the sprites' own 1 px black edge is too thin on a light field
    } : {
      bg: '#000000', hud: '#ffffff', dim: '#888888', hint: '#aaaaaa',
      dimLayer: 'rgba( 0, 0, 0, 0.7 )', overlayText: '#ffffff',
      outline: null,
    },
    brick: drawSpriteBrick,
    explosion: drawSpriteExplosion,
    paddle: drawSpritePaddle,
    ball: drawSpriteBall,
  },
  retro: {
    name: 'Retro',
    font: '"Courier New", Courier, monospace',
    glow: 0,
    scanlines: true,
    // Amber phosphor CRT in dark, green LCD in light. Bricks are shades of one phosphor,
    // told apart by their pixel fill (solid, checker or stripes).
    colors: ( light ) => light ? {
      bg: '#cfe0b4', hud: '#1d3511', dim: '#3d5a2a', hint: '#2c4a1c',
      dimLayer: 'rgba( 207, 224, 180, 0.85 )', overlayText: '#1d3511',
      paddle: '#1d3511', ball: '#0b2a10', scan: 'rgba( 0, 0, 0, 0.07 )',
      bricks: { red: '#1d3511', yellow: '#3d5a2a', cyan: '#0b4a2a', magenta: '#2c4a1c', hotpink: '#4a5a10', green: '#14301e' },
    } : {
      bg: '#150d00', hud: '#ffb000', dim: '#b37b00', hint: '#e09a00',
      dimLayer: 'rgba( 21, 13, 0, 0.8 )', overlayText: '#ffb000',
      paddle: '#ffb000', ball: '#ffe58a', scan: 'rgba( 0, 0, 0, 0.18 )',
      bricks: { red: '#ff6a00', yellow: '#ffd34d', cyan: '#ffe58a', magenta: '#ffb000', hotpink: '#ff8c1a', green: '#e09a00' },
    },
    brick: drawRetroBrick,
    explosion: drawRetroExplosion,
    paddle: drawRetroPaddle,
    ball: drawRetroBall,
  },
  neon: {
    name: 'Neon',
    font: 'monospace',
    glow: 12,
    scanlines: false,
    colors: () => ( {
      bg: '#04040a', hud: '#e8ffff', dim: '#8a9bb3', hint: '#b8f4ff',
      dimLayer: 'rgba( 4, 4, 10, 0.8 )', overlayText: '#e8ffff',
      paddle: '#00f0ff', ball: '#ffffff', ballGlow: '#00f0ff', textGlow: '#00f0ff',
      bricks: { red: '#ff3b5c', yellow: '#ffee00', cyan: '#00f0ff', magenta: '#ff2bd6', hotpink: '#ff8a00', green: '#39ff14' },
    } ),
    brick: drawNeonBrick,
    explosion: drawNeonExplosion,
    paddle: drawNeonPaddle,
    ball: drawNeonBall,
  },
};

const RETRO_FILLS = { red: 'solid', yellow: 'checker', cyan: 'stripes', magenta: 'solid', hotpink: 'checker', green: 'stripes' };

let skin = SKINS.classic;
let palette = skin.colors( false );
let retroPatterns = {}; // rebuilt by refreshAppearance(): bg-colored pixel patterns for the retro fills

// Glow for the next shape or text. Call inside save()/restore().
function glow( color, blur = skin.glow ) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function buildRetroPatterns() {
  const make = ( paint ) => {
    const tile = document.createElement( 'canvas' );
    tile.width = 8;
    tile.height = 8;
    const t = tile.getContext( '2d' );
    t.fillStyle = palette.bg;
    paint( t );
    return ctx.createPattern( tile, 'repeat' );
  };
  return {
    checker: make( ( t ) => { t.fillRect( 0, 0, 4, 4 ); t.fillRect( 4, 4, 4, 4 ); } ),
    stripes: make( ( t ) => { t.fillRect( 0, 0, 8, 2 ); t.fillRect( 0, 4, 8, 2 ); } ),
  };
}

function roundedPath( x, y, w, h, r ) {
  ctx.beginPath();
  if ( ctx.roundRect ) ctx.roundRect( x, y, w, h, r );
  else ctx.rect( x, y, w, h );
}

// classic: the original sprites, plus a dark edge in the light theme.
function drawSpriteBrick( b ) {
  drawSprite( ctx, 'block_' + b.color, b.x, b.y, b.w, b.h );
  if ( !palette.outline ) return;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 2;
  ctx.strokeRect( b.x + 1, b.y + 1, b.w - 2, b.h - 2 );
}

function drawSpriteExplosion( e, index ) {
  drawFrame( ctx, EXPLOSION_FRAMES[ e.color ][ index ], e.x, e.y, e.w, e.h );
}

function drawSpritePaddle( p ) {
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
  if ( !palette.outline ) return;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 2;
  roundedPath( p.x + 1, p.y + 1, p.w - 2, p.h - 2, ( p.h - 2 ) / 2 );
  ctx.stroke();
}

function drawSpriteBall( x, y, size ) {
  drawSprite( ctx, 'ball', x, y, size, size );
  if ( !palette.outline ) return;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc( x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2 );
  ctx.stroke();
}

// retro: blocky fills, stepped corners, explosions in four discrete steps.
function drawRetroBrick( b ) {
  ctx.fillStyle = palette.bricks[ b.color ];
  ctx.fillRect( b.x + 2, b.y + 2, b.w - 4, b.h - 4 );
  const fill = retroPatterns[ RETRO_FILLS[ b.color ] ];
  if ( fill ) {
    ctx.fillStyle = fill;
    ctx.fillRect( b.x + 6, b.y + 6, b.w - 12, b.h - 12 );
  }
}

function drawRetroExplosion( e, index ) {
  const size = 8 - index * 2;
  const spreadX = e.w / 4 + index * 6;
  const spreadY = e.h / 4 + index * 3;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  ctx.fillStyle = palette.bricks[ e.color ];
  for ( const [ dx, dy ] of [ [ -1, -1 ], [ 1, -1 ], [ -1, 1 ], [ 1, 1 ] ] ) {
    ctx.fillRect( Math.round( cx + dx * spreadX - size / 2 ), Math.round( cy + dy * spreadY - size / 2 ), size, size );
  }
}

function drawRetroPaddle( p ) {
  ctx.fillStyle = palette.paddle;
  ctx.fillRect( p.x + 4, p.y, p.w - 8, p.h );
  ctx.fillRect( p.x, p.y + 4, p.w, p.h - 8 );
  ctx.fillStyle = palette.bg;
  ctx.fillRect( p.x + 12, p.y + 6, 4, 4 );
  ctx.fillRect( p.x + p.w - 16, p.y + 6, 4, 4 );
}

function drawRetroBall( x, y, size ) {
  const step = Math.max( 2, Math.round( size / 8 ) * 2 );
  ctx.fillStyle = palette.ball;
  ctx.fillRect( x + step, y, size - step * 2, size );
  ctx.fillRect( x, y + step, size, size - step * 2 );
}

// neon: outlined shapes with a glow on a dark field.
function drawNeonBrick( b ) {
  const color = palette.bricks[ b.color ];
  ctx.save();
  ctx.fillStyle = color + '26';
  ctx.fillRect( b.x + 4, b.y + 4, b.w - 8, b.h - 8 );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  glow( color, 8 );
  ctx.strokeRect( b.x + 4, b.y + 4, b.w - 8, b.h - 8 );
  ctx.restore();
}

function drawNeonExplosion( e, index ) {
  const color = palette.bricks[ e.color ];
  const grow = index * 4;
  ctx.save();
  ctx.globalAlpha = 1 - index / 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  glow( color );
  ctx.strokeRect( e.x + 4 - grow, e.y + 4 - grow / 2, e.w - 8 + grow * 2, e.h - 8 + grow );
  ctx.restore();
}

function drawNeonPaddle( p ) {
  ctx.save();
  roundedPath( p.x + 1, p.y + 1, p.w - 2, p.h - 2, ( p.h - 2 ) / 2 );
  ctx.fillStyle = palette.paddle + '33';
  ctx.fill();
  ctx.strokeStyle = palette.paddle;
  ctx.lineWidth = 2;
  glow( palette.paddle );
  ctx.stroke();
  ctx.restore();
}

function drawNeonBall( x, y, size ) {
  ctx.save();
  ctx.fillStyle = palette.ball;
  glow( palette.ballGlow );
  ctx.beginPath();
  ctx.arc( x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2 );
  ctx.fill();
  ctx.restore();
}

// Text color plus, under neon, a soft glow. Call inside save()/restore().
function textStyle( color ) {
  ctx.fillStyle = color;
  if ( palette.textGlow ) glow( palette.textGlow, 6 );
}

const SOUND_BOUNCE = 'assets/sounds/ball-bounce.mp3';
const SOUND_BREAK = 'assets/sounds/break-sound.mp3';

const sounds = {
  bounce: new Audio( SOUND_BOUNCE ),
  brk: new Audio( SOUND_BREAK ),
};
let muted = false; // session-only, outside `game` so resetGame() never unmutes

function playSound( sound ) {
  if ( muted ) return;
  sound.currentTime = 0;
  sound.play().catch( () => {} );
}

const muteIndicator = document.getElementById( 'mute-indicator' );

// Mirrors `muted` in the page indicator (index.html): the CSS picks the icon from data-muted.
function updateMuteIndicator() {
  muteIndicator.dataset.muted = String( muted );
  muteIndicator.setAttribute( 'aria-label', muted ? 'Sound muted' : 'Sound on' );
}

updateMuteIndicator();

function toggleMute() {
  muted = !muted;
  updateMuteIndicator();
  if ( !muted ) return;
  for ( const sound of Object.values( sounds ) ) {
    sound.pause();
    sound.currentTime = 0;
  }
}

// Builds the bricks of LEVELS[ level ] (levels.js), skipping '.' cells.
function buildBricks( level ) {
  const bricks = [];
  LEVELS[ level ].forEach( ( line, row ) => {
    for ( let col = 0; col < COLS; col++ ) {
      const letter = line[ col ];
      if ( letter === '.' ) continue;
      const color = LEVEL_COLORS[ letter ];
      if ( !color ) throw new Error( 'Unknown brick letter "' + letter + '" in level ' + ( level + 1 ) + ', row ' + ( row + 1 ) );
      bricks.push( {
        x: BRICK_MARGIN_X + col * BRICK_W,
        y: BRICK_TOP + row * BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        color,
        alive: true,
      } );
    }
  } );
  return bricks;
}

// ballSpeed in px/s, constant for the whole run.
const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   ballSpeed: 300, lives: 5 },
  { id: 'normal', label: 'Normal', ballSpeed: 400, lives: 3 },
  { id: 'hard',   label: 'Hard',   ballSpeed: 500, lives: 2 },
];

const game = {
  status: 'menu', // 'menu' | 'ready' | 'playing' | 'paused' | 'won' | 'lost'
  difficulty: 1, // index into DIFFICULTIES
  score: 0,
  lives: DIFFICULTIES[ 1 ].lives,
  level: 0, // index into LEVELS
  paddle: { x: ( CANVAS_W - PADDLE_W ) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, r: BALL_R, vx: 0, vy: 0 },
  bricks: buildBricks( 0 ),
  explosions: [], // { x, y, w, h, color, elapsed } elapsed in ms, 0 → EXPLOSION_DURATION
};

const keys = { left: false, right: false };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

// Starts a level: fresh bricks, no explosions, ball stuck to the paddle waiting for the launch.
function loadLevel( index ) {
  game.level = index;
  game.bricks = buildBricks( index );
  game.explosions = [];
  game.status = 'ready';
  game.ball.vx = 0;
  game.ball.vy = 0;
  stickBallToPaddle();
}

function resetGame() {
  game.score = 0;
  game.lives = DIFFICULTIES[ game.difficulty ].lives;
  loadLevel( 0 );
}

// The only way out of the menu: starts a fresh run with the highlighted difficulty.
function startRun() {
  resetGame();
}

// Space or click: launches the ball when ready, returns to the menu from an overlay
// (game.difficulty stays as the highlight). Does nothing in the menu.
function handleAction() {
  if ( game.status === 'ready' ) launchBall();
  else if ( game.status === 'won' || game.status === 'lost' ) game.status = 'menu';
}

function launchBall() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const b = game.ball;
  const speed = DIFFICULTIES[ game.difficulty ].ballSpeed;
  b.vx = side * speed * Math.sin( LAUNCH_ANGLE );
  b.vy = -speed * Math.cos( LAUNCH_ANGLE );
  game.status = 'playing';
}

const MENU_PICK_KEYS = { Digit1: 0, Digit2: 1, Digit3: 2 };
const MENU_MOVE_KEYS = {
  ArrowLeft: -1, ArrowUp: -1, KeyA: -1,
  ArrowRight: 1, ArrowDown: 1, KeyD: 1,
};

// Menu keys: 1/2/3 pick and start, arrows and A/D move the highlight (no wrapping), Enter/Space start.
function handleMenuKey( e ) {
  const pick = MENU_PICK_KEYS[ e.code ];
  const move = MENU_MOVE_KEYS[ e.code ];
  const confirm = e.code === 'Space' || e.code === 'Enter';
  if ( pick === undefined && move === undefined && !confirm ) return;
  e.preventDefault();
  if ( e.repeat ) return;
  if ( pick !== undefined ) {
    game.difficulty = pick;
    startRun();
  } else if ( move !== undefined ) {
    game.difficulty = Math.max( 0, Math.min( DIFFICULTIES.length - 1, game.difficulty + move ) );
  } else {
    startRun();
  }
}

const PAUSE_KEYS = [ 'KeyP', 'Escape' ];

// playing <-> paused. Any other status ignores the pause keys.
function togglePause() {
  if ( game.status === 'playing' ) {
    game.status = 'paused';
    keys.left = false;
    keys.right = false;
  } else if ( game.status === 'paused' ) {
    game.status = 'playing';
  }
}

window.addEventListener( 'keydown', ( e ) => {
  if ( e.code === 'KeyM' ) {
    if ( !e.repeat ) toggleMute();
    return;
  }
  if ( game.status === 'menu' ) {
    handleMenuKey( e );
    return;
  }
  // The game ignores these two outside the menu, but inside the host iframe they would scroll the page.
  if ( e.code === 'ArrowUp' || e.code === 'ArrowDown' ) e.preventDefault();
  if ( e.code === 'Space' ) {
    e.preventDefault();
    if ( !e.repeat ) handleAction();
    return;
  }
  if ( PAUSE_KEYS.includes( e.code ) ) {
    if ( !e.repeat ) togglePause();
    return;
  }
  const dir = KEY_MAP[ e.code ];
  if ( !dir ) return;
  e.preventDefault();
  if ( game.status === 'paused' ) return; // the paddle is frozen, so a press during pause is not recorded
  keys[ dir ] = true;
} );

window.addEventListener( 'keyup', ( e ) => {
  const dir = KEY_MAP[ e.code ];
  if ( !dir ) return;
  keys[ dir ] = false;
} );

// The mouse sets the paddle position directly on movement, the keys move it from
// wherever it is, so whichever input acted last decides the position.
canvas.addEventListener( 'mousemove', ( e ) => {
  if ( game.status === 'paused' || game.status === 'menu' ) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = ( e.clientX - rect.left ) * ( CANVAS_W / rect.width );
  const p = game.paddle;
  p.x = Math.max( 0, Math.min( CANVAS_W - p.w, mouseX - p.w / 2 ) );
} );

canvas.addEventListener( 'click', handleAction );

// Releasing focus must not leave a direction stuck, and pauses a running game.
// Coming back does not resume it: that needs P or Esc.
window.addEventListener( 'blur', () => {
  keys.left = false;
  keys.right = false;
  if ( game.status === 'playing' ) togglePause();
} );

let lastTime = 0;

function updatePaddle( dt ) {
  const p = game.paddle;
  const dir = ( keys.right ? 1 : 0 ) - ( keys.left ? 1 : 0 );
  p.x += dir * PADDLE_SPEED * dt;
  p.x = Math.max( 0, Math.min( CANVAS_W - p.w, p.x ) );
}

function stickBallToPaddle() {
  const p = game.paddle;
  const b = game.ball;
  b.x = p.x + p.w / 2;
  b.y = p.y - b.r;
}

// Advances the ball in sub-steps so a single step never exceeds MAX_STEP pixels.
function moveBall( dt ) {
  const b = game.ball;
  const steps = Math.max( 1, Math.ceil( Math.hypot( b.vx, b.vy ) * dt / MAX_STEP ) );
  for ( let i = 0; i < steps && game.status === 'playing'; i++ ) stepBall( dt / steps );
}

function loseLife() {
  if ( game.bricks.every( ( br ) => !br.alive ) ) return; // level cleared: the win is pending on the last explosion
  const b = game.ball;
  game.lives--;
  b.vx = 0;
  b.vy = 0;
  if ( game.lives <= 0 ) {
    game.status = 'lost';
  } else {
    game.status = 'ready';
    stickBallToPaddle();
  }
}

function stepBall( dt ) {
  const b = game.ball;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  if ( b.y - b.r > CANVAS_H ) {
    loseLife();
    return;
  }

  if ( b.x - b.r < 0 ) {
    b.x = b.r;
    b.vx = Math.abs( b.vx );
    playSound( sounds.bounce );
  } else if ( b.x + b.r > CANVAS_W ) {
    b.x = CANVAS_W - b.r;
    b.vx = -Math.abs( b.vx );
    playSound( sounds.bounce );
  }

  if ( b.y - b.r < 0 ) {
    b.y = b.r;
    b.vy = Math.abs( b.vy );
    playSound( sounds.bounce );
  }

  bounceOffPaddle();
  bounceOffBricks();
}

function bounceOffBricks() {
  const b = game.ball;
  for ( const brick of game.bricks ) {
    if ( !brick.alive ) continue;

    // Penetration depth of the ball into each side of the brick.
    const fromLeft = b.x + b.r - brick.x;
    const fromRight = brick.x + brick.w - ( b.x - b.r );
    const fromTop = b.y + b.r - brick.y;
    const fromBottom = brick.y + brick.h - ( b.y - b.r );
    if ( fromLeft <= 0 || fromRight <= 0 || fromTop <= 0 || fromBottom <= 0 ) continue;

    // Bounce on the axis of least penetration and push the ball out of the brick.
    const least = Math.min( fromLeft, fromRight, fromTop, fromBottom );
    if ( least === fromLeft ) {
      b.x = brick.x - b.r;
      b.vx = -Math.abs( b.vx );
    } else if ( least === fromRight ) {
      b.x = brick.x + brick.w + b.r;
      b.vx = Math.abs( b.vx );
    } else if ( least === fromTop ) {
      b.y = brick.y - b.r;
      b.vy = -Math.abs( b.vy );
    } else {
      b.y = brick.y + brick.h + b.r;
      b.vy = Math.abs( b.vy );
    }

    brick.alive = false;
    game.explosions.push( { x: brick.x, y: brick.y, w: brick.w, h: brick.h, color: brick.color, elapsed: 0 } );
    game.score += POINTS_PER_BRICK;
    playSound( sounds.brk );
    return; // one brick per sub-step
  }
}

function bounceOffPaddle() {
  const b = game.ball;
  const p = game.paddle;
  if ( b.vy <= 0 ) return;

  const overlaps =
    b.x + b.r >= p.x && b.x - b.r <= p.x + p.w &&
    b.y + b.r >= p.y && b.y - b.r <= p.y + p.h;
  if ( !overlaps ) return;

  // -1 at the left edge, 0 at the centre, 1 at the right edge.
  const hit = Math.max( -1, Math.min( 1, ( b.x - ( p.x + p.w / 2 ) ) / ( p.w / 2 ) ) );
  const angle = hit * MAX_BOUNCE_ANGLE;
  const speed = DIFFICULTIES[ game.difficulty ].ballSpeed;
  b.vx = speed * Math.sin( angle );
  b.vy = -speed * Math.cos( angle );
  b.y = p.y - b.r;
  playSound( sounds.bounce );
}

function updateExplosions( dt ) {
  for ( const explosion of game.explosions ) explosion.elapsed += dt * 1000;
  game.explosions = game.explosions.filter( ( explosion ) => explosion.elapsed < EXPLOSION_DURATION );
}

function update( dt ) {
  if ( game.status === 'paused' || game.status === 'menu' ) return;
  updatePaddle( dt );
  updateExplosions( dt );
  if ( game.status === 'ready' ) stickBallToPaddle();
  else if ( game.status === 'playing' ) moveBall( dt );
  if ( game.status === 'playing' && game.explosions.length === 0 && game.bricks.every( ( br ) => !br.alive ) ) {
    if ( game.level + 1 < LEVELS.length ) loadLevel( game.level + 1 );
    else game.status = 'won';
  }
}

function drawHud() {
  ctx.save();
  textStyle( palette.hud );
  ctx.font = 'bold 20px ' + skin.font;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText( 'Score: ' + game.score, BRICK_MARGIN_X, 30 );

  ctx.textAlign = 'center';
  ctx.fillText( 'Level ' + ( game.level + 1 ) + '/' + LEVELS.length, CANVAS_W / 2, 30 );
  ctx.textAlign = 'left';

  // Lives: one ball sprite per remaining life, right-aligned to the brick margin.
  const size = 16;
  const gap = 6;
  const right = CANVAS_W - BRICK_MARGIN_X;
  const spritesW = game.lives * size + Math.max( 0, game.lives - 1 ) * gap;
  const spritesX = right - spritesW;
  for ( let i = 0; i < game.lives; i++ ) {
    skin.ball( spritesX + i * ( size + gap ), 30 - size / 2, size );
  }
  ctx.textAlign = 'right';
  ctx.fillText( 'Lives:', spritesX - 10, 30 );
  ctx.restore();
}

// Dim layer shared by the pause, win and Game Over overlays.
function dimField() {
  ctx.fillStyle = palette.dimLayer;
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );
}

function drawPausedOverlay() {
  dimField();
  ctx.save();
  textStyle( palette.overlayText );
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px ' + skin.font;
  ctx.fillText( 'Paused', CANVAS_W / 2, CANVAS_H / 2 - 20 );
  ctx.font = '20px ' + skin.font;
  ctx.fillText( 'Press P or Esc to resume', CANVAS_W / 2, CANVAS_H / 2 + 30 );
  ctx.restore();
}

function drawOverlay() {
  dimField();

  ctx.save();
  textStyle( palette.overlayText );
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px ' + skin.font;
  ctx.fillText( game.status === 'won' ? 'You win!' : 'Game Over', CANVAS_W / 2, CANVAS_H / 2 - 50 );
  ctx.font = 'bold 28px ' + skin.font;
  ctx.fillText( 'Final score: ' + game.score, CANVAS_W / 2, CANVAS_H / 2 + 10 );
  ctx.font = '20px ' + skin.font;
  ctx.fillText( 'Press Space or click to restart', CANVAS_W / 2, CANVAS_H / 2 + 60 );
  ctx.restore();
}

// Start screen: title, one row per difficulty with its values, the highlighted one marked, key hint.
function drawMenu() {
  ctx.fillStyle = palette.bg;
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

  ctx.save();
  textStyle( palette.hud );
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 72px ' + skin.font;
  ctx.fillText( 'Arkanoid', CANVAS_W / 2, 150 );

  ctx.font = 'bold 28px ' + skin.font;
  DIFFICULTIES.forEach( ( d, i ) => {
    const selected = i === game.difficulty;
    ctx.fillStyle = selected ? palette.hud : palette.dim;
    const text = ( selected ? '> ' : '  ' ) + ( i + 1 ) + '. ' + d.label.padEnd( 8 ) +
      d.ballSpeed + ' px/s  ' + d.lives + ' lives';
    ctx.fillText( text, CANVAS_W / 2, 270 + i * 50 );
  } );

  ctx.fillStyle = palette.hint;
  ctx.font = '18px ' + skin.font;
  ctx.fillText( '1-3 pick and start   Arrows or A/D move   Enter or Space start', CANVAS_W / 2, 480 );
  ctx.restore();
}

// CRT scanlines, drawn over everything when the skin asks for them.
function drawScanlines() {
  if ( !skin.scanlines ) return;
  ctx.fillStyle = palette.scan;
  for ( let y = 0; y < CANVAS_H; y += 4 ) ctx.fillRect( 0, y, CANVAS_W, 2 );
}

function draw() {
  if ( game.status === 'menu' ) {
    drawMenu();
    drawScanlines();
    return;
  }
  ctx.fillStyle = palette.bg;
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );
  drawHud();
  const p = game.paddle;
  const b = game.ball;
  for ( const brick of game.bricks ) {
    if ( brick.alive ) skin.brick( brick );
  }
  for ( const e of game.explosions ) {
    const index = Math.min( 3, Math.floor( e.elapsed / ( EXPLOSION_DURATION / 4 ) ) );
    skin.explosion( e, index );
  }
  skin.paddle( p );
  skin.ball( b.x - b.r, b.y - b.r, b.r * 2 );
  if ( game.status === 'won' || game.status === 'lost' ) drawOverlay();
  else if ( game.status === 'paused' ) drawPausedOverlay();
  drawScanlines();
}

function frame( now ) {
  const dt = Math.min( ( now - lastTime ) / 1000, 0.05 );
  lastTime = now;
  update( dt );
  draw();
  requestAnimationFrame( frame );
}

// Scales the stage down so the whole canvas fits the iframe, and never up. CSS zoom changes the layout
// size, so the page stays centred and does not overflow. The canvas size and the game state are untouched.
function fitToFrame() {
  const scale = Math.min( 1, innerWidth / CANVAS_W, innerHeight / CANVAS_H );
  document.getElementById( 'stage' ).style.zoom = scale;
}

fitToFrame();
window.addEventListener( 'resize', fitToFrame );

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
  themeToggleIcon.textContent = isLight ? '☾' : '☀';
  themeToggleText.textContent = isLight ? 'Dark' : 'Light';
  refreshAppearance();
}

// The canvas cannot read CSS variables, so the palette is cached here.
function refreshAppearance() {
  palette = skin.colors( document.documentElement.dataset.theme === 'light' );
  retroPatterns = buildRetroPatterns();
  // The loop may be frozen (host pause or game paused), so repaint explicitly.
  draw();
}

skinSelect.addEventListener( 'change', () => {
  applySkin( skinSelect.value );
  skinSelect.blur(); // give the keys back to the game
} );

themeToggle.addEventListener( 'click', () => {
  applyTheme( document.documentElement.dataset.theme === 'light' ? 'dark' : 'light' );
  themeToggle.blur(); // keep Space from re-triggering the toggle
} );

skinSelect.innerHTML = Object.entries( SKINS ).map( ( [ id, k ] ) => `<option value="${ id }">${ k.name }</option>` ).join( '' );
applySkin( 'classic' );
applyTheme( 'dark' );

loadSpritesheet( () => {
  requestAnimationFrame( ( now ) => {
    lastTime = now;
    requestAnimationFrame( frame );
  } );
} );
