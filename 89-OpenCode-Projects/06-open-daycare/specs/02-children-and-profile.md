# SPEC 02 — Children listing and profile (`/children`, `/children/[id]`)

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-26
> **Objective:** Implement the children listing (`/children`) and child profile (`/children/[id]`) pages, visually matching `references/screens/children.dc.html` and `references/screens/child-profile.dc.html`, reusing the staff shell from SPEC 01 without authentication or database.

## Why this spec exists

- SPEC 01 defined the staff shell and feed page. The next screens in the route mapping are children and child profile.
- Both screens are read-only with mock data. They introduce no new backend dependencies but add reusable components (`ChildCard`, `ChildTag`, `HealthNote`, `InfoCard`, `ParentRow`) that future specs (add-child, edit-child, link-parent) will consume.

## Scope

**In:**

- Children listing page at `app/(staff)/children/page.tsx`: eyebrow "MANAGEMENT" + "Children", "Add child" button → `/add-child` (404), search input with client-side filter, section divider "SUNSHINE ROOM" with dynamic count (e.g. "8 children" → "2 children" when filtering), and a 2-column grid of `<ChildCard />` components.
- Child profile page at `app/(staff)/children/[id]/page.tsx`: back link to `/children`, header with large avatar (84×84) + name + subtitle ("3 years · Sunshine Room") + outline "Edit" button (`border: 1.5px solid #ECE0D0; background: #FFFDF9`) → `/add-child` (404), allergy alert box (red background `#FBDAD6`, warning triangle icon), info card (DOB/Room/Enrolled), right column with "Daily summary" dark button (sun icon) → `/daily-summary` (404) and linked parents card with `<ParentRow />` + "Link another parent" link (dashed circle avatar with "+" icon).
- Typed mock data in `lib/mock-children.ts` (`Child`, `LinkedParent`, `ChildTag`, `mockChildren`, `mockChildProfiles`).
- Components: `ChildCard`, `ChildTag`, `HealthNote`, `InfoCard`, `InfoRow`, `ParentRow`, `SearchBar`.
- Responsive: listing collapses to 1 column below `md`; profile stacks the right column below the header on smaller screens.
- Search: `<SearchBar />` with `useState` for the query, filters `mockChildren` by name (case-insensitive).
- Reuses `<Sidebar />`, `<Nav />`, `<Avatar />`, `<MobileHeader />` from SPEC 01 without changes.

**Out of scope (for future specs):**

- Add child page (`/add-child`): the button is a link to a 404 route.
- Edit child: the "Edit" button links to `/add-child` (404).
- Daily summary page (`/daily-summary`): the button links to a 404 route.
- Link parent page (`/link-parent`): the link inside the profile links to a 404 route.
- Authentication, database, per-user caching.
- Remaining screens: notices, my-account, create-post, post-detail, photo, login.
- Official mobile design: responsive adaptation without mockup, same approach as SPEC 01.

## Route mapping

| Mockup link | Route | Status |
| --- | --- | --- |
| `children.dc.html` | `/children` | This spec |
| `child-profile.dc.html` | `/children/[id]` | This spec |
| `add-child.dc.html` | `/add-child` | 404 today |
| `daily-summary.dc.html` | `/daily-summary` | 404 today |
| `link-parent.dc.html` | `/link-parent` | 404 today |

## Data model

```ts
// lib/mock-children.ts

export type ChildTagVariant = "allergy" | "link";

export type ChildTag = {
  label: string;        // "PEANUT" | "LACTOSE" | "LINK"
  variant: ChildTagVariant;
};

export type LinkedParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;         // "Lucy Fernandez"
  initial: string;      // "L"
  avatarColor: string;  // bg color hex
  textColor: string;    // text color hex
  relation: string;     // "Mom" | "Dad"
  status: LinkedParentStatus;
  statusText: string;   // "active" | "invitation sent"
};

export type Child = {
  id: string;           // slug: "matthew-fernandez"
  name: string;         // "Matthew Fernandez"
  initial: string;      // "M"
  avatarSize: number;   // 48 (cards) | 84 (profile)
  avatarColor: string;  // bg color hex
  textColor: string;    // text color hex
  age: string;          // "3 years"
  linkedParentsCount: number; // 2
  subtitle: string;     // "3 years · 2 linked parents" (cards) | "3 years · Sunshine Room" (profile)
  tags: ChildTag[];     // [{ label: "PEANUT", variant: "allergy" }]
};

export type ChildProfile = Child & {
  room: string;         // "Sunshine"
  dob: string;          // "Mar 12, 2022"
  enrolled: string;     // "Feb 2025"
  healthNote: string;   // "Peanut allergy. Avoid tree nuts. He keeps an inhaler in his backpack."
  parents: LinkedParent[];
};

export const mockChildren: Child[] = [
  /* 8 children matching the mockup */
];

export const mockChildProfiles: Record<string, ChildProfile> = {
  "matthew-fernandez": { /* full detail matching mockup */ },
};
```

Conventions:

- No persistence: arrays and records are module constants.
- `mockChildren` has all 8 children with basic data (name, age, parents count, tags).
- `mockChildProfiles` only contains the profile for Matthew (the one with a mockup). Other IDs redirect or 404.
- Colors are hex strings matching the mockup palette.
- `id` is a slug generated from the lowercase name (e.g. "sophia-mendez").

## Implementation plan

1. **Mock data.** `lib/mock-children.ts`: types and constants with the 8 children from the mockup and Matthew's full profile. `Child.avatarSize` is `48` for cards; `ChildProfile` overrides it to `84` for the profile page. Manual: import in a throwaway component and verify no type errors. ✅ **COMPLETED**
2. **ChildTag component.** `components/child-tag.tsx`: renders a small pill badge — allergy variant (`#FBD8CC` bg, `#D9684A` text), link variant (`#F9D2DE` bg, `#C56486` text). Consumed by `ChildCard`. ✅ **COMPLETED**
3. **SearchBar component.** `components/search-bar.tsx`: client component with a magnifying glass icon (SVG) and an input. Props: `value` + `onChange`. Styling: `background: #FFFDF9`, `border: 1px solid #ECE0D0`, `border-radius: 14px`, `padding: 12px 16px`. ✅ **COMPLETED**
4. **ChildCard component.** `components/child-card.tsx`: server component rendering one `Child` — `<Avatar />` at 48×48, name (Fredoka 600 16px), subtitle (`age · N linked parents`), and either a `<ChildTag />` or a right chevron icon (`#CBB89F`). Wrapped in a `Link` to `/children/[id]`. Hover styles: `border-color: #F2A78E`, `transform: translateY(-2px)`, `transition: 0.15s`. Card styling: `background: #FFFDF9`, `border: 1px solid #ECE0D0`, `border-radius: 18px`, `padding: 16px`, `box-shadow: 0 4px 14px -12px rgba(120,90,60,.5)`. ✅ **COMPLETED**
5. **HealthNote component.** `components/health-note.tsx`: server component rendering the allergy/health alert — warning triangle SVG (white stroke) inside a 40×40 rounded square (`#F4A8A0` bg), followed by a bold title "Allergies and notes" and the note text. Container: `background: #FBDAD6`, `border-radius: 16px`, `padding: 16px 18px`, title color `#C5413A`, text color `#B25249`. ✅ **COMPLETED**
6. **InfoCard and InfoRow.** `components/info-card.tsx`: server component rendering a card with rows of label + value. Props: array of `{ label: string; value: string }`. Container: `background: #FFFDF9`, `border: 1px solid #ECE0D0`, `border-radius: 16px`. Each row: `padding: 15px 18px`, `border-bottom: 1px solid #F0E6D8` (except last). Label color `#94887B`, value `font-weight: 800` color `#3F362E`. ✅ **COMPLETED**
7. **ParentRow component.** `components/parent-row.tsx`: server component rendering one `LinkedParent` — `<Avatar />` at 40×40, name (800 weight), subtitle (`"Mom · active"` / `"Dad · invitation sent"`), and a status badge (ACTIVE: `#CFEBD8` bg / `#3E9B6C` text; PENDING: `#F7E7A6` bg / `#9A7B1E` text, `border-radius: 999px`).
8. **Children listing page.** `app/(staff)/children/page.tsx`: client component (`useState` for search query). Renders eyebrow "MANAGEMENT" + heading "Children", "Add child" button (gradient, plus icon) → `/add-child`, `<SearchBar />`, section divider (eyebrow "SUNSHINE ROOM", dynamic count from filtered results, `1px #E7DAC8` line). Grid: 2-col on desktop, 1-col below `md`. When search yields 0 results, show a "No children found" message in the grid area. Manual: `/children` shows the 8 children; typing "mat" filters to 1; clearing restores all 8.
9. **Child profile page.** `app/(staff)/children/[id]/page.tsx`: server component. Reads `params.id`, looks up `mockChildProfiles[id]`, renders a simple fallback ("Child not found") if not found. Layout: left column (flex:1, min-w 300px) with header (84×84 `<Avatar />`, name in Fredoka 28px, subtitle from `subtitle` field, outline "Edit" button) → `<HealthNote />` → `<InfoCard />` with rows DOB/Room/Enrolled. Right column (w: 300px) with dark "Daily summary" button (`background: #3F362E`, sun icon) → `/daily-summary`, linked parents card (heading "LINKED PARENTS", `<ParentRow />` per parent, then "Link another parent" link: dashed border circle + icon, text `#C5503A`). Manual: `/children/matthew-fernandez` matches the mockup.
10. **Route mapping update.** Verify that sidebar `Nav` already has `/children` item (it does from SPEC 01) and that the active state works on both `/children` and `/children/[id]`. Update `Nav` to use `pathname.startsWith("/children")` for the active match so the profile page keeps "Children" highlighted.

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass without errors.
- [ ] Loading `/children` produces no console errors or warnings.
- [ ] `/children` shows 8 child cards in a 2-column grid matching the mockup: eyebrow "MANAGEMENT", heading "Children", "Add child" button (gradient, plus icon), search input with magnifying glass icon, "SUNSHINE ROOM" divider with dynamic count.
- [ ] The 8 cards show the correct names, initials, avatar colors (48×48), ages, parent counts, and tags (PEANUT for Matthew, LACTOSE for Thomas, LINK for Valentina).
- [ ] ChildCard hover effect: `border-color: #F2A78E`, `translateY(-2px)`, smooth transition.
- [ ] The search divider count is dynamic: typing "mat" shows "1 children", clearing shows "8 children".
- [ ] Typing in the search input filters the grid in real time (case-insensitive match on name).
- [ ] When the search yields 0 results, a "No children found" message appears in the grid area.
- [ ] Clicking a child card navigates to `/children/[id]`.
- [ ] `/children/matthew-fernandez` renders the full profile matching the mockup: back link (arrow icon, "Back to Children"), large avatar (84×84) + name (Fredoka 28px) + subtitle ("3 years · Sunshine Room"), outline "Edit" button (`border: 1.5px solid #ECE0D0`, `background: #FFFDF9`), health note box (red `#FBDAD6`, warning triangle icon), info card (DOB Mar 12 2022 / Room Sunshine / Enrolled Feb 2025), "Daily summary" dark button (`#3F362E`, sun icon), linked parents card (heading "LINKED PARENTS", Lucy ACTIVE `#CFEBD8`/`#3E9B6C`, Diego PENDING `#F7E7A6`/`#9A7B1E`, subtitle texts "active"/"invitation sent"), "Link another parent" link (dashed circle + plus icon).
- [ ] `/children/[id]` with an unknown ID shows a "Child not found" fallback (not a crash).
- [ ] `Nav` highlights "Children" as active on both `/children` and `/children/[id]`.
- [ ] All future-route links (`/add-child`, `/daily-summary`, `/link-parent`) are `<Link>` components that 404 today.
- [ ] Desktop screenshot (1280×800) in `.playwright-mcp/` for `/children` matches `references/screenshots/children.png` in color, spacing, and typography.
- [ ] Desktop screenshot (1280×800) in `.playwright-mcp/` for `/children/matthew-fernandez` matches `references/screenshots/child-profile.png`.
- [ ] At 390×844: listing shows a single column with no horizontal scroll; profile stacks sections vertically.
- [ ] No new file touches authentication, cookies, sessions, or a database.

## Decisions

- **Yes:** `/children/[id]` dynamic route with slug IDs. Readable URLs and consistent with the mockup's link structure.
- **Yes:** client-side search with `useState`. The listing page must be a client component for this, but the profile page stays a server component.
- **Yes:** dynamic count in the section divider ("8 children" → "1 children"). The count reflects the number of filtered results, not the total.
- **Yes:** "No children found" empty state when search yields 0 results. Avoids a blank grid.
- **Yes:** typed `ChildTag` with `variant` discriminant. Two variants today (allergy, link); extensible for future tags without changing the model.
- **Yes:** `mockChildProfiles` as a `Record<string, ChildProfile>`. Only Matthew has a full profile (the one with a mockup). Other children's cards link to `/children/[id]` but the profile page shows a fallback for unknown IDs.
- **Yes:** reusable components (`ChildCard`, `ChildTag`, `HealthNote`, `InfoCard`, `ParentRow`). They will be consumed by future specs (add-child, edit-child).
- **Yes:** links to future 404 routes (`/add-child`, `/daily-summary`, `/link-parent`). Same pattern as SPEC 01 — buttons are real `<Link>` components, not inert.
- **Yes:** responsive adaptation without mockup. Listing: 2 cols → 1 col. Profile: side-by-side → stacked. Re-evaluated when official mobile designs exist.
- **Yes:** `Nav` matches active for any path starting with `/children`. Prevents the "Children" item from losing its active state on the profile page.
- **Yes:** hover effect on `ChildCard` (`border-color`, `translateY`, `transition`). Matches the mockup's CSS exactly.
- **No:** database or persistence. Mock data only; real data belongs to a future spec.
- **No:** add-child, edit-child, daily-summary, link-parent screens. They are future specs; their buttons are 404 links here.
- **No:** official mobile design. Adapted responsive without mockup, same as SPEC 01.

## Risks

| Risk | Mitigation |
| --- | --- |
| No mobile mockup for these screens | Adaptation: 1-column listing and stacked profile. Screenshot verification at 390×844. Re-evaluated when mockups exist. |
| `Nav` active state may not cover nested `/children/[id]` | Step 10 updates the active match to a `startsWith("/children")` check. |
| Profile page 404 fallback for unknown IDs | Step 9 handles it explicitly with a "Child not found" message; the acceptance criteria verify the behavior. |
| Search empty state visual | Step 8 defines "No children found" message; acceptance criteria verify it appears when search yields 0 results. |

## What is **not** in this spec

- Add child page (`/add-child`).
- Edit child flow.
- Daily summary page (`/daily-summary`).
- Link parent page (`/link-parent`).
- Authentication, database, per-user caching.
- Remaining screens: notices, my-account, create-post, post-detail, photo, login.
- Official mobile design (adjusted when mockups exist).

Each one of those, if it lands, goes in its own spec.
