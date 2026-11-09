# UI Contract: Routes & Page Content

The site's only external interface is its set of static pages. This contract states what each URL must serve. It is verified by the Playwright e2e tests against `out/`.

## Global (every page)

- `<html lang="en">`; one `<h1>`; landmarks `header > nav`, `main`, `footer`.
- Skip-to-content link is the first focusable element.
- Nav contains links to `/`, `/episodes/`, `/about/`, `/facts/`; the current page's link has `aria-current="page"`.
- Unique `<title>` and `<meta name="description">`; Open Graph title/description.
- Readable with JavaScript disabled; no horizontal scroll at 320px width.

## Routes

| Route | Output file | Must contain | Spec refs |
|-------|-------------|--------------|-----------|
| `/` | `out/index.html` | Podcast name + tagline; exactly **one** featured episode (number, title, description, date, duration, cover art); CTA link to `/episodes/`; JSON-LD `PodcastSeries` | FR-003, FR-004, US1 |
| `/episodes/` | `out/episodes/index.html` | Exactly **20** episode entries, newest first, each with number, title, short description, date, duration, cover art; JSON-LD `PodcastEpisode` items | FR-006, US2 |
| `/about/` | `out/about/index.html` | Premise; ≥ 1 host with name and bio; ≥ 1 follow link | FR-007, US3 |
| `/facts/` | `out/facts/index.html` | Episode count, total runtime, distinct guest count, top topics, ≥ 3 fun facts; all numbers equal the values derived from the episode data | FR-008, SC-008, US4 |
| *(any unknown path)* | `out/404.html` | Friendly message + link back to `/` | FR-014 |
| `/sitemap.xml` | `out/sitemap.xml` | The four page URLs | Principle III |
| `/robots.txt` | `out/robots.txt` | Allows crawling; references the sitemap | Principle III |

## Data contract

Episode records conform to [`episode.schema.json`](./episode.schema.json); entity details are in [`../data-model.md`](../data-model.md).
