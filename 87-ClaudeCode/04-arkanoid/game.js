const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDLE_W = 120;
const PADDLE_H = 16;
const PADDLE_Y = CANVAS_H - 40;
const PADDLE_SPEED = 600; // px/s

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const game = {
  paddle: { x: ( CANVAS_W - PADDLE_W ) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H },
};

const keys = { left: false, right: false };

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

window.addEventListener( 'keydown', ( e ) => {
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

function update( dt ) {
  updatePaddle( dt );
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  const p = game.paddle;
  drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
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
