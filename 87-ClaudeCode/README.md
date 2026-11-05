# 87 - Claude Code

A progression of six projects built with [Claude Code](https://claude.com/claude-code): from a one-file experiment to a full-stack, spec-driven web platform that is live in production, plus a design-driven coffee-shop storefront.

| #   | Project                             | Type                     | Stack                                                       |
| --- | ----------------------------------- | ------------------------ | ----------------------------------------------------------- |
| 01  | [first-code](./01-first-code)       | First prompt, single page | HTML, JavaScript                                            |
| 02  | [asteroids](./02-asteroids)         | Arcade game              | HTML5 Canvas, vanilla JavaScript                            |
| 03  | [claude-tetris](./03-claude-tetris) | Arcade game              | HTML5 Canvas, CSS, vanilla JavaScript                       |
| 04  | [arkanoid](./04-arkanoid)           | Spec-driven arcade game  | HTML5 Canvas, vanilla JavaScript                            |
| 05  | [arcade-vault](./05-arcade-vault)   | Full-stack game platform | Next.js 16, React 19, Tailwind 4, Supabase, Resend, Vercel  |
| 06  | [coffee-shop](./06-coffee-shop)     | Design-driven storefront | Astro 7, Tailwind 4, TypeScript, Impeccable                 |

**Live app:** project 05 is deployed at https://arcade-vault-zeta.vercel.app/

---

## 01 - first-code

The first experiment with Claude Code: `contador.html`, a single-page counter with a `-` and a `+` button (`cambiar(n)` adds or subtracts one) on a dark background. No dependencies, no build step. Open the file in a browser.

## 02 - asteroids

A clone of the classic **Asteroids** in pure HTML5 canvas, with no dependencies or bundler.

- A spaceship in a toroidal field (the edges wrap). Large asteroids split into medium ones, and medium ones into small ones (20 / 50 / 100 points).
- 3 lives with blinking invincibility on respawn, explosion particles, power-ups and special asteroid types such as the shooting star.
- Controls: `←` `→` rotate, `↑` thrust, `Space` shoot.
- Files: `index.html`, `game.js`, `favicon.svg`, `CLAUDE.md`, `README.md`. Run by opening `index.html` or with `npx serve .`.

## 03 - claude-tetris

**Tetris** in vanilla JavaScript with HTML5 Canvas and CSS: no frameworks, no build step.

- The README documents what the game does, two ways to run it (open the file, or a local server), the controls and how the code works.
- Files: `index.html`, `style.css`, `game.js`, `CLAUDE.md`, `README.md`.

## 04 - arkanoid

A browser Arkanoid (brick-breaker) on an HTML5 canvas, and the first project built with **specs** (`specs/01` to `08`, all implemented).

- Start screen with a difficulty choice that sets the ball speed and lives: Easy (300 px/s, 5 lives), Normal (400 px/s, 3) and Hard (500 px/s, 2).
- Paddle, a ball that sticks to the paddle at the start, a bounce angle that depends on where the ball hits the paddle, bricks with a 150 ms explosion animation, three hand-made levels (`levels.js`), sound effects, a mute indicator, pause and resume, and an on-screen controls guide.
- Controls: `1` `2` `3` or arrows then `Enter` / `Space` to pick a difficulty; `←` `→`, `A` `D` or the mouse to move the paddle.

## 05 - arcade-vault

**Arcade Vault** is a web platform for playing arcade games online and competing for the highest score. It is live at **https://arcade-vault-zeta.vercel.app/**.

What happens in this project:

- **Games.** Five playable static HTML/canvas games embedded in an iframe: Asteroids, Drop (Tetris-style), Brick Buster (Arkanoid-style), Snake and Froggy. Each has the skins classic, retro and neon plus a light/dark theme. A bridge script (`public/games/bridge.js`) reports score, lives and level to the host page and receives pause and key messages.
- **Pages.** Landing, library, game detail, player, About with a contact form (emails through Resend), Hall of Fame, login and profile.
- **Global leaderboard.** Scores are stored in Supabase (Postgres) under Row Level Security. The Hall of Fame shows the top 50 per game. Per-game score limits and an insert rate limit are specified (SPEC 18, Approved) but not implemented yet.
- **Accounts.** Supabase Auth with email and password (username, email confirmation), Google and GitHub sign-in, password recovery, and a "Play as guest" mode that saves scores as `GUEST`.
- **Mobile.** On phones the games get on-screen touch controls (the Gamepad MK-II pad); Froggy also supports swipe.
- **Security (SPEC 17).** Security headers on every route, a `proxy.ts` that protects the player and the profile page, safe `?next=` redirects, a password rule, least-privilege database grants, and a read-only `security-auditor` agent.
- **Performance (SPEC 14).** Canvas costs measured and reduced in all five games, with a documented protocol and budgets.
- **Spec-driven design.** 18 numbered specs in `specs/` (01 to 17 implemented, 18 Approved) plus Draft game-jam specs in `specs/game-jam/` (flux, froggy, prism, skyguard, surge). The skills `/spec`, `/spec-impl`, `/add-game` and `/spec-impl-game` take a spec from Draft to Approved to Implemented.
- **Agents.** `game-planner`, `game-jam`, `skin-designer`, `mobile-porter`, `game-performance-booster` and `security-auditor`, each limited to what it is asked to touch and each with one memory file.
- **Tests and tooling.** Vitest unit tests, ESLint, Prettier, a format hook on every file edit, and separate `.env.development` / `.env.prod` files.
- **Deployment.** Vercel for the app and a separate production Supabase project, updated with the same migration files used in development.

See [05-arcade-vault/README.md](./05-arcade-vault/README.md) for setup and [05-arcade-vault/CLAUDE.md](./05-arcade-vault/CLAUDE.md) for the full architecture.

## 06 - coffee-shop

**Nogal Café**, the landing page of an online specialty-coffee shop, built with Astro 7 and Tailwind CSS v4. It is the first project in this folder driven by the **Impeccable** design commands (`/impeccable init`, `hooks on`, `document`, `live`), which produced `PRODUCT.md` and `DESIGN.md`.

- **Positioning.** Origin and traceability first: every coffee names the farm and the altitude. Copy is in Spanish; code and docs are in English.
- **Landing.** Hero, benefits strip, featured coffees with weight (250 g, 500 g, 1 kg) and grind (bean, ground, capsule) selectors, subscription steps, origin story, reviews, brewing guide, newsletter and footer.
- **Cart.** A side cart with a free-shipping progress bar (free above $40) and an "added to cart" notice. It lives in memory only: no checkout or backend yet.
- **Structure.** `src/{components, config, layouts, pages, scripts, styles, types, utils}` with the catalog and brand data in `src/config`.
- **Planned.** Catalog, product page, subscription page, checkout, about, brewing guide, account, FAQ and legal pages (see `plan-landing-coffee.md`).

See [06-coffee-shop/README.md](./06-coffee-shop/README.md) for setup and commands (Node `>=22.23.4`).
