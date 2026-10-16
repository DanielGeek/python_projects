# SPEC 02 — Home landing page

> **Status:** Draft
> **Depends on:** SPEC 01
> **Date:** 2026-10-16
> **Objective:** Replace the homepage at `/` with the landing page from `references/templates/home-about/home.jsx`, and move the current library to `/library`.

---

## Why this spec exists

Today `/` is the game library. The reference splits the site into a marketing landing (`Home`) and the library (`Library`). This spec adds the landing, moves the library, and updates every link that pointed at the old `/`. It also introduces the first screen that reads scores across all games, so a small cross-game scores API is added to `lib/scores.ts`.

The reference text was already translated to English in `references/templates/home-about/`. That folder is the visual and copy source for this spec.

---

## Scope

**In:**

- New landing at `/` with the 7 sections of `home.jsx`, in this order: hero, "Why Arcade Vault?", "Games available now", stats, "Live activity", pricing with FAQ, final CTA.
- The current library (hero + search + grid) moves to `/library`.
- Nav: new `Home` link, `Library` points to `/library`, both in the top bar and the mobile drawer.
- All internal links that meant "back to the library" now point to `/library`.
- Floating pixel silhouettes in the hero and the scroll "reveal" animation, as in the reference.
- "Live activity" built from real scores in localStorage: latest scores and top players of today, with an empty state.
- Hero and pricing CTAs that react to the session: signed-in users do not see "Create account".
- Cross-game scores API in `lib/scores.ts`.
- Landing CSS ported from `references/templates/home-about/styles.css` (sections `HOME PAGE`, `ACTIVITY` and `PRICING`) with `av-*` class names.
- Update `CLAUDE.md` with the new routes and components.

**Out of scope (for future specs):**

- The `About` page, its contact form, and the `About` nav link.
- The reference `Theme variants` and `GAMEPAD` CSS sections.
- Real play counters, real "thousands of plays" numbers, or a real backend for activity.
- A `prefers-reduced-motion` treatment for the new landing animations (see Decisions).
- A real pricing, payments, or account-plan system.
- Translating the landing to another language.

---

## Data model

New exports in `lib/scores.ts`. The stored shape (`ScoreEntry`) does not change.

```ts
export interface ActivityEntry extends ScoreEntry {
  gameId: string;
}

/** All saved scores of every game in GAMES, with their game id. */
export function useAllScores(): ActivityEntry[];

/** Newest first, by `date`. */
export function latestScores(all: ActivityEntry[], limit = 7): ActivityEntry[];

export interface TopPlayer {
  player: string;
  score: number;
  gameId: string;
}

/** Best single score per player among entries dated today (local time), best first. */
export function topPlayersToday(all: ActivityEntry[], now: Date, limit = 5): TopPlayer[];

/** "just now", "2 min ago", "3 h ago", "2 d ago", or a formatted date after 7 days. */
export function timeAgo(iso: string, now: Date): string;
```

Conventions:

- `useAllScores` uses `useSyncExternalStore` and the same subscription as `useScores` (`arcade-vault:scores` event plus `storage`). It returns a stable array while no list changed.
- The server snapshot is an empty array, so the server HTML shows the empty state and there is no hydration mismatch.
- The top-players bar width is `score / topScore * 100`, with a minimum of 8%.
- Static landing copy (features, stats, pricing, FAQ) lives in the components, not in `lib/`.

Route map after this spec:

| Route            | Content                          |
| ---------------- | -------------------------------- |
| `/`              | Landing (new)                    |
| `/library`       | Library (moved from `/`)         |
| `/game/[id]`     | Detail (unchanged)               |
| `/game/[id]/play`| Player (unchanged)               |
| `/login`         | Auth (unchanged)                 |
| `/hall-of-fame`  | Hall of Fame (unchanged)         |

File layout (private folder, so it creates no route):

```
app/page.tsx                 landing, composes the sections
app/library/page.tsx         hero + Library (moved)
app/library/library.tsx      moved from app/library.tsx
app/_home/reveal.tsx         client wrapper with IntersectionObserver
app/_home/hero.tsx           hero + CTAs (client, reads useSession)
app/_home/silhouettes.tsx    8 decorative SVGs
app/_home/features.tsx       "Why Arcade Vault?" + icons
app/_home/games-rail.tsx     first 6 games of GAMES
app/_home/stats.tsx          three stat blocks
app/_home/activity.tsx       latest scores + top players (client)
app/_home/pricing.tsx        plan card + FAQ (client, reads useSession)
app/_home/final-cta.tsx      closing CTA
```

---

## Implementation plan

1. **Add `/library`.** `git mv app/library.tsx app/library/library.tsx`. Create `app/library/page.tsx` with the current homepage content (hero + `Library`), with metadata `Library · Arcade Vault`. `/` is still unchanged. Manual test: `/library` looks like the old homepage.
2. **Nav and links.** In `components/ui/navbar.tsx` add `Home` (`/`, active only on `/`) and point `Library` to `/library` (active on `/library` and `/game/*`), top bar and drawer. Change the links "Back to the Vault" (detail, player, not-found), "Back to the library" (Hall of Fame), and the `router.push("/")` after sign-in or guest play in `app/login/auth-card.tsx` to `/library`. Manual test: every one of those lands on `/library`; the logo goes to `/`.
3. **Landing CSS and reveal.** Port the `HOME PAGE`, `ACTIVITY` and `PRICING` rules from the reference into `app/globals.css` with the `av-home-*` prefix, reusing existing tokens. Add `app/_home/reveal.tsx`. Manual test: nothing visible changes yet.
4. **Hero.** Create `silhouettes.tsx` and `hero.tsx`. Replace `app/page.tsx` with the landing containing only the hero. "Create account" is hidden when `useSession()` is a signed-in, non-guest user. Manual test: `/` shows the hero with floating silhouettes and both CTAs.
5. **Why section.** Create `features.tsx` with the four feature cards and their icons, wrapped in `Reveal`.
6. **Games rail.** Create `games-rail.tsx` showing `GAMES.slice(0, 6)` with `CoverArt`, each card linking to `/game/<id>`, plus the "View all games →" button to `/library`.
7. **Stats.** Create `stats.tsx` with the three static blocks from the reference.
8. **Scores API.** Add `useAllScores`, `latestScores`, `topPlayersToday` and `timeAgo` to `lib/scores.ts`. Manual test: run the pure functions in Node with a stub `localStorage`, as done for `lib/credits.ts`.
9. **Activity.** Create `activity.tsx` with the latest-scores ticker and the top-players list from the real data. When there are no scores, each card shows `No scores yet. Be the first to play!`.
10. **Pricing.** Create `pricing.tsx` with the plan card and the three FAQ items. The "Start free →" button goes to `/login`, and becomes "Play now →" to `/library` for a signed-in user.
11. **Final CTA.** Create `final-cta.tsx` with the closing section and its button to `/library`.
12. **Docs.** Update `CLAUDE.md`: route table, `app/_home/`, and the new scores functions.

---

## Acceptance criteria

- [ ] `npm run lint` and `npm run build` finish without errors.
- [ ] `/` renders the 7 sections in this order: hero, "Why Arcade Vault?", "Games available now", stats, "Live activity", pricing, final CTA.
- [ ] `/` does not contain the game grid or the search bar.
- [ ] `/library` shows the hero, the search bar, the category chips and the 8-game grid exactly as the old `/` did.
- [ ] The nav shows `Home`, `Library`, `Hall of Fame` and no `About` link, in the top bar and in the drawer.
- [ ] `Home` is highlighted only on `/`. `Library` is highlighted on `/library` and on `/game/*`.
- [ ] "Back to the Vault" on the detail page, the player, and the not-found page navigates to `/library`.
- [ ] "Back to the library" on the Hall of Fame navigates to `/library`.
- [ ] After signing in or choosing "Play as guest", the user lands on `/library`.
- [ ] All visible landing text is in English, and no Spanish text remains on `/`.
- [ ] The hero shows 8 floating silhouettes and the title lines `THE CLASSIC`, `ARCADE IS`, `BACK`.
- [ ] Each section below the hero starts hidden and becomes visible when it scrolls into view.
- [ ] "Games available now" shows the first 6 games of `GAMES`, and each card opens `/game/<id>`.
- [ ] The "Create account" button is hidden for a signed-in non-guest user and visible for guests and anonymous users.
- [ ] For a signed-in user, the pricing button reads "Play now →" and goes to `/library`. Otherwise it reads "Start free →" and goes to `/login`.
- [ ] With no saved scores, both "Live activity" cards show `No scores yet. Be the first to play!`.
- [ ] After saving a score in any game, it appears first in "Latest scores" with the game name and `just now`.
- [ ] "Top players · today" lists at most 5 players, best first, one row per player, using their best score of today only.
- [ ] A score saved with a date before today is shown in "Latest scores" but not in "Top players · today".
- [ ] The landing has no horizontal scroll at 375 px width.
- [ ] The previous pages (`/library`, `/game/drop`, `/login`, `/hall-of-fame`) still render without console errors beyond the known Suspense warning.

---

## Decisions

- **Yes:** landing at `/`, library at `/library`. It matches the reference nav (`Inicio` / `Biblioteca`) and makes `/` the real homepage. **No:** landing at `/home` or library at `/games`.
- **Yes:** translate the landing to English. It follows `CLAUDE.md` and the rest of the UI. The translation already lives in `references/templates/home-about/`.
- **Yes:** "Live activity" uses real scores from localStorage with an empty state. It is consistent with SPEC 01, which dropped fake scores. **No:** static mock or mixed mock, because they would show players that do not exist.
- **Yes:** "Top players · today" is each player's best single score of today. Scores of different games are not comparable, so a sum was discarded as a figure that appears nowhere else.
- **Yes:** keep `Pricing` and the three stat blocks exactly as in the reference, including "12+ games" and "thousands of plays". This was an explicit user decision. Those claims are marketing copy, not measured data.
- **Yes:** "Games available now" shows the first 6 catalog games, as in the reference. Three of them are "Coming soon". This was an explicit user decision despite the wording.
- **Yes:** hide "Create account" for signed-in users and turn "Start free" into "Play now". **No:** showing both always, because it points a signed-in user to the login form.
- **Yes:** reveal and floating silhouettes exactly as in the reference, with no `prefers-reduced-motion` handling. This was an explicit user decision. The rest of the app does respect it, so this is a known inconsistency.
- **Yes:** the `About` page is a separate spec. The contact form has no backend and needs its own decisions.
- **Yes:** the landing components live in `app/_home/`, a private folder, so they are not routes and stay out of `components/ui/`, which holds shared primitives.
- **Yes:** after sign-in the user lands on `/library`, as before this spec. **No:** landing on `/`, which would change the existing flow.
- **No:** a SPEC 01 rewrite. Its acceptance criteria that mention the library at `/` are superseded by this spec's route table.

---

## Risks

| Risk                                                                                         | Mitigation                                                                                                      |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hidden `reveal` sections stay invisible if JavaScript fails or `IntersectionObserver` is missing | `Reveal` shows the content when `IntersectionObserver` is undefined. Content is still in the server HTML.        |
| A missed link to `/` leaves a user on the landing when they expected the library              | Step 2 lists every link. A search for `href="/"` and `push("/")` is part of its manual test.                    |
| Animations ignore `prefers-reduced-motion`                                                   | Accepted by the user. Recorded as a known gap for a later spec.                                                 |
| "Latest scores" only sees saved scores, and each game keeps the top 50                       | Accepted. A low recent score that did not make a game's top 50 never appears. A real backend fixes it.          |
| "Games available now" lists unplayable games                                                 | Accepted by the user. Cards open the detail page, which already shows "Coming soon to the vault".               |
| Relative times such as "2 min ago" go stale while the page stays open                        | They are computed at render. The list refreshes when a score is saved. A timer is out of scope.                 |

---

## What is **not** in this spec

- The `About` page, its contact form, and the `About` nav link.
- Real play counters, real activity from a server, or measured stats.
- Reduced-motion support for the landing animations.
- Real pricing, payments, or plans.
- The reference `Theme variants` and `GAMEPAD` styles.
- Any new playable game.

Each one of those, if it lands, goes in its own spec.
