const CANVAS_W = 800;
const CANVAS_H = 600;

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

let lastTime = 0;

function update( dt ) {
  // Game logic is added in the following steps.
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
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
