export type Accent = "cyan" | "magenta" | "yellow" | "green";

export type Category = "Arcade" | "Puzzle" | "Shooter" | "Versus";

export interface Game {
  id: string;
  title: string;
  category: Category;
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
  /** 1 to 5, shown as filled stars in the detail stat strip. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Display string such as "12.4K". BACKEND: replace with a real play counter. */
  plays: string;
  /** Extra tags shown after the category on the detail screen. */
  tags: string[];
}

const TAGS = ["1 PLAYER", "KEYBOARD / TOUCH", "RETRO 1985"];

// The four playable games are copies of the sibling projects (02-asteroids → rocks and
// asteroids, 03-claude-tetris → drop, 04-arkanoid → brick-buster) living in public/games,
// each with public/games/bridge.js added to report its state.
export const GAMES: Game[] = [
  {
    id: "brick-buster",
    title: "Brick Buster",
    category: "Arcade",
    tagline: "Bounce the ball and smash neon walls.",
    description:
      "Steer a paddle-ship and bounce a plasma core to pulverize walls of chromatic blocks. Every level rearranges the grid into impossible patterns. How far will your streak go?",
    accent: "cyan",
    src: "/games/brick-buster/index.html",
    aspect: "4 / 3",
    controls: "← → or A/D to move · SPACE to launch · 1-3 to pick difficulty",
    difficulty: 3,
    plays: "12.4K",
    tags: TAGS,
  },
  {
    id: "drop",
    title: "Drop",
    category: "Puzzle",
    tagline: "Fit the pieces before the ceiling crushes you.",
    description:
      "Geometric pieces descend from the dark. Rotate them, lock them in and clear lines to survive. The speed ramps up mercilessly every 10 lines.",
    accent: "magenta",
    src: "/games/drop/index.html",
    aspect: "4 / 3",
    controls: "← → to move · ↑ or X to rotate · ↓ to soft drop · SPACE to hard drop · C to hold",
    difficulty: 4,
    plays: "31.8K",
    tags: TAGS,
  },
  {
    id: "serpent",
    title: "Serpent",
    category: "Arcade",
    tagline: "Grow without biting your own tail.",
    description:
      "A snake of light crawls the grid hunting magenta cores. Every bite makes it longer and faster. One wrong move and it devours itself.",
    accent: "green",
    src: null,
    aspect: "1 / 1",
    controls: "Arrow keys to move",
    difficulty: 2,
    plays: "9.1K",
    tags: TAGS,
  },
  {
    id: "muncher",
    title: "Muncher",
    category: "Arcade",
    tagline: "Gobble dots and escape the ghosts.",
    description:
      "A hungry circle patrols a maze collecting glowing dots. Four specters chase it, but every so often a pill appears and turns the tables.",
    accent: "yellow",
    src: null,
    aspect: "1 / 1",
    controls: "Arrow keys to move",
    difficulty: 3,
    plays: "27.2K",
    tags: TAGS,
  },
  {
    id: "invaders",
    title: "Invaders",
    category: "Shooter",
    tagline: "Defend the planet from rows of aliens.",
    description:
      "Waves of hostile pixels descend formation after formation. Slide your cannon sideways and fire with precision before they touch the surface.",
    accent: "green",
    src: null,
    aspect: "4 / 3",
    controls: "← → to move · SPACE to fire",
    difficulty: 3,
    plays: "18.0K",
    tags: TAGS,
  },
  {
    id: "rocks",
    title: "Rocks",
    category: "Shooter",
    tagline: "Pulverize asteroids in zero gravity.",
    description:
      "Your triangular ship floats in the absolute void. Fire and rotate to split rocks into ever smaller fragments. Watch out for UFOs on the horizon.",
    accent: "yellow",
    src: "/games/rocks/index.html",
    aspect: "4 / 3",
    controls: "← → to rotate · ↑ to thrust · SPACE to fire",
    difficulty: 4,
    plays: "15.6K",
    tags: TAGS,
  },
  {
    id: "asteroids",
    title: "Asteroids",
    category: "Shooter",
    tagline: "Split the rocks before they split you.",
    description:
      "A lone ship drifts through a wrapping asteroid field. Shoot large rocks into medium ones and medium ones into small ones, and grab the 3x power-up for a spread shot. Three lives, and every wave brings more rocks.",
    accent: "cyan",
    src: "/games/asteroids/index.html",
    aspect: "4 / 3",
    controls: "← → to rotate · ↑ to thrust · SPACE to fire",
    difficulty: 4,
    plays: "11.3K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
  },
  {
    id: "froggy",
    title: "Froggy",
    category: "Arcade",
    tagline: "Cross the pixel highway.",
    description:
      "Hop between lanes of speeding cars and drifting logs on the river. Reach the lily pads before time runs out.",
    accent: "green",
    src: null,
    aspect: "4 / 3",
    controls: "Arrow keys to hop",
    difficulty: 2,
    plays: "6.4K",
    tags: TAGS,
  },
  {
    id: "pixel-duel",
    title: "Pixel Duel",
    category: "Versus",
    tagline: "Two paddles. One ball. Maximum reflexes.",
    description:
      "The purest duel: two vertical paddles fight to bounce a glowing ball. Solo mode against the CPU or local two-player.",
    accent: "cyan",
    src: null,
    aspect: "4 / 3",
    controls: "W/S for player 1 · ↑/↓ for player 2",
    difficulty: 1,
    plays: "4.2K",
    tags: ["1-2 PLAYERS", "KEYBOARD", "RETRO 1985"],
  },
];

export const CATEGORIES = ["All", ...Array.from(new Set(GAMES.map((g) => g.category)))];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
