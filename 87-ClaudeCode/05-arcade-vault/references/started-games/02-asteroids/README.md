# Asteroids

Clone of the classic arcade game **Asteroids** built with plain HTML5 canvas, with no dependencies and no bundler.

## Demo:

[Asteroids demo](https://klerith.github.io/claude-asteroids/)

## Description

A spaceship in an asteroid field with wrapping edges (space is toroidal). Destroy asteroids to score points: large ones split into medium ones, and medium ones into small ones.

## Technologies

- **HTML5 Canvas** — 2D rendering
- **JavaScript (ES6+)** — game logic in a single `game.js` file
- No frameworks, no bundler, no dependencies

## How to run

Open `index.html` directly in the browser (double click), or use a local server:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

## Controls

| Key     | Action      |
| ------- | ----------- |
| `←` `→` | Rotate ship |
| `↑`     | Thrust      |
| `Space` | Shoot       |

## Scoring

| Object | Points |
| ------ | ------ |
| Large  | 20     |
| Medium | 50     |
| Small  | 100    |

## Features

- 3 lives with temporary invincibility after respawning (blinking)
- Asteroids split into smaller fragments when destroyed
- Explosion particles when an asteroid is destroyed
