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

// Asteroids and Drop are in the catalog for now: SPEC 08 cut it down to Asteroids, the first game
// whose scores are saved to Supabase, and SPEC 09 brought Drop back. Both live in public/games with
// public/games/bridge.js added to report their state. The other seven games were removed from the
// catalog and from the `games` table; their entries live in lib/games-archive.ts and their
// folders in public/games stay on disk. A game that returns is moved from the archive to this
// array, with a migration that inserts its `games` row.
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
    difficulty: 4,
    plays: "31.8K",
    tags: ["1 PLAYER", "KEYBOARD", "RETRO 1985"],
  },
];

export const CATEGORIES = ["All", ...Array.from(new Set(GAMES.map((g) => g.category)))];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
