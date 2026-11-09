# Quickstart & Validation Guide: Podcast Website

How to run the site and prove it meets the spec. Implementation details live in `tasks.md`; this is a run/validation guide only.

## Prerequisites

- Node.js ≥ 20.9 and npm
- Playwright browsers: `npx playwright install chromium` (first run only)

## Setup & run

```bash
npm install
npm run dev          # http://localhost:3000 with hot reload
npm run build        # static export → ./out
npm run start:static # serves ./out (e.g. http://localhost:4173)
```

`npm run build` must finish with `output: 'export'` active and create `out/index.html`, `out/episodes/index.html`, `out/about/index.html`, `out/facts/index.html` and `out/404.html`. See [contracts/routes.md](./contracts/routes.md).

## Automated checks

```bash
npm run test         # Vitest: episode data + facts unit tests
npm run test:e2e     # Playwright (+ axe) against the built ./out
```

## Validation scenarios

| # | Scenario | Steps | Expected | Spec |
|---|----------|-------|----------|------|
| 1 | Landing page | Open `/` | Name + tagline and exactly one featured episode with all details above the fold; CTA goes to `/episodes/` | US1, FR-003/004, SC-003 |
| 2 | Episode list | Open `/episodes/` | 20 entries, newest first, each with all details | US2, FR-006, SC-002 |
| 3 | About | Open `/about/` | Premise, ≥ 1 host + bio, follow links | US3, FR-007 |
| 4 | Facts | Open `/facts/` | Stats equal values computed from the data (20 episodes, total runtime = sum of durations) | US4, FR-008, SC-008 |
| 5 | Navigation | From each page click every nav link | Each page reachable in one click; current page marked | FR-002, SC-001 |
| 6 | 404 | Open `/does-not-exist/` | Friendly page with link to `/` | FR-014 |
| 7 | Mobile | Resize to 320px (or run `responsive.spec.ts`) | No horizontal scroll on any page | FR-010, SC-005 |
| 8 | Accessibility | Run `a11y.spec.ts`; tab through each page | Zero serious/critical axe issues; every control reachable with visible focus | FR-011, SC-006 |
| 9 | SEO | Run `seo.spec.ts`; view page source | Unique title/description per page; JSON-LD present; `sitemap.xml` and `robots.txt` exist | FR-012 |
| 10 | No JS | Disable JavaScript and reload each page | All content still readable | Edge cases |
| 11 | Performance (manual) | Chrome DevTools → Lighthouse, mobile, on served `out/` | Content visible ≤ 2 s; no render-blocking third-party requests | SC-007 |

## Done when

All automated checks pass and scenarios 1–11 behave as expected.
