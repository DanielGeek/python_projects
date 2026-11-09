# Data Model: Podcast Website

All entities are embedded, read-only mock data in `src/data/`. There is no persistence layer and no state transitions.

## Podcast (singleton) — `src/data/podcast.ts`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Fictional show name |
| `tagline` | string | One line, shown in the hero |
| `description` | string | Used on Home and About, and as the default meta description |
| `premise` | string | Longer "what is this show" copy for About |
| `followLinks` | `{ label: string; href: string }[]` | Placeholder platform links (≥ 1) |

## Host — `src/data/hosts.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique slug |
| `name` | string | |
| `bio` | string | Short bio |
| `photo` | string \| undefined | Optional; a generated avatar is used when absent |

**Rules**: at least 1 host.

## Episode — `src/data/episodes.ts` (20 records)

| Field | Type | Notes |
|-------|------|-------|
| `number` | integer | 1–20, unique |
| `title` | string | Non-empty; may be long (layout must cope) |
| `description` | string | Non-empty; the list view shows a short version |
| `publishedAt` | ISO date string (`YYYY-MM-DD`) | Unique per episode; drives newest-first ordering |
| `durationSeconds` | integer > 0 | Formatted as `H:MM:SS`/`MM:SS` for display |
| `guests` | string[] | May be empty; names used for the distinct-guest count |
| `topics` | string[] | ≥ 1 tag; drives top-topics fact and cover-art palette |
| `featured` | boolean | Exactly one episode is `true` |

**Validation rules** (enforced by unit tests and `contracts/episode.schema.json`):
- Exactly 20 episodes; `number` values are unique and cover 1–20.
- Exactly 1 episode has `featured: true` (default: the highest-numbered/most recent).
- `publishedAt` is a valid date and unique.
- `durationSeconds` is a positive integer.

**Relationships**: The Podcast has many Episodes and Hosts. All Episodes belong to the one Podcast; there is no per-episode host link in v1.

## Facts (derived, not stored) — `src/lib/facts.ts`

Computed at build time from `Episode[]`:

| Fact | Derivation |
|------|------------|
| `episodeCount` | `episodes.length` |
| `totalRuntimeSeconds` | sum of `durationSeconds` |
| `distinctGuestCount` | size of the set of all `guests` |
| `topTopics` | topics ranked by frequency (top 5; ties by name) |
| `longestEpisode` / `shortestEpisode` | by `durationSeconds` |

Hand-written fun facts are static strings on the Facts page and are not derived.
