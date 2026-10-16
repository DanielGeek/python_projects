export type Accent = "cyan" | "magenta" | "yellow";

export interface Game {
  id: string;
  title: string;
  category: string;
  /** One line for the library card. */
  tagline: string;
  /** Two or three sentences for the detail screen. */
  description: string;
  accent: Accent;
  /** Path of the playable HTML game, or null while it is not in the vault yet. */
  src: string | null;
  /** Canvas aspect ratio of the game, used by the CRT screen. */
  aspect: string;
  controls: string;
}

// The three playable games are copies of the sibling projects (02-asteroids, 03-claude-tetris,
// 04-arkanoid) living in public/games, each with public/games/bridge.js added to report its state.
export const GAMES: Game[] = [
  {
    id: "arkanoid",
    title: "Arkanoid",
    category: "Breakout",
    tagline: "Smash every brick with your paddle and energy ball.",
    description:
      "Steer the Vaus paddle and bounce the energy ball to destroy every wall of bricks. Each level changes the layout and the ball speeds up. Don't let it drop: your lives are limited.",
    accent: "cyan",
    src: "/games/arkanoid/index.html",
    aspect: "4 / 3",
    controls: "← → or A/D to move · SPACE to launch · 1-3 to pick difficulty",
  },
  {
    id: "tetris",
    title: "Tetris",
    category: "Puzzle",
    tagline: "Fit the falling pieces and clear lines nonstop.",
    description:
      "Rotate and drop the falling pieces to complete horizontal lines. The more lines you clear at once, the more points you score. The speed rises with every level.",
    accent: "magenta",
    src: "/games/tetris/index.html",
    aspect: "4 / 3",
    controls: "← → to move · ↑ or X to rotate · ↓ to soft drop · SPACE to hard drop · C to hold",
  },
  {
    id: "asteroids",
    title: "Asteroids",
    category: "Shooter",
    tagline: "Blast asteroids in the void of space.",
    description:
      "Pilot your ship through deep space and shoot the asteroids before they hit you. Big ones split into smaller, faster pieces. Survive each wave to level up.",
    accent: "yellow",
    src: "/games/asteroids/index.html",
    aspect: "4 / 3",
    controls: "← → to rotate · ↑ to thrust · SPACE to fire",
  },
  {
    id: "snake",
    title: "Snake",
    category: "Classics",
    tagline: "Eat, grow and don't bite your own tail.",
    description:
      "Guide the snake around the board and eat everything that appears. Every bite makes it longer and harder to control. One crash and it's over.",
    accent: "cyan",
    src: null,
    aspect: "1 / 1",
    controls: "Arrow keys to move",
  },
  {
    id: "pac-man",
    title: "Pac-Man",
    category: "Classics",
    tagline: "Gobble dots and run from the ghosts.",
    description:
      "Roam the maze eating every dot while four ghosts chase you. Power pellets let you turn the tables for a few seconds. Clear the maze to reach the next level.",
    accent: "yellow",
    src: null,
    aspect: "1 / 1",
    controls: "Arrow keys to move",
  },
  {
    id: "space-invaders",
    title: "Space Invaders",
    category: "Shooter",
    tagline: "Stop the alien invasion before it lands.",
    description:
      "Rows of invaders descend on your planet. Move behind the shields and fire before they reach the ground. Each wave is faster than the last.",
    accent: "magenta",
    src: null,
    aspect: "4 / 3",
    controls: "← → to move · SPACE to fire",
  },
];

export const CATEGORIES = ["All", ...Array.from(new Set(GAMES.map((g) => g.category)))];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
