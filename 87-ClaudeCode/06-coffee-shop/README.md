# 06 - Coffee Shop (Nogal Café)

Landing page of **Nogal Café**, an online specialty-coffee shop, built with [Claude Code](https://claude.com/claude-code) and the [Impeccable](https://github.com/pbakaus/impeccable) design commands. It is a static site made with Astro 7 and Tailwind CSS v4.

The product leads with **origin and traceability**: each coffee is bought straight from a named farm, and the bag says who grew it and at what altitude. Freshness (roast to order) and a flexible subscription are supporting benefits. The copy is in Spanish; code and docs are in English.

## What is implemented

- **Home landing page** (`src/pages/index.astro`): hero, benefits strip, featured coffees, subscription steps, origin story, reviews, brewing guide, newsletter and footer.
- **Featured coffees** with weight (250 g, 500 g, 1 kg) and grind (bean, ground, capsule) selectors.
- **Side cart** with a free-shipping progress bar (free above a subtotal of $40, flat rate $4.90) and an "added to cart" notice.
- **Mobile menu** and **newsletter** form with validation.
- **UI polish**: transitions and motion helpers, with a dark, warm design (caramel as the only light).

Limits for now: the cart lives in memory only (no persistence, no checkout, no backend). Links to pages that are not built yet show a "coming soon" notice. The remaining pages are planned in `plan-landing-coffee.md`: catalog with filters, product page, subscription page, checkout, order confirmation, about/origin, brewing guide, account, contact/FAQ and legal pages.

## Stack

| Area      | Choice                                           |
| :-------- | :----------------------------------------------- |
| Framework | Astro 7 (static output)                          |
| Styling   | Tailwind CSS v4 via `@tailwindcss/vite`          |
| Language  | TypeScript for scripts, utils and config         |
| Fonts     | Newsreader (headings) and Instrument Sans (body) |
| Runtime   | Node `>=22.23.4`                                 |

## Project structure

```text
/
├── public/                  Static assets
├── assets/                  Source images
├── src/
│   ├── components/
│   │   ├── cart/            CartDrawer
│   │   ├── home/            Hero, Benefits, FeaturedProducts, Subscription,
│   │   │                    Origin, Testimonials, BrewGuide, Newsletter
│   │   ├── layout/          Header, Footer
│   │   ├── product/         ProductCard
│   │   └── ui/              Arrow, Logo, SectionHead, Stars, Toast
│   ├── config/              site.ts (brand, nav, shipping), products.ts (catalog)
│   ├── layouts/             Layout.astro
│   ├── pages/               index.astro
│   ├── scripts/             cart, navigation, newsletter, product-selectors, toast, main
│   ├── styles/              global.css (design tokens)
│   ├── types/               Shared types
│   └── utils/               cart, dom, format, motion, validation
├── PRODUCT.md               Users, positioning, constraints
├── DESIGN.md                Design system (colors, type, components)
├── plan-landing-coffee.md   Plan for the landing and the pages to come
└── AGENTS.md                Instructions for coding agents
```

## Commands

Run them from the project root.

| Command           | Action                                    |
| :---------------- | :---------------------------------------- |
| `npm install`     | Installs dependencies                     |
| `npm run dev`     | Starts the dev server at `localhost:4321` |
| `npm run build`   | Builds the production site to `./dist/`   |
| `npm run preview` | Previews the build locally                |

Astro 7 needs Node `>=22.23.4`. If your default Node is older, start the server with a newer one:

```sh
PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH" npx astro dev --background
```

## Built with Claude Code and Impeccable

`PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` were generated with these commands:

| Command                | What it does here                                                                         |
| :--------------------- | :---------------------------------------------------------------------------------------- |
| `/impeccable init`     | Interviews the user and writes `PRODUCT.md`.                                              |
| `/impeccable hooks on` | Enables the design detector hook for the project.                                         |
| `/impeccable document` | Scans the code and writes `DESIGN.md` and the design sidecar (tokens, components, rules). |
| `/impeccable live`     | Visual variant mode: pick an element in the browser and get variants hot-swapped.         |

`impeccable live` injects a helper script into `src/layouts/Layout.astro`. Run `impeccable live-server stop` before committing to remove it.

## Brand

Name **Nogal Café** (wordmark "Nogal."). Palette: toaster black `#141210`, toasted walnut `#5C3414`, caramel cream `#D4AC66`, milk foam `#F2EEE6` and workshop charcoal `#2E2C29`. See `DESIGN.md` for the full system.
