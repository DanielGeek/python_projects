# Asteroids

Clone of the classic arcade game **Asteroids** implemented in pure HTML5 canvas, with no dependencies or bundler.

## Demo:

[Asteroids demo](https://github.com/DanielGeek/python_projects/tree/main/87-ClaudeCode/02-asteroids)

## Game Description

A spaceship in an asteroid field with edge wrapping (space is toroidal). Destroy asteroids to earn points: large ones split into medium ones, and medium ones into small ones. Includes special power-ups and unique asteroid types such as the shooting star...

## Technologies

- **HTML5 Canvas** — 2D rendering
- **JavaScript (ES6+)** — game logic in a single `game.js` file
- No frameworks, no bundler, no dependencies

## How to Run

Open `index.html` directly in the browser (double-click), or use a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

## Controls

| Key       | Action      |
| --------- | ----------- |
| `←` `→`   | Rotate ship |
| `↑`       | Thrust      |
| `Space`   | Shoot       |

## Scoring

| Asteroid | Points |
| -------- | ------ |
| Large    | 20     |
| Medium   | 50     |
| Small    | 100    |

## Features

- 3 lives with temporary invincibility on respawn (blinking)
- Asteroids split into smaller fragments when destroyed
- Explosion particles when destroying asteroids
