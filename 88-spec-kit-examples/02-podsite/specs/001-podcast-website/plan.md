# Implementation Plan: Podcast Website

**Branch**: `001-podcast-website` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-podcast-website/spec.md`

## Summary

A sleek, mobile-first, four-page podcast site (Home with one featured episode, Episodes, About, Facts) backed by 20 mocked episodes. It is built with Next.js (App Router) configured for **static export** (`output: 'export'`), so the build produces plain HTML/CSS/JS in `out/` that any static host can serve. Episode data lives in a typed TypeScript module embedded in the source. There is no database, API or runtime server. Facts-page statistics are computed from the same data at build time. Pages are React Server Components, so almost no JavaScript is shipped to the browser.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js ≥ 20.9 (Next.js 16 requirement); React 19

**Primary Dependencies**: `next` (16.x, App Router), `react`, `react-dom`. No UI kit, no CSS framework, no state library.

**Storage**: N/A. Mock data is embedded in `src/data/*.ts` and bundled at build time.

**Testing**: Vitest (data integrity and stats unit tests); Playwright with `@axe-core/playwright` (end-to-end navigation, responsive and accessibility checks against the exported `out/` folder)

**Target Platform**: Any static file host (GitHub Pages, Netlify, S3/CDN); browsers: latest two versions of evergreen browsers; phones from 320px wide

**Project Type**: Web application, static front-end only (single project)

**Performance Goals**: Content visible ≤ 2 s on a typical mobile connection (SC-007); Largest Contentful Paint ≤ 2.0 s; near-zero client JS on content pages

**Constraints**: Static export only, so no server features (no API routes, middleware, rewrites, `next/image` optimization or ISR); no horizontal scroll at 320px; WCAG 2.2 AA; no secrets in client code

**Scale/Scope**: 4 pages + 404, 20 episodes, 1 featured, 1–2 hosts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Static-First | ✅ Pass | `output: 'export'` emits plain static files to `out/`; no runtime, database or backend; data embedded in source. |
| II. Simplicity (YAGNI) | ⚠️ Justified | Constitution prefers vanilla HTML/CSS/JS; a framework "MUST be justified in the plan". See Complexity Tracking. Otherwise minimal: 3 runtime dependencies, plain CSS (no Tailwind/UI kit), no state library, no CMS. |
| III. Accessibility & SEO Baseline | ✅ Pass (by design) | Semantic landmarks, alt text/`aria` on cover art, AA-contrast palette, visible focus, skip link; per-page `metadata` (title, description, Open Graph), JSON-LD structured data, `sitemap.xml`, `robots.txt`. Verified by axe + Playwright. |

**Post-design re-check (after Phase 1)**: unchanged. Design artifacts add no server component, no new runtime dependency and no database.

## Project Structure

### Documentation (this feature)

```text
specs/001-podcast-website/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── routes.md
│   └── episode.schema.json
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json
next.config.mjs              # output: 'export', trailingSlash, images.unoptimized
tsconfig.json
vitest.config.ts
playwright.config.ts         # serves ./out and runs e2e + axe

src/
├── app/
│   ├── layout.tsx           # <html lang>, fonts, skip link, header/footer, default metadata
│   ├── globals.css          # design tokens (CSS variables), resets, base typography
│   ├── page.tsx             # Home: hero + featured episode + CTA
│   ├── episodes/page.tsx    # all 20 episodes, newest first
│   ├── about/page.tsx       # premise, hosts, follow links
│   ├── facts/page.tsx       # computed stats + fun facts
│   ├── not-found.tsx        # exported as 404.html
│   ├── sitemap.ts           # static sitemap.xml
│   └── robots.ts            # static robots.txt
├── components/              # SiteHeader, SiteFooter, FeaturedEpisode, EpisodeCard,
│                            # CoverArt, StatCard, JsonLd (each with a co-located *.module.css)
├── data/
│   ├── podcast.ts           # Podcast + follow links
│   ├── hosts.ts             # Host[]
│   └── episodes.ts          # 20 mocked Episode records
└── lib/
    ├── episodes.ts          # sortNewestFirst, getFeatured, formatters
    └── facts.ts             # computeFacts(episodes) → stats

tests/
├── unit/                    # episodes.data.test.ts, facts.test.ts
└── e2e/                     # navigation.spec.ts, responsive.spec.ts, a11y.spec.ts, seo.spec.ts
```

**Structure Decision**: Single Next.js project at the repository root of `02-podsite` (no separate backend). `src/app` holds the routes, `src/data` the embedded mock content, `src/lib` the pure functions that unit tests cover, and `src/components` the shared UI. Tests are split into fast unit tests for the data and e2e tests that run against the real static output.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Next.js framework (+ React, TypeScript, a build step) instead of vanilla HTML/CSS/JS (Principle II) | Explicit project decision. It gives one shared layout/nav across 4 pages with the current page indicated (FR-002), a typed single source of data used by three pages, the built-in metadata API for per-page SEO (FR-012), and build-time computation of Facts statistics so they always match the data (SC-008). `output: 'export'` keeps Principle I intact. | Hand-written HTML would duplicate the nav, footer and head tags across pages and the 20 episodes across Home, Episodes and Facts, so drift is likely. A vanilla build script would end up re-implementing a small part of what Next.js already provides. |
