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
    category: "Rompeladrillos",
    tagline: "Rompe todos los ladrillos con tu nave y la bola de energía.",
    description:
      "Controla la nave Vaus y devuelve la bola de energía para destruir cada muro de ladrillos. Cada nivel cambia la formación y la bola acelera. No la dejes caer: tus vidas son limitadas.",
    accent: "cyan",
    src: "/games/arkanoid/index.html",
    aspect: "4 / 3",
    controls: "← → o A/D para mover · ESPACIO para lanzar · 1-3 elige dificultad",
  },
  {
    id: "tetris",
    title: "Tetris",
    category: "Puzle",
    tagline: "Encaja las piezas que caen y limpia líneas sin parar.",
    description:
      "Gira y coloca las piezas que caen para completar líneas horizontales. Cuantas más líneas limpies a la vez, más puntos ganas. La velocidad sube con cada nivel.",
    accent: "magenta",
    src: "/games/tetris/index.html",
    aspect: "4 / 3",
    controls: "← → para mover · ↑ o X para girar · ↓ para bajar · ESPACIO para soltar · C para guardar",
  },
  {
    id: "asteroids",
    title: "Asteroids",
    category: "Disparos",
    tagline: "Pulveriza asteroides en el vacío del espacio.",
    description:
      "Pilota tu nave en el espacio profundo y dispara a los asteroides antes de que te golpeen. Los grandes se parten en pedazos más pequeños y rápidos. Sobrevive a cada oleada para subir de nivel.",
    accent: "yellow",
    src: "/games/asteroids/index.html",
    aspect: "4 / 3",
    controls: "← → para girar · ↑ para acelerar · ESPACIO para disparar",
  },
  {
    id: "snake",
    title: "Snake",
    category: "Clásicos",
    tagline: "Come, crece y no te muerdas la cola.",
    description:
      "Guía a la serpiente por el tablero y come todo lo que aparezca. Cada bocado te hace más larga y más difícil de controlar. Un choque y se acabó.",
    accent: "cyan",
    src: null,
    aspect: "1 / 1",
    controls: "Flechas para moverte",
  },
  {
    id: "pac-man",
    title: "Pac-Man",
    category: "Clásicos",
    tagline: "Devora puntos y huye de los fantasmas.",
    description:
      "Recorre el laberinto comiendo todos los puntos mientras cuatro fantasmas te persiguen. Las píldoras de poder te permiten darles la vuelta por unos segundos. Limpia el laberinto para pasar de nivel.",
    accent: "yellow",
    src: null,
    aspect: "1 / 1",
    controls: "Flechas para moverte",
  },
  {
    id: "space-invaders",
    title: "Space Invaders",
    category: "Disparos",
    tagline: "Detén la invasión alienígena antes de que aterrice.",
    description:
      "Filas de invasores descienden hacia tu planeta. Muévete tras los escudos y dispara antes de que lleguen al suelo. Cada oleada es más rápida que la anterior.",
    accent: "magenta",
    src: null,
    aspect: "4 / 3",
    controls: "← → para mover · ESPACIO para disparar",
  },
];

export const CATEGORIES = ["Todos", ...Array.from(new Set(GAMES.map((g) => g.category)))];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
