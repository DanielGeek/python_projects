# Phase 0 Research: Podcast Website

All Technical Context items are resolved; there are no open `NEEDS CLARIFICATION` items. Next.js behaviour below was checked against the Next.js v16.2.9 docs.

## 1. Rendering / hosting model

- **Decision**: Next.js App Router with `output: 'export'` in `next.config.mjs`; `next build` writes the site to `out/`.
- **Rationale**: Matches the user's stated approach and constitution Principle I (static files, any host, no runtime). The export docs confirm `output: 'export'` produces an `out` folder of static HTML/CSS/JS.
- **Alternatives considered**: Plain HTML/CSS/JS (rejected, duplication; see Complexity Tracking); Astro (not requested, extra framework to learn); Next.js with a Node server (violates Principle I).

## 2. Routing & output shape

- **Decision**: `trailingSlash: true`, so `/about` exports as `/about/index.html`. This works on hosts without rewrite rules. Routes: `/`, `/episodes/`, `/about/`, `/facts/`, plus `not-found.tsx` which is exported as `404.html`.
- **Rationale**: Documented behaviour for static export; the most portable layout across static hosts. A custom 404 satisfies FR-014.
- **Alternatives considered**: Default `.html` files (needs host-specific rewrites on some hosts).

## 3. Mock data

- **Decision**: Typed TypeScript modules in `src/data/` (`episodes.ts`, `hosts.ts`, `podcast.ts`) imported directly by pages. No fetching, no JSON-over-network. A JSON Schema in `contracts/episode.schema.json` documents the Episode shape and is used by a unit test to validate the data.
- **Rationale**: "Data is embedded in the content" (user). Type-checked at build time; zero network requests; satisfies FR-005.
- **Alternatives considered**: Markdown/MDX per episode (more files and tooling than 20 records justify); a JSON file read at runtime (loses type safety, needs fetch).

## 4. Images / cover art

- **Decision**: Cover art is generated, not downloaded: a `CoverArt` component renders deterministic inline SVG/CSS art from the episode number and topic (unique gradient + shape per episode). `images.unoptimized: true` is set because the image optimizer is a server feature unavailable under static export.
- **Rationale**: No binary assets to source or license, instant load, always has a fallback (edge case: missing art), and gives the site a distinctive look. Alt text/`aria-label` is generated from the episode title.
- **Alternatives considered**: Stock photos (licensing, weight, need alt-text curation); `next/image` optimization (unsupported with export).

## 5. Styling & visual identity

- **Decision**: Plain CSS: a global stylesheet of design tokens (CSS custom properties for color, type scale, spacing) plus CSS Modules per component. Mobile-first with `clamp()` fluid type and CSS Grid/Flexbox; breakpoints added upward from 320px. Dark, high-contrast, editorial look with one bold accent color. Fonts via `next/font` (self-hosted at build time, no runtime request to a font CDN).
- **Rationale**: Principle II (no CSS framework needed for 4 pages); full control over a distinctive identity (FR-009); self-hosted fonts avoid third-party render-blocking requests.
- **Alternatives considered**: Tailwind (extra dependency/build config for little gain); component library (generic look, works against "stand out").

## 6. Interactivity & JavaScript budget

- **Decision**: All pages are Server Components; no client components are required in v1. Mobile navigation uses a CSS-only/`<details>` pattern so it works without JS. Any motion respects `prefers-reduced-motion`.
- **Rationale**: Content readable with scripting disabled or slow networks (edge case), minimal JS for fast mobile load (SC-007), fewer accessibility pitfalls.
- **Alternatives considered**: Client-side menu state with `useState` (adds JS for no user benefit).

## 7. Accessibility

- **Decision**: Skip-to-content link; landmarks (`header`, `nav`, `main`, `footer`); one `h1` per page; `aria-current="page"` on the active nav link; visible `:focus-visible` styles; contrast ≥ 4.5:1 for text; touch targets ≥ 44px; `lang="en"`. Verified with `@axe-core/playwright` in e2e tests.
- **Rationale**: Constitution Principle III, FR-011, SC-006.
- **Alternatives considered**: Manual-only checks (not repeatable).

## 8. SEO & structured data

- **Decision**: Per-page `export const metadata` (unique title + description, Open Graph, canonical). JSON-LD `PodcastSeries` on Home/About and `PodcastEpisode` items on Episodes, rendered by a small `JsonLd` component. `sitemap.ts` and `robots.ts` (both `force-static`) emit `sitemap.xml` and `robots.txt`. Site origin comes from a build-time env var `NEXT_PUBLIC_SITE_URL` with a placeholder default.
- **Rationale**: Principle III ("meta tags, structured data where applicable"), FR-012.
- **Alternatives considered**: Hand-written `<head>` tags per page (duplication, easy to miss).

## 9. Facts computation

- **Decision**: `computeFacts(episodes)` in `src/lib/facts.ts` is a pure function returning total episodes, total runtime, distinct guest count, top topics and the longest/shortest episode. It runs at build time inside the Facts page. Hand-written fun facts are static copy.
- **Rationale**: Guarantees SC-008 (stats always equal the data); pure function is trivially unit-testable.
- **Alternatives considered**: Hard-coded numbers (drift risk).

## 10. Testing strategy

- **Decision**: Vitest for `episodes.data` (exactly 20 episodes, unique numbers, exactly 1 featured, valid durations, schema-valid) and `facts`. Playwright against `out/` (served statically) for navigation (SC-001), 320px no-horizontal-scroll (SC-005), axe audit (SC-006), SEO tags, 404 page.
- **Rationale**: Each spec success criterion maps to an automated check; tests run on the same artifact that gets deployed.
- **Alternatives considered**: Jest + RTL (component tests add little for server-rendered static pages); Lighthouse CI (kept as a manual quickstart step to stay minimal).

## 11. Deployment base path

- **Decision**: Assume deployment at the domain root (no `basePath`). If hosted under a sub-path later, set `basePath` in `next.config.mjs`.
- **Rationale**: Simplest default; documented as an assumption.
