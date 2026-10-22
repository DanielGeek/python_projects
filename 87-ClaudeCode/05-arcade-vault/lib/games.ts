export type Accent = "cyan" | "magenta" | "yellow" | "green";

export type Category = "Arcade" | "Puzzle" | "Shooter" | "Versus";

export interface TouchButton {
  /** KeyboardEvent.code that the bridge dispatches, e.g. "ArrowLeft", "Space", "KeyP". */
  code: string;
  /** Visible text for `extra` buttons, e.g. "HOLD", "1". A and B show their letter. */
  label: string;
  /** Accessible name, e.g. "Rotate left". */
  name: string;
  /** Re-sends keydown while held (after 250 ms, every 90 ms). For games that move once per keydown. */
  repeat?: boolean;
}

export interface TouchControls {
  /** D-pad directions the game uses. Codes are ArrowUp, ArrowDown, ArrowLeft, ArrowRight. The others are drawn disabled. */
  move: TouchButton[];
  /** Big button on the right, in the game's accent. The main action. */
  a: TouchButton;
  /** Big cyan button on the left of A. The second action. */
  b: TouchButton;
  /** Small pills for the rest, at most three. Optional. */
  extra?: TouchButton[];
}

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
  /** On-screen buttons for touch devices, sent to the game as key events through the bridge. */
  touch?: TouchControls;
  /** 1 to 5, shown as filled stars in the detail stat strip. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Display string such as "12.4K". BACKEND: replace with a real play counter. */
  plays: string;
  /** Extra tags shown after the category on the detail screen. */
  tags: string[];
}

// Asteroids, Drop, Brick Buster, Snake and Froggy are in the catalog for now: SPEC 08 cut it down to
// Asteroids, the first game whose scores are saved to Supabase, SPEC 09 brought Drop back, SPEC 10
// brought Brick Buster back, SPEC 11 added Snake as a new game (not from the archive) and SPEC GJ
// froggy-01 brought Froggy back, written from scratch. They live in public/games with
// public/games/bridge.js added to report their state.
// The other five games were removed from the catalog and from the `games` table; their entries live
// in lib/games-archive.ts and their folders in public/games stay on disk. A game that returns is
// moved from the archive to this array, with a migration that inserts its `games` row.
export const GAMES: Game[] = [
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
    touch: {
      move: [
        { code: "ArrowLeft", label: "◀", name: "Rotate left" },
        { code: "ArrowRight", label: "▶", name: "Rotate right" },
      ],
      a: { code: "Space", label: "A", name: "Fire, start or restart" },
      b: { code: "ArrowUp", label: "B", name: "Thrust" },
    },
    difficulty: 4,
    plays: "11.3K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
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
    touch: {
      move: [
        { code: "ArrowLeft", label: "◀", name: "Move left", repeat: true },
        { code: "ArrowRight", label: "▶", name: "Move right", repeat: true },
        { code: "ArrowDown", label: "▼", name: "Soft drop", repeat: true },
      ],
      a: { code: "Space", label: "A", name: "Hard drop" },
      b: { code: "ArrowUp", label: "B", name: "Rotate" },
      extra: [
        { code: "KeyC", label: "HOLD", name: "Hold piece" },
        { code: "KeyE", label: "SKILL", name: "Skills" },
      ],
    },
    difficulty: 4,
    plays: "31.8K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
  },
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
    touch: {
      move: [
        { code: "ArrowLeft", label: "◀", name: "Move left" },
        { code: "ArrowRight", label: "▶", name: "Move right" },
      ],
      a: { code: "Space", label: "A", name: "Launch or confirm" },
      b: { code: "KeyP", label: "B", name: "Pause" },
      extra: [
        { code: "Digit1", label: "1", name: "Easy difficulty" },
        { code: "Digit2", label: "2", name: "Normal difficulty" },
        { code: "Digit3", label: "3", name: "Hard difficulty" },
      ],
    },
    difficulty: 3,
    plays: "12.4K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
  },
  {
    id: "snake",
    title: "Snake",
    category: "Arcade",
    tagline: "Eat the fruit, grow longer, never bite yourself.",
    description:
      "Guide a pixel snake around a walled 20×20 grid and eat the fruit that pops up. Every five fruits the level rises, the snake speeds up and each bite is worth more. Hit a wall or your own tail and the run is over.",
    accent: "green",
    src: "/games/snake/index.html",
    aspect: "1 / 1",
    controls: "Arrows or WASD to steer · P to pause · SPACE to start",
    touch: {
      move: [
        { code: "ArrowUp", label: "▲", name: "Up" },
        { code: "ArrowLeft", label: "◀", name: "Left" },
        { code: "ArrowRight", label: "▶", name: "Right" },
        { code: "ArrowDown", label: "▼", name: "Down" },
      ],
      a: { code: "Space", label: "A", name: "Start or restart" },
      b: { code: "KeyP", label: "B", name: "Pause" },
    },
    difficulty: 2,
    plays: "9.1K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1976"],
  },
  {
    id: "froggy",
    title: "Froggy",
    category: "Arcade",
    tagline: "Dodge the traffic, ride the logs, fill every pad.",
    description:
      "Hop a five-lane highway and ride drifting logs across the river to fill all five pads before the clock runs out. Every forward hop, every pad and every second left on the timer scores. Three lives, and each cleared set of pads speeds everything up.",
    accent: "yellow",
    src: "/games/froggy/index.html",
    aspect: "4 / 3",
    controls: "Arrows or swipe to hop · SPACE to start",
    touch: {
      move: [
        { code: "ArrowUp", label: "▲", name: "Up" },
        { code: "ArrowLeft", label: "◀", name: "Left" },
        { code: "ArrowRight", label: "▶", name: "Right" },
        { code: "ArrowDown", label: "▼", name: "Down" },
      ],
      a: { code: "Space", label: "A", name: "Start or restart" },
      b: { code: "Enter", label: "B", name: "Start or restart" },
    },
    difficulty: 3,
    plays: "6.4K",
    tags: ["1 PLAYER", "KEYBOARD / TOUCH", "RETRO 1985"],
  },
];

export const CATEGORIES = ["All", ...Array.from(new Set(GAMES.map((g) => g.category)))];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
