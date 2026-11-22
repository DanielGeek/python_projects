# Asteroids

A clone of the classic arcade game **Asteroids** implemented in pure HTML5 canvas, without dependencies or bundlers.

## Description

Spaceship in an asteroid field with edge wrapping (space is toroidal). Destroy asteroids to score points: large ones split into medium ones, medium ones into small ones. Includes special power-ups and unique asteroid types like the shooting star.

## Technologies

- **HTML5 Canvas** — 2D rendering
- **JavaScript (ES6+)** — game logic in a single `game.js` file
- No frameworks, no bundlers, no dependencies

## How to Run

Open `index.html` directly in your browser (double-click), or use a local server:

```bash
`npx serve .```

Then visit `http://localhost:3000`.

## Controls

| Key | Action |

| --------- | ---------- |

`←` `→` | Rotate ship |

`↑` | Propel |

`Space` | Fire |

## Score

| Asteroid | Points |

| --------- | ------ |

| Large | 20 |

| Medium | 50 |

| Small | 100 |

## Features

- 3 lives with temporary invincibility upon respawning (blinking)
- Asteroids break into smaller fragments upon destruction
- Explosion particles when asteroids are destroyed
- **Velocity power-up**: doubles ship thrust for 5 seconds. Spawns periodically on the field and can drop from destroyed asteroids; collect the cyan hexagon to activate it
