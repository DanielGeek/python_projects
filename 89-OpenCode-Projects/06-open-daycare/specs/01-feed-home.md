# SPEC 01 — Staff feed as home (`/`)

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-11-26
> **Objective:** Implement `references/screens/feed.dc.html` as the home page `/`, visually identical to the mockup on desktop and responsive on mobile via a hamburger drawer, without authentication or database.

## Why this spec exists

- The scaffold is still the default template; this spec replaces it with the product's first real screen.
- The references show two audiences (staff and family). The staff shell is defined here so upcoming specs only add pages to the group.
- With no auth and no DB, all content is mock data; real data and per-user caching belong to future specs.

## Scope

**In:**

- Staff shell in `app/(staff)/layout.tsx`: sticky 248px `<Sidebar />` (desktop ≥1024px) + `<main>` with its own scroll; below `lg`, a `<MobileHeader />` with an overlay drawer reusing the same `<Sidebar />`.
- Page `/` (`app/(staff)/page.tsx`): eyebrow "DAYCARE · SUNSHINE ROOM", "Hey, Carol", "12 children · Tuesday, Jun 17", "Share a moment…" teaser → `/create-post`, "POSTED TODAY" divider, and the 3 mockup posts.
- Typed mock data in `lib/mock-feed.ts` (`PostType`, `FeedPost`, `mockFeedPosts`).
- Fredoka and Nunito self-hosted via `next/font/google` in `app/layout.tsx`.
- Design tokens in `app/globals.css` (Tailwind 4 `@theme`); `prefers-color-scheme: dark` is removed.
- Basic accessibility: `aria-expanded`/`aria-controls` on the hamburger, close via Escape and backdrop, `aria-label` on icon-only controls.
- Links to future routes that 404 today (see route mapping).
- Verification with Playwright screenshots stored in `.playwright-mcp/` (desktop 1280×800, mobile 390×844).

**Out of scope (for future specs):**

- Authentication: real login, sessions, `proxy.ts`, DAL.
- Database: content lives in mock data.
- Remaining screens: children, notices, my-account, create-post, post-detail, photo, login.
- Real interactivity: likes, comments, editing, sign out. Counters and buttons stay static.
- Official mobile design: no mobile mockup exists; the drawer is our own adaptation, not the source of truth.

## Route mapping

| Mockup link | Route | Status |
| --- | --- | --- |
| `index.dc.html` · `feed.dc.html` | `/` | This spec |
| `create-post.dc.html` | `/create-post` | 404 today |
| `children.dc.html` | `/children` | 404 today |
| `notices.dc.html` | `/notices` | 404 today |
| `my-account.dc.html` | `/my-account` | 404 today |
| `post-detail.dc.html` | `/post-detail` | 404 today |
| `photo.dc.html` | `/photo` | 404 today |
| `login.dc.html` | `/login` | 404 today |

## Data model

```ts
// lib/mock-feed.ts
export type PostType = "milestone" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  type: PostType;
  authorName: string;           // "Matthew" | "General announcement"
  avatarInitial: string | null; // "M"; null renders the megaphone icon
  postedAt: string;             // "14:20"
  postedBy: string;             // "posted by you"
  audience: string;             // "To: Matthew's family" | "To: entire room"
  body: string;
  photoLabel?: string;          // "Photo · painting with tempera"
  reactions: number;            // 3 | 5 | 8
  comments: number;             // 1 | 2 | 0
};

export const mockFeedPosts: FeedPost[] = [/* the 3 mockup posts */];
```

Conventions:

- No persistence: the array is a module constant; nothing is saved between sessions.
- `postedAt` and "Tuesday, Jun 17" are display text, not real dates.
- Per-type styles (avatar/badge colors, icon) are constants in `components/post-card.tsx`, not data.

## Implementation plan

1. **Fonts.** `app/layout.tsx`: `Fredoka` (400, 500, 600, 700) and `Nunito` (400, 500, 600, 700, 800 + italic 400) from `next/font/google` with `--font-fredoka` and `--font-nunito` variables; `metadata` with title "OpenDayCare". Manual: run `npm run dev`; the default page already loads the new fonts.
2. **Tokens.** `app/globals.css`: `@theme` with the mockup palette (background `#F6ECDF`, surface `#FFFDF9`, border `#ECE0D0`, text `#3F362E`, muted `#A89A8B`/`#94887B`, accents `#D9583C`/`#EE8164`/`#F4977E`), `--font-sans` → Nunito, `body` base styles, custom scrollbar (thumb `#E4D6C4`), and removal of the `prefers-color-scheme: dark` block. Manual: cream background on `/`.
3. **Mock data.** `lib/mock-feed.ts`: types and `mockFeedPosts` with the literal content of the 3 posts (14:20 milestone, 09:40 activity with `photoLabel`, 07:50 announcement).
4. **Avatar.** `components/avatar.tsx`: reusable circular avatar — Fredoka initial or icon, size and colors per variant. Consumed by sidebar, teaser, and posts.
5. **Nav.** `components/nav.tsx`: client component marking the active item with `usePathname()`. Items: Feed `/`, Children `/children`, Notices `/notices`, My account `/my-account`.
6. **Sidebar.** `components/sidebar.tsx`: server component with logo → `/`, "New post" → `/create-post`, `<Nav />`, and the "Carol Gimenez · Teacher · Sunshine" card with sign out → `/login`. Root: `hidden lg:flex`, sticky, 248px.
7. **Mobile header.** `components/mobile-header.tsx`: client component (`lg:hidden`) with a hamburger button (`aria-expanded`, `aria-controls`) opening an overlay drawer; `<Sidebar />` arrives as `children` from the layout; closes via backdrop or Escape.
8. **Post card.** `components/post-card.tsx`: server component rendering one `FeedPost`: avatar, per-type badge, audience, body, photo placeholder when `photoLabel` exists → `/photo`, and footer (static heart + reactions, comments → `/post-detail`, "Edit" → `/create-post`).
9. **Integration.** Create `app/(staff)/layout.tsx` (shell) and `app/(staff)/page.tsx` (max-w 760px column with heading, teaser, divider, and `mockFeedPosts` → `<PostCard />`), removing `app/page.tsx` in the same step because both routes resolve `/`. Manual: `/` renders the full feed; compare against the mockup on desktop and mobile.

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass without errors.
- [ ] Loading `/` produces no console errors or warnings.
- [ ] On desktop (≥1024px) `/` replicates the mockup: sticky 248px sidebar with `#FFFDF9` background, general `#F6ECDF` background, "New post" button, "Feed" active, and the "Carol Gimenez · Teacher · Sunshine" card.
- [ ] The 3 posts appear in order (14:20, 09:40, 07:50) with MILESTONE/ACTIVITY/ANNOUNCEMENT badges, correct audiences, and counters 3/1, 5/2, 8/0.
- [ ] The activity post shows the dashed placeholder "Photo · painting with tempera" linking to `/photo`.
- [x] Fredoka and Nunito load self-hosted via `next/font/google`; there is no `<link>` to `fonts.googleapis.com`.
- [ ] Desktop screenshot (1280×800) in `.playwright-mcp/` shows no perceptible differences in color, spacing, or typography against `references/screenshots/feed.png`.
- [ ] At 390×844 there is no horizontal scroll; the hamburger opens the drawer with the full sidebar and closes via backdrop or Escape.
- [ ] The hamburger exposes `aria-expanded`/`aria-controls` and icon-only controls have `aria-label`.
- [ ] Shell and post links match the route mapping; every future route 404s today.
- [ ] No new or modified file touches authentication, cookies, sessions, or a database, and none uses `'use cache: private'` (there is no per-user data).

## Decisions

- **Yes:** `(staff)` route group with its own layout. References show staff and family audiences; children/notices/my-account will inherit the shell without touching `/` again.
- **Yes:** active item via `usePathname()` in `Nav`. Removes the manual `active` prop from the previous version.
- **Yes:** shared `<Avatar />`. Without it, the avatar markup would be duplicated three times.
- **Yes:** typed mock data in `lib/mock-feed.ts`. Separates content from presentation and eases the future DB migration.
- **Yes:** `next/font/google`. Self-hosted and without layout shift, with the same visual result as the mockup's `<link>`.
- **Yes:** Tailwind with arbitrary values. Pixel-perfect fidelity within the project's stack.
- **Yes:** removing `prefers-color-scheme: dark`. The mockup is light-only.
- **Yes:** hamburger drawer below 1024px (user's decision). Reuses the exact `<Sidebar />`; minimal invented UI given no mobile mockup exists.
- **No:** bottom nav and sidebar rail. Discarded during the question phase.
- **No:** stubs for future routes. Discarded during the question phase.
- **No:** likes, comments, editing, or sign-out interactivity. No backend; they stay static.

## Risks

| Risk | Mitigation |
| --- | --- |
| No mobile mockup; the drawer is our own interpretation | Reuses `<Sidebar />` without redesign; mobile screenshot in verification; reevaluated once an official design exists. |
| Next 16 breaks known patterns (warning in `AGENTS.md`) | `/spec-impl` reads the relevant `node_modules/next/dist/docs/` (fonts, Link, layouts) before writing code. |
| The Tailwind conversion may introduce subtle differences (shadows, gradients) | Mandatory screenshot comparison against `feed.png` before closing. |

## What is **not** in this spec

- Authentication (real login, sessions, `proxy.ts`, DAL).
- Database.
- Remaining screens: children, notices, my-account, create-post, post-detail, photo, login.
- Real likes, comments, editing, or sign-out interactivity.
- Official mobile design (adjusted once a mockup exists).
