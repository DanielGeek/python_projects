// game.js
// State and rules. Depends on maze.js globals: MAZE, TUNNEL_ROW,
// PACMAN_START, GHOST_STARTS, GHOST_RELEASE_SECONDS, GHOST_CORNERS.

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };
// Arcade tie-break: with equal target distances prefer up, then left, down, right.
const DIR_PRIORITY = [ 'up', 'left', 'down', 'right' ];

const PACMAN_SPEED = 0.125; // 1/8 cell/frame -> aligns every 8 frames
const GHOST_SPEED = 0.1;    // 1/10 cell/frame
const TICK_SECONDS = 1 / 60; // gameplay seconds added by each update() tick
const SCATTER_SECONDS = 7;   // scatter phase length before each chase phase
const CHASE_SECONDS = 20;    // chase phase length before each scatter phase

// Creates a new game. Copies MAZE (pristine) into game.grid so dots can be
// eaten without destroying the original, and to allow restarts.
function createGame() {
  const grid = MAZE.map( ( row ) => row.slice() );
  // Pacman's starting cell begins without a dot.
  grid[ PACMAN_START.y ][ PACMAN_START.x ] = 0;

  // Dots and energizers both count toward clearing the board.
  let dots = 0;
  for ( const row of grid ) for ( const v of row ) if ( v === 2 || v === 4 ) dots++;

  return {
    state: 'start',
    score: 0,
    lives: 3,
    dotsRemaining: dots,
    grid,
    clock: 0,             // gameplay seconds; drives waves and release
    ghostMode: 'scatter', // 'scatter' | 'chase'
    modeSeconds: 0,       // time spent in the current mode
    pacman: {
      x: PACMAN_START.x,
      y: PACMAN_START.y,
      dir: 'left',
      nextDir: null,
      speed: PACMAN_SPEED,
    },
    ghosts: GHOST_STARTS.map( ( g ) => ( {
      x: g.x,
      y: g.y,
      dir: 'up',
      speed: GHOST_SPEED,
      kind: g.kind,
      released: false, // waits in the pen until its scheduled time
    } ) ),
  };
}

function aligned( v ) {
  return Math.abs( v - Math.round( v ) ) < 1e-3;
}

// Is a cell a wall? Walls (1) and the pen door (3) block every actor;
// ghosts leave the pen only through their scripted exit.
function isWall( grid, x, y ) {
  if ( y < 0 || y >= grid.length ) return true;
  if ( x < 0 || x >= grid[ 0 ].length ) return true;
  const v = grid[ y ][ x ];
  return v === 1 || v === 3;
}

// Can the actor advance from (x,y) in direction dir?
function canMove( grid, x, y, dir ) {
  const d = DIRS[ dir ];
  if ( !d ) return false;
  const tx = x + d.x;
  const ty = y + d.y;
  // Tunnel: exiting through an edge on the tunnel row is always valid.
  if ( ty === TUNNEL_ROW && ( tx < 0 || tx >= grid[ 0 ].length ) ) return true;
  return !isWall( grid, tx, ty );
}

function wrapTunnel( a, width ) {
  if ( Math.round( a.y ) === TUNNEL_ROW ) {
    if ( a.x < 0 ) a.x += width;
    else if ( a.x >= width ) a.x -= width;
  }
}

// The pen: door row 12 plus interior rows 13-15, columns 11-16.
const PEN = { left: 11, top: 12, right: 16, bottom: 15 };

function inPen( g ) {
  return (
    g.x >= PEN.left && g.x <= PEN.right &&
    g.y >= PEN.top && g.y <= PEN.bottom
  );
}

function movePacman( game ) {
  const p = game.pacman;
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( p.x ) && aligned( p.y ) ) {
    p.x = Math.round( p.x );
    p.y = Math.round( p.y );

    // Apply pending turn if possible.
    if ( p.nextDir && canMove( grid, p.x, p.y, p.nextDir ) ) {
      p.dir = p.nextDir;
      p.nextDir = null;
    }
    // Eat dot or energizer.
    const tile = grid[ p.y ][ p.x ];
    if ( tile === 2 || tile === 4 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += tile === 4 ? 50 : 10;
      game.dotsRemaining--;
    }
    // If it cannot keep going, stop at the cell.
    if ( !canMove( grid, p.x, p.y, p.dir ) ) return;
  }

  const d = DIRS[ p.dir ];
  p.x += d.x * p.speed;
  p.y += d.y * p.speed;
  wrapTunnel( p, width );
}

// Tile `cells` steps ahead of pac-man in his facing direction.
function aheadOfPacman( game, cells ) {
  const d = DIRS[ game.pacman.dir ];
  return {
    x: Math.round( game.pacman.x ) + d.x * cells,
    y: Math.round( game.pacman.y ) + d.y * cells,
  };
}

// Chase target of each ghost, per its classic personality.
function chaseTarget( game, g ) {
  const here = { x: Math.round( game.pacman.x ), y: Math.round( game.pacman.y ) };

  if ( g.kind === 'chaser' ) return here;
  if ( g.kind === 'ambusher' ) return aheadOfPacman( game, 4 );

  if ( g.kind === 'flanker' ) {
    // Mirror the chaser's tile through the tile 2 ahead of pac-man.
    const ahead = aheadOfPacman( game, 2 );
    const chaser = game.ghosts.find( ( gh ) => gh.kind === 'chaser' );
    return {
      x: 2 * ahead.x - Math.round( chaser.x ),
      y: 2 * ahead.y - Math.round( chaser.y ),
    };
  }

  // shy: chase pac-man while 8 or more tiles away (straight-line),
  // otherwise retreat to his corner.
  const dx = here.x - Math.round( g.x );
  const dy = here.y - Math.round( g.y );
  return Math.hypot( dx, dy ) >= 8 ? here : GHOST_CORNERS.shy;
}

// The tile a ghost steers toward in its current mode.
function ghostTarget( game, g ) {
  if ( game.ghostMode === 'scatter' ) return GHOST_CORNERS[ g.kind ];
  return chaseTarget( game, g );
}

// Greedy step: pick the direction whose next cell is closest (Manhattan) to
// the target tile, never reversing unless stuck in a dead end.
function decideGhost( game, g ) {
  const grid = game.grid;
  const target = ghostTarget( game, g );

  const options = DIR_PRIORITY.filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir )
  );
  // No way out (dead end): allow the 180-degree turn.
  const choices = options.length ? options : [ '' + OPPOSITE[ g.dir ] ];

  let best = choices[ 0 ];
  let bestDist = Infinity;
  for ( const dir of choices ) {
    const d = DIRS[ dir ];
    const nx = g.x + d.x;
    const ny = g.y + d.y;
    const dist = Math.abs( nx - target.x ) + Math.abs( ny - target.y );
    if ( dist < bestDist ) {
      bestDist = dist;
      best = dir;
    }
  }
  g.dir = best;
}

function moveGhost( game, g ) {
  const grid = game.grid;
  const width = grid[ 0 ].length;

  // Unreleased ghosts wait in place inside the pen.
  if ( !g.released ) return;

  // Scripted exit: a released ghost walks straight up through the door and
  // joins normal movement once outside the pen.
  if ( inPen( g ) ) {
    g.dir = 'up';
    g.y -= g.speed;
    return;
  }

  if ( aligned( g.x ) && aligned( g.y ) ) {
    g.x = Math.round( g.x );
    g.y = Math.round( g.y );
    decideGhost( game, g );
    if ( !canMove( grid, g.x, g.y, g.dir ) ) return;
  }

  const d = DIRS[ g.dir ];
  g.x += d.x * g.speed;
  g.y += d.y * g.speed;
  wrapTunnel( g, width );
}

// Return everything to the start of a round after pac-man loses a life:
// actors at their starts, ghosts unreleased in the pen, and the gameplay,
// wave and release clocks back to zero so the staggered release repeats.
function resetRound( game ) {
  const p = game.pacman;
  p.x = PACMAN_START.x;
  p.y = PACMAN_START.y;
  p.dir = 'left';
  p.nextDir = null;

  game.clock = 0;
  game.ghostMode = 'scatter';
  game.modeSeconds = 0;

  game.ghosts.forEach( ( g, i ) => {
    g.x = GHOST_STARTS[ i ].x;
    g.y = GHOST_STARTS[ i ].y;
    g.dir = 'up';
    g.released = false;
  } );
}

function collides( a, b ) {
  return Math.abs( a.x - b.x ) < 0.5 && Math.abs( a.y - b.y ) < 0.5;
}

// Open the pen for every ghost whose scheduled release time has arrived.
function releaseGhosts( game ) {
  for ( const g of game.ghosts ) {
    if ( !g.released && game.clock >= GHOST_RELEASE_SECONDS[ g.kind ] ) g.released = true;
  }
}

// Advance the scatter/chase wave clock. On every switch each released ghost
// reverses direction, producing the classic group U-turn.
function updateWaves( game ) {
  game.modeSeconds += TICK_SECONDS;
  const duration = game.ghostMode === 'scatter' ? SCATTER_SECONDS : CHASE_SECONDS;
  if ( game.modeSeconds < duration ) return;

  game.ghostMode = game.ghostMode === 'scatter' ? 'chase' : 'scatter';
  game.modeSeconds = 0;
  for ( const g of game.ghosts ) {
    if ( g.released ) g.dir = OPPOSITE[ g.dir ];
  }
}

function update( game ) {
  game.clock += TICK_SECONDS;
  releaseGhosts( game );
  updateWaves( game );

  movePacman( game );
  game.ghosts.forEach( ( g ) => moveGhost( game, g ) );

  for ( const g of game.ghosts ) {
    if ( collides( game.pacman, g ) ) {
      game.lives--;
      if ( game.lives <= 0 ) {
        game.state = 'lost';
        return;
      }
      resetRound( game );
      break;
    }
  }

  if ( game.dotsRemaining <= 0 ) game.state = 'won';
}

window.createGame = createGame;
window.update = update;
window.DIRS = DIRS;
