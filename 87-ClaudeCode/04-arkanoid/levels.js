// Level data only, loaded before game.js. '.' is an empty cell, every other character is a key of LEVEL_COLORS.
// Every row has exactly COLS (10) characters.
const LEVELS = [
  [ // level 1: full grid, 60 bricks
    'rrrrrrrrrr',
    'yyyyyyyyyy',
    'cccccccccc',
    'mmmmmmmmmm',
    'hhhhhhhhhh',
    'gggggggggg',
  ],
  [ // level 2: diamond, 38 bricks
    '....rr....',
    '...yyyy...',
    '..cccccc..',
    '.mmmmmmmm.',
    'hhhhhhhhhh',
    '.gggggggg.',
  ],
  [ // level 3: frame with gaps, 40 bricks
    'rrrrrrrrrr',
    'y........y',
    'c.mmmmmm.c',
    'c.hhhhhh.c',
    'y........y',
    'gggggggggg',
  ],
];

const LEVEL_COLORS = { r: 'red', y: 'yellow', c: 'cyan', m: 'magenta', h: 'hotpink', g: 'green' };
