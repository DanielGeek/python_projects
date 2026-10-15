const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDLE_W = 120;
const PADDLE_H = 16;
const PADDLE_Y = CANVAS_H - 40;
const PADDLE_SPEED = 600; // px/s
const BALL_R = 8;
const BALL_SPEED = 400; // px/s, constant for the whole game
const LAUNCH_ANGLE = 15 * Math.PI / 180; // tilt from the vertical
const MAX_BOUNCE_ANGLE = 60 * Math.PI / 180; // paddle edge exit angle from the vertical
const COLS = 10;
const ROWS = 6;
const BRICK_W = 72;
const BRICK_H = 24;
const BRICK_MARGIN_X = ( CANVAS_W - COLS * BRICK_W ) / 2;
const BRICK_TOP = 60;
const LIVES = 3;
const POINTS_PER_BRICK = 10;
const ROW_COLORS = [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ]; // top to bottom
const MAX_STEP = BALL_R / 2; // max ball displacement per sub-step, well below the radius

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

function buildBricks() {
  const bricks = [];
  for ( let row = 0; row < ROWS; row++ ) {
    for ( let col = 0; col < COLS; col++ ) {
      bricks.push( {
        x: BRICK_MARGIN_X + col * BRICK_W,
        y: BRICK_TOP + row * BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        color: ROW_COLORS[ row ],
        alive: true,
      } );
    }
  }
  return bricks;
}

const game = {
  status: 'ready', // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: LIVES,
  paddle: { x: ( CANVAS_W - PADDLE_W ) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, r: BALL_R, vx: 0, vy: 0 },
  bricks: buildBricks(),
  explosions: [], // { x, y, w, h, color, elapsed } elapsed in ms, 0 → EXPLOSION_DURATION
};

const keys = { left: false, right: false };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

function resetGame() {
  game.score = 0;
  game.lives = LIVES;
  game.bricks = buildBricks();
  game.explosions = [];
  game.status = 'ready';
  game.ball.vx = 0;
  game.ball.vy = 0;
  stickBallToPaddle();
}

// Space or click: launches the ball when ready, restarts from an overlay.
function handleAction() {
  if ( game.status === 'ready' ) launchBall();
  else if ( game.status === 'won' || game.status === 'lost' ) resetGame();
}

function launchBall() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const b = game.ball;
  b.vx = side * BALL_SPEED * Math.sin( LAUNCH_ANGLE );
  b.vy = -BALL_SPEED * Math.cos( LAUNCH_ANGLE );
  game.status = 'playing';
}

window.addEventListener( 'keydown', ( e ) => {
  if ( e.code === 'Space' ) {
    e.preventDefault();
    if ( !e.repeat ) handleAction();
    return;
  }
  const dir = KEY_MAP[ e.code ];
  if ( !dir ) return;
  keys[ dir ] = true;
  e.preventDefault();
} );

window.addEventListener( 'keyup', ( e ) => {
  const dir = KEY_MAP[ e.code ];
  if ( !dir ) return;
  keys[ dir ] = false;
} );

// The mouse sets the paddle position directly on movement, the keys move it from
// wherever it is, so whichever input acted last decides the position.
canvas.addEventListener( 'mousemove', ( e ) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = ( e.clientX - rect.left ) * ( CANVAS_W / rect.width );
  const p = game.paddle;
  p.x = Math.max( 0, Math.min( CANVAS_W - p.w, mouseX - p.w / 2 ) );
} );

canvas.addEventListener( 'click', handleAction );

// Releasing focus must not leave a direction stuck.
window.addEventListener( 'blur', () => {
  keys.left = false;
  keys.right = false;
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
  } else if ( b.x + b.r > CANVAS_W ) {
    b.x = CANVAS_W - b.r;
    b.vx = -Math.abs( b.vx );
  }

  if ( b.y - b.r < 0 ) {
    b.y = b.r;
    b.vy = Math.abs( b.vy );
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
    if ( game.bricks.every( ( br ) => !br.alive ) ) game.status = 'won';
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
  b.vx = BALL_SPEED * Math.sin( angle );
  b.vy = -BALL_SPEED * Math.cos( angle );
  b.y = p.y - b.r;
}

function updateExplosions( dt ) {
  for ( const explosion of game.explosions ) explosion.elapsed += dt * 1000;
  game.explosions = game.explosions.filter( ( explosion ) => explosion.elapsed < EXPLOSION_DURATION );
}

function update( dt ) {
  updatePaddle( dt );
  updateExplosions( dt );
  if ( game.status === 'ready' ) stickBallToPaddle();
  else if ( game.status === 'playing' ) moveBall( dt );
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText( 'Score: ' + game.score, BRICK_MARGIN_X, 30 );

  // Lives: one ball sprite per remaining life, right-aligned to the brick margin.
  const size = 16;
  const gap = 6;
  const right = CANVAS_W - BRICK_MARGIN_X;
  const spritesW = game.lives * size + Math.max( 0, game.lives - 1 ) * gap;
  const spritesX = right - spritesW;
  for ( let i = 0; i < game.lives; i++ ) {
    drawSprite( ctx, 'ball', spritesX + i * ( size + gap ), 30 - size / 2, size, size );
  }
  ctx.textAlign = 'right';
  ctx.fillText( 'Lives:', spritesX - 10, 30 );
}

function drawOverlay() {
  ctx.fillStyle = 'rgba( 0, 0, 0, 0.7 )';
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px monospace';
  ctx.fillText( game.status === 'won' ? 'You win!' : 'Game Over', CANVAS_W / 2, CANVAS_H / 2 - 50 );
  ctx.font = 'bold 28px monospace';
  ctx.fillText( 'Final score: ' + game.score, CANVAS_W / 2, CANVAS_H / 2 + 10 );
  ctx.font = '20px monospace';
  ctx.fillText( 'Press Space or click to restart', CANVAS_W / 2, CANVAS_H / 2 + 60 );
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  drawHud();
  const p = game.paddle;
  const b = game.ball;
  for ( const brick of game.bricks ) {
    if ( brick.alive ) drawSprite( ctx, 'block_' + brick.color, brick.x, brick.y, brick.w, brick.h );
  }
  for ( const e of game.explosions ) {
    const index = Math.min( 3, Math.floor( e.elapsed / ( EXPLOSION_DURATION / 4 ) ) );
    drawFrame( ctx, EXPLOSION_FRAMES[ e.color ][ index ], e.x, e.y, e.w, e.h );
  }
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
  drawSprite( ctx, 'ball', b.x - b.r, b.y - b.r, b.r * 2, b.r * 2 );
  if ( game.status === 'won' || game.status === 'lost' ) drawOverlay();
}

function frame( now ) {
  const dt = Math.min( ( now - lastTime ) / 1000, 0.05 );
  lastTime = now;
  update( dt );
  draw();
  requestAnimationFrame( frame );
}

loadSpritesheet( () => {
  requestAnimationFrame( ( now ) => {
    lastTime = now;
    requestAnimationFrame( frame );
  } );
} );
