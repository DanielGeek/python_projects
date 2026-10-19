import type { Game } from "./games";

const TAGS = ["1 PLAYER", "KEYBOARD / TOUCH", "RETRO 1985"];

// Games removed from the catalog by SPEC 08, kept here as data so they can come back. Nothing
// imports this file on purpose: these entries are not in GAMES, so they are not listed, not
// playable and not part of the Supabase `games` table. Drop came back with SPEC 09 and Brick Buster
// with SPEC 10, so they are no longer here.
//
// To bring a game back:
//   1. Move its entry from this array to GAMES in lib/games.ts.
//   2. Add a migration that inserts its row in `public.games` (same id, title, category and accent).
//   3. Playable games (src set) still need their folder in public/games/<id>/, a `readers` entry in
//      public/games/bridge.js and an `av-cover-<id>` rule in app/globals.css. The folder of rocks is
//      still on disk; the other five never had one.
export const ARCHIVED_GAMES: Game[] = [
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
