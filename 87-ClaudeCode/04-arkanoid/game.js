const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDLE_W = 120;
const PADDLE_H = 16;
const PADDLE_Y = CANVAS_H - 40;
const PADDLE_SPEED = 600; // px/s
const BALL_R = 8;
const BALL_SPEED = 400; // px/s, constant for the whole game
const LAUNCH_ANGLE = 15 * Math.PI / 180; // tilt from the vertical

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const game = {
  status: 'ready', // 'ready' | 'playing' | 'won' | 'lost'
  paddle: { x: ( CANVAS_W - PADDLE_W ) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
  ball: { x: 0, y: 0, r: BALL_R, vx: 0, vy: 0 },
};

const keys = { left: false, right: false };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

function launchBall() {
  if ( game.status !== 'ready' ) return;
  const side = Math.random() < 0.5 ? -1 : 1;
  const b = game.ball;
  b.vx = side * BALL_SPEED * Math.sin( LAUNCH_ANGLE );
  b.vy = -BALL_SPEED * Math.cos( LAUNCH_ANGLE );
  game.status = 'playing';
}

window.addEventListener( 'keydown', ( e ) => {
  if ( e.code === 'Space' ) {
    e.preventDefault();
    if ( !e.repeat ) launchBall();
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

canvas.addEventListener( 'click', launchBall );

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

function update( dt ) {
  updatePaddle( dt );
  if ( game.status === 'ready' ) stickBallToPaddle();
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  const p = game.paddle;
  const b = game.ball;
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
  drawSprite( ctx, 'ball', b.x - b.r, b.y - b.r, b.r * 2, b.r * 2 );
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
