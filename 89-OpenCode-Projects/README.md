# 89 - OpenCode Projects

Three independent projects built with [OpenCode](https://opencode.ai): a first static website, a Bun + TypeScript
command-line app, and an arcade game that grew through OpenCode custom commands and GitHub Actions.

| #   | Project                       | Type                  | Stack                                                  |
| --- | ----------------------------- | --------------------- | ------------------------------------------------------ |
| 01  | [demo](./01-demo)             | Static website        | HTML, Tailwind CSS 4 (CDN), JavaScript                 |
| 02  | [weather](./02-weather)       | Console application   | Bun, TypeScript, Open-Meteo                            |
| 03  | [asteroids](./03-asteroids)   | Arcade game           | HTML5 Canvas, vanilla JavaScript, OpenCode GitHub Actions |

Each project has its own `README.md` and `AGENTS.md`; run commands from inside the project directory.

## 01 - demo

A small website used to explore OpenCode. No build step: open `index.html` in a browser (Tailwind loads from a CDN).

## 02 - weather

A Weather CLI that saves cities and shows their current weather and 7-day forecast using Open-Meteo. It keeps a default
city, switches between °C and °F, uses colored output (disable with `NO_COLOR=1`) and compiles to a standalone
executable.

```bash
cd 02-weather
cp .env.example .env
bun install
bun run start      # also: bun run typecheck, bun test, bun run build
```

## 03 - asteroids

A dependency-free clone of the classic **Asteroids** in HTML5 canvas. Features added one at a time with OpenCode:

- Power-ups: velocity, shield and triple shot.
- Shooting star: a fast golden asteroid worth 200 points.
- Ship skins: 6 hull styles cycled with `S`, including the double-size Amethyst that doubles all points.

OpenCode workflow in this project:

- `.opencode/commands/` holds a custom command that creates a git worktree (`.worktrees/<name>`) from a short task
  description, so features such as skins, shield and triple shot were developed in parallel branches and merged.
- `.github/workflows/opencode.yml` (repository root) runs OpenCode when the repository owner comments `/oc` or
  `/opencode` on an issue; OpenCode implements the request and opens a pull request. It needs the `OPENCODE_API_KEY`
  repository secret (see `.env.template`).

```bash
cd 03-asteroids
open index.html    # or: npx serve .
```
