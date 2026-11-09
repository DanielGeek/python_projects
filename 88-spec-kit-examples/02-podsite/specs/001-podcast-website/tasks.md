---

description: "Task list for the Podcast Website feature"
---

# Tasks: Podcast Website

**Input**: Design documents from `/specs/001-podcast-website/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because plan.md and quickstart.md define Vitest (data/stats unit tests) and Playwright + axe (end-to-end against the exported `out/`) as the way each success criterion is verified.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1–US4)
- All paths are relative to the repository root `02-podsite/` (single Next.js project, see plan.md "Source Code")

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [ ] T001 Create `package.json` with scripts `dev` (`next dev`), `build` (`next build`), `start:static` (serve `./out` on port 4173, e.g. `npx serve out -l 4173`), `lint`, `test` (`vitest run`), `test:e2e` (`playwright test`); dependencies `next@16`, `react@19`, `react-dom@19`; devDependencies `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `vitest`, `ajv`, `ajv-formats`, `@playwright/test`, `@axe-core/playwright`, `serve`; set `"engines": { "node": ">=20.9" }`
- [ ] T002 [P] Create `tsconfig.json` (strict mode, `moduleResolution: bundler`, path alias `@/*` → `src/*`, Next.js plugin) at repository root
- [ ] T003 [P] Create `next.config.mjs` with `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` (no `basePath`; see research.md §2, §4, §11)
- [ ] T004 [P] Create `vitest.config.ts` (node environment, include `tests/unit/**/*.test.ts`, alias `@` → `src`)
- [ ] T005 [P] Create `playwright.config.ts` (testDir `tests/e2e`, chromium only, `webServer` runs `npm run start:static` against `./out` on `http://localhost:4173`, `reuseExistingServer: true`)
- [ ] T006 [P] Create `.gitignore` ignoring `node_modules/`, `.next/`, `out/`, `playwright-report/`, `test-results/`, `next-env.d.ts`, `.env*.local`
- [ ] T007 [P] Create `eslint.config.mjs` extending the Next.js core-web-vitals config
- [ ] T008 Run `npm install` and `npx playwright install chromium`; confirm `npx tsc --noEmit` has no config errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Typed data, shared helpers and the shared shell (layout, nav, footer, tokens) that every page uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Create `src/lib/types.ts` exporting `Podcast`, `Host` and `Episode` types exactly as in data-model.md (`Episode`: `number` integer, `title` string, `description` string, `publishedAt` `YYYY-MM-DD` string, `durationSeconds` integer, `guests` string[], `topics` string[], `featured` boolean)
- [ ] T010 [P] Create `src/data/podcast.ts` exporting the `podcast` object: fictional `name`, `tagline`, `description`, `premise`, and `followLinks` (≥ 1 placeholder `{ label, href }`)
- [ ] T011 [P] Create `src/data/hosts.ts` exporting `hosts: Host[]` with ≥ 1 host (id slug, name, short bio; no photo required)
- [ ] T012 Create `src/data/episodes.ts` exporting `episodes: Episode[]` with 20 mocked records. Constraints from data-model.md, verbatim: "Exactly 20 episodes; `number` values are unique and cover 1–20", "Exactly 1 episode has `featured: true` (default: the highest-numbered/most recent)", "`publishedAt` is a valid date and unique", "`durationSeconds` is a positive integer", `topics` has ≥ 1 tag, `guests` may be empty. Include at least one episode with a very long title and description (edge case) and at least two episodes with no guests (depends on T009)
- [ ] T013 Create `src/lib/episodes.ts` exporting `sortNewestFirst(episodes)`, `getFeatured(episodes)` (returns the single `featured` episode), `formatDuration(seconds)` (`H:MM:SS` when ≥ 1 h, else `M:SS`), `formatDate(isoDate)` (e.g. "Nov 9, 2026"), and `shortDescription(text, maxChars)` (depends on T009)
- [ ] T014 [P] Create `tests/unit/episodes.data.test.ts`: validate `episodes` against `specs/001-podcast-website/contracts/episode.schema.json` using `ajv/dist/2020` + `ajv-formats`, and assert unique `number` values covering 1–20, unique `publishedAt`, exactly one `featured` (depends on T012)
- [ ] T015 [P] Create `tests/unit/episodes.lib.test.ts` covering `sortNewestFirst` (descending by date), `getFeatured`, `formatDuration` (e.g. 59 → `0:59`, 3725 → `1:02:05`) and `shortDescription` truncation (depends on T013)
- [ ] T016 [P] Create `src/app/globals.css`: design tokens as CSS custom properties (dark editorial palette with one bold accent, fluid type scale via `clamp()`, spacing scale), minimal reset, `:focus-visible` outline, `prefers-reduced-motion` handling, `.visually-hidden` and skip-link styles; text contrast ≥ 4.5:1 and touch targets ≥ 44px (research.md §5, §7)
- [ ] T017 [P] Create `src/components/CoverArt.tsx` + `src/components/CoverArt.module.css`: server component rendering deterministic inline SVG/CSS art from `number` and first `topic` (research.md §4), `role="img"` with `aria-label` built from the episode title; always renders (acts as its own fallback)
- [ ] T018 [P] Create `src/components/JsonLd.tsx`: renders `<script type="application/ld+json">` from a `data` prop
- [ ] T019 [P] Create `src/components/NavLinks.tsx` as a small client component using `usePathname()` to set `aria-current="page"` on the active link for `/`, `/episodes/`, `/about/`, `/facts/` (it is prerendered, so the attribute is present in the static HTML)
- [ ] T020 Create `src/components/SiteHeader.tsx` + `src/components/SiteHeader.module.css`: podcast name linking to `/`, `<nav>` using `NavLinks`, mobile menu via `<details>`/`<summary>` (works without JS) (depends on T019)
- [ ] T021 [P] Create `src/components/SiteFooter.tsx` + `src/components/SiteFooter.module.css`: shared footer with nav repeat, follow links and copyright
- [ ] T022 Create `src/app/layout.tsx`: `<html lang="en">`, fonts via `next/font` (self-hosted), import `globals.css`, skip-to-content link as first focusable element, `SiteHeader`, `<main id="main">`, `SiteFooter`, default `metadata` with `metadataBase` from `process.env.NEXT_PUBLIC_SITE_URL` (placeholder default `https://example.com`) and Open Graph defaults (depends on T016, T020, T021)

**Checkpoint**: `npx tsc --noEmit` and `npm run test` pass. Shell and data are ready, and user stories can begin.

---

## Phase 3: User Story 1 - Landing page with a featured episode (Priority: P1) 🎯 MVP

**Goal**: Home page with a bold hero, exactly one featured episode, a CTA to the episodes page and nav to every page.

**Independent Test**: Build and serve `out/`, open `/`: exactly one featured episode with all details and a CTA to `/episodes/` (quickstart scenario 1).

### Tests for User Story 1

- [ ] T023 [P] [US1] Create `tests/e2e/home.spec.ts`: on `/` assert podcast name and tagline visible without scrolling, exactly one featured episode block containing number, title, description, date, duration and cover art, CTA link `href="/episodes/"`, nav has links to `/`, `/episodes/`, `/about/`, `/facts/` with `aria-current="page"` on Home, and JSON-LD `PodcastSeries` present

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create `src/components/FeaturedEpisode.tsx` + `src/components/FeaturedEpisode.module.css`: large card using `CoverArt`, episode number, title, description, formatted date and duration (props: one `Episode`)
- [ ] T025 [US1] Create `src/app/page.tsx`: export `metadata` (unique title + description), hero with `podcast.name` as the `<h1>` and tagline, `FeaturedEpisode` for `getFeatured(episodes)`, CTA link to `/episodes/`, and `JsonLd` `PodcastSeries` (depends on T024)
- [ ] T026 [US1] Run `npm run build && npx playwright test tests/e2e/home.spec.ts`; fix failures until `out/index.html` passes

**Checkpoint**: User Story 1 is fully functional and testable independently, and is the MVP.

---

## Phase 4: User Story 2 - Browse all episodes (Priority: P2)

**Goal**: Episodes page listing all 20 episodes, newest first, each with full details.

**Independent Test**: Open `/episodes/`: 20 entries in descending date order, each with every required detail (quickstart scenario 2).

### Tests for User Story 2

- [ ] T027 [P] [US2] Create `tests/e2e/episodes.spec.ts`: on `/episodes/` assert exactly 20 entries, order is newest first (dates descending), each entry shows number, title, short description, date, duration and cover art, and JSON-LD `PodcastEpisode` items are present

### Implementation for User Story 2

- [ ] T028 [P] [US2] Create `src/components/EpisodeCard.tsx` + `src/components/EpisodeCard.module.css`: list item with `CoverArt`, number, title, `shortDescription`, date, duration; wraps long titles and descriptions without overflow (`overflow-wrap: anywhere`)
- [ ] T029 [US2] Create `src/app/episodes/page.tsx`: export `metadata`, `<h1>`, ordered list of `EpisodeCard` from `sortNewestFirst(episodes)`, and `JsonLd` with `PodcastEpisode` entries (depends on T028)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Learn about the podcast (Priority: P3)

**Goal**: About page with premise, hosts and follow links.

**Independent Test**: Open `/about/`: premise, ≥ 1 host with bio, ≥ 1 follow link (quickstart scenario 3).

### Tests for User Story 3

- [ ] T030 [P] [US3] Create `tests/e2e/about.spec.ts`: on `/about/` assert the premise text, ≥ 1 host with name and bio, and ≥ 1 follow link

### Implementation for User Story 3

- [ ] T031 [US3] Create `src/app/about/page.tsx` + `src/app/about/about.module.css`: export `metadata`, `<h1>`, `podcast.premise`, host list from `hosts`, follow links from `podcast.followLinks`

**Checkpoint**: User Stories 1–3 work independently.

---

## Phase 6: User Story 4 - Explore podcast facts (Priority: P3)

**Goal**: Facts page with statistics computed from the episode data plus fun facts.

**Independent Test**: Open `/facts/`: 20 episodes, total runtime equal to the sum of all durations, distinct guest count, top topics (quickstart scenario 4).

### Tests for User Story 4

- [ ] T032 [P] [US4] Create `tests/unit/facts.test.ts`: `computeFacts(episodes)` returns `episodeCount` 20, `totalRuntimeSeconds` equal to the sum of `durationSeconds`, `distinctGuestCount` equal to the size of the set of all `guests`, `topTopics` ranked by frequency (top 5, ties by name), and correct `longestEpisode`/`shortestEpisode`
- [ ] T033 [P] [US4] Create `tests/e2e/facts.spec.ts`: on `/facts/` assert displayed episode count, total runtime, distinct guests and top topics equal values computed from `src/data/episodes.ts` (SC-008), and ≥ 3 fun facts

### Implementation for User Story 4

- [ ] T034 [US4] Create `src/lib/facts.ts` exporting `computeFacts(episodes)` and the `Facts` type per data-model.md "Facts (derived, not stored)" (depends on T009)
- [ ] T035 [P] [US4] Create `src/components/StatCard.tsx` + `src/components/StatCard.module.css`: label + large value card
- [ ] T036 [US4] Create `src/app/facts/page.tsx` + `src/app/facts/facts.module.css`: export `metadata`, `<h1>`, `StatCard`s from `computeFacts(episodes)` (episode count, total runtime via `formatDuration`, distinct guests, top topics, longest/shortest episode) and ≥ 3 hand-written fun facts as static copy (depends on T034, T035)

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 404, SEO files and the cross-page success-criteria checks

- [ ] T037 [P] Create `src/app/not-found.tsx`: friendly message with a link back to `/` (exported as `out/404.html`; FR-014)
- [ ] T038 [P] Create `src/app/sitemap.ts` with `export const dynamic = 'force-static'` listing `/`, `/episodes/`, `/about/`, `/facts/` using `NEXT_PUBLIC_SITE_URL`
- [ ] T039 [P] Create `src/app/robots.ts` with `export const dynamic = 'force-static'`, allow all and reference the sitemap
- [ ] T040 [P] Create `tests/e2e/navigation.spec.ts`: from every page click each nav link and land on the right page (SC-001), `aria-current="page"` follows the active page, and an unknown path serves the friendly 404 with a link to `/` (FR-014)
- [ ] T041 [P] Create `tests/e2e/responsive.spec.ts`: at 320px width, no horizontal scroll (`document.documentElement.scrollWidth <= clientWidth`) on `/`, `/episodes/`, `/about/`, `/facts/` (SC-005)
- [ ] T042 [P] Create `tests/e2e/a11y.spec.ts`: run `@axe-core/playwright` on all four pages and `/404.html`, expect zero serious/critical violations (SC-006); tab through each page and assert every link is reachable with a visible focus indicator
- [ ] T043 [P] Create `tests/e2e/seo.spec.ts`: each page has a unique `<title>` and `<meta name="description">`, Open Graph tags exist, JSON-LD parses, and `/sitemap.xml` and `/robots.txt` are served (FR-012)
- [ ] T044 Run `npm run lint && npx tsc --noEmit && npm run test && npm run build && npm run test:e2e`; fix any failures
- [ ] T045 Run the manual quickstart.md scenarios 10 (JavaScript disabled) and 11 (Lighthouse mobile on served `out/`: content visible ≤ 2 s, no render-blocking third-party requests); record results in `specs/001-podcast-website/checklists/requirements.md` Notes
- [ ] T046 Review `specs/001-podcast-website/quickstart.md` scenarios 1–9 against the running build and confirm each matches its expected outcome

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately
- **Foundational (Phase 2)**: Depends on Setup, and blocks all user stories
- **User Stories (Phases 3–6)**: All depend on Foundational; after that they can run in parallel or in priority order (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Depends on the user stories being complete (T040–T043 assert across all pages)

### User Story Dependencies

- **US1 (P1)**: After Foundational, no dependency on other stories. Its nav links to other pages only need to exist as `href`s
- **US2 (P2)**: After Foundational. Reuses `CoverArt` and the `lib/episodes` helpers, no dependency on US1
- **US3 (P3)**: After Foundational, fully independent
- **US4 (P3)**: After Foundational. Needs only `src/data/episodes.ts` and `src/lib/types.ts`

### Within Each User Story

- Tests are written first and should fail before the page exists
- Components before the page that uses them
- Story complete (checkpoint) before moving on

### Parallel Opportunities

- Setup: T002–T007 are all [P]
- Foundational: T009–T011 together; then T014/T015 with T016–T019 and T021 (different files)
- After Phase 2, US1–US4 can be built in parallel by different people
- Within a story, the [P] test and component tasks touch different files and can run together
- Polish: T037–T043 are all [P]

---

## Parallel Example: User Story 2

```text
# Launch together:
Task: "Create tests/e2e/episodes.spec.ts"                                  (T027)
Task: "Create src/components/EpisodeCard.tsx + EpisodeCard.module.css"      (T028)
# Then:
Task: "Create src/app/episodes/page.tsx"                                    (T029)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks everything)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: build, serve `out/`, run `home.spec.ts` (T026)
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → shell and data ready
2. US1 → validate → demo (MVP: a landing page that can ship alone)
3. US2 → validate → demo
4. US3 and US4 → validate each
5. Polish → full automated run plus manual quickstart scenarios

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to a user story for traceability
- The spec's acceptance scenarios are numbered lists, not checkboxes. Progress is tracked by ticking the boxes in this file as each task completes, and by updating `checklists/requirements.md` Notes after each phase (T045)
- One deliberate deviation from research.md §6: `NavLinks.tsx` (T019) is a single small client component so `aria-current` can follow the current route. It is prerendered into the static HTML, so it still works without JavaScript
- Commit after each task or logical group
