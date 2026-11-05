# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## File System to implement

src/
- pages/
- components/
- layouts/
- styles/
- scripts/
- types/
- utils/
- config/

## Commands

[Impeccable](https://github.com/pbakaus/impeccable) commands used in this project so far.

### Slash commands (run inside Claude Code)

| Command | What it does here |
| :-- | :-- |
| `/impeccable init` | Interviews the user and writes `PRODUCT.md` (users, positioning, constraints, evidence on hand). |
| `/impeccable hooks on` | Enables the design detector hook for this project (writes `.impeccable/config.json` and local consent in `.impeccable/config.local.json`). |
| `/impeccable document` | Scans the code and writes `DESIGN.md` plus the `.impeccable/design.json` sidecar (tokens, components, rules). |
| `/impeccable live` | Starts visual variant mode: pick an element in the browser, choose an action, and get variants hot-swapped on the page. Also receives manual text edits from the browser. |

### CLI scripts behind them

Run from the project root. The launcher lives in the skill folder (`~/.claude/skills/impeccable/scripts/impeccable`).

| Script | Used by | Purpose |
| :-- | :-- | :-- |
| `impeccable context` | every command | Loads `PRODUCT.md`, `DESIGN.md` and project state once per session. |
| `impeccable hooks on` | `/impeccable hooks on` | Turns the design hook on. |
| `impeccable detect-csp` | `/impeccable live` | Checks for a Content Security Policy that would block the live helper (none found here). |
| `impeccable live` | `/impeccable live` | Boots the live helper (port 8400) and injects its script into `src/layouts/Layout.astro`. Needs `.impeccable/live/config.json`. |
| `impeccable live-poll` | `/impeccable live` | Waits for browser events (generate, accept, manual edit). |
| `impeccable live-poll --reply <id> done --data '<json>'` | `/impeccable live` | Confirms an applied manual edit back to the browser. |
| `impeccable live-server stop` | exiting live mode | Stops the helper and removes the injected script from `Layout.astro`. Run it before committing. |

### Dev server note

Astro 7 needs Node `>=22.23.4`. If your default Node is older, start the server with a newer one, for example:

```sh
PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" npx astro dev --background
```

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
