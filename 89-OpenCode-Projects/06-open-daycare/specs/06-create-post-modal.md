# SPEC 06 — New post modal (`/` — "New post" trigger)

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-28
> **Objective:** Implement a modal dialog that opens when clicking "New post" in the sidebar or "Share a moment…" in the home feed, with recipient chips (children + Entire room), post type selector, description textarea, and photo placeholders, closing on publish without persistence.

## Why this spec exists

- The sidebar's "New post" button and the home feed's "Share a moment…" teaser both link to `/create-post` (currently 404). This spec activates them as a single modal trigger.
- It introduces a modal with multi-recipient selection and type chips, expanding the modal pattern from SPEC 05.

## Scope

**In:**

- **Modal component** (`components/create-post-modal.tsx`): client component with backdrop, centered card, close button, and form fields. Reuses the same modal pattern from SPEC 05 (`fixed inset-0 z-50 bg-black/40`, `role="dialog"`, `aria-modal="true"`, Escape + backdrop close).
- **Trigger integration:**
  - Sidebar (`components/sidebar.tsx`): convert "New post" `<Link>` to `<button>` that opens the modal.
  - Home feed (`app/(staff)/page.tsx`): convert "Share a moment…" `<Link>` to `<button>` that opens the modal.
- **TO selector (recipients):** Multi-select chips built from `mockChildren`. Each chip shows avatar (26×26, initial, bg/text colors from mock data) + child name. "Entire room" chip as last item. Behavior: "Entire room" is exclusive — selecting it deselects all children; selecting a child deselects "Entire room". Default: "Entire room" selected.
- **TYPE selector (post type):** 7 single-select pill buttons with distinct colors: Meal, Nap, Activity (default), Milestone, Mood, Photo, Announcement.
- **Description:** Textarea with placeholder "Share how today went…", `min-height: 120px`, `resize: vertical`.
- **Photos:** Two static 96×96 placeholders side by side (camera icon + "Add" dashed). Non-interactive.
- **Validation:** Publish disabled until TYPE is selected AND Description is non-empty. TO always has "Entire room" default (satisfied).
- **Publish behavior:** Reset form state and close modal. No new post appears in feed.
- **Cancel:** Button closes modal without changes.

**Out of scope (for future specs):**

- Real post creation / persistence (feed stays unchanged after publish).
- File upload (photo placeholders are static).
- Photo removal or multiple photo management.
- Post type filtering in feed.
- Per-child feed targeting (audience routing).
- Mobile mockup (responsive adaptation without design source).

## Route mapping

| Trigger location | Route | Status |
| --- | --- | --- |
| Sidebar "New post" | was `/create-post` (404) | This spec (modal) |
| Home feed "Share a moment…" | was `/create-post` (404) | This spec (modal) |

## Data model

```ts
// components/create-post-modal.tsx
type PostType = "meal" | "nap" | "activity" | "milestone" | "mood" | "photo" | "announcement";

const POST_TYPES: { id: PostType; label: string; bg: string; text: string }[] = [
  { id: "meal",         label: "Meal",        bg: "#9A7B1E",  text: "#fff" },
  { id: "nap",          label: "Nap",         bg: "#E7DCF6",  text: "#7B5FC0" },
  { id: "activity",     label: "Activity",    bg: "#2E89A6",  text: "#fff" },
  { id: "milestone",    label: "Milestone",   bg: "#CFEBD8",  text: "#3E9B6C" },
  { id: "mood",         label: "Mood",        bg: "#F9D2DE",  text: "#C56486" },
  { id: "photo",        label: "Photo",       bg: "#FBD8CC",  text: "#D9684A" },
  { id: "announcement", label: "Announcement",bg: "#CCD8F4",  text: "#4E72C8" },
];

// Local state:
// selectedChildren: string[]    (child slugs from mockChildren)
// isEntireRoom: boolean          (default: true)
// selectedType: PostType         (default: "activity")
// description: string            (default: "")
```

Conventions:

- Children list is read from `mockChildren` (imported from `@/lib/mock-children`), not hardcoded.
- No persistence: form state is discarded on close.

## Implementation plan

1. **Modal component structure.** `components/create-post-modal.tsx`: client component. Props: `isOpen: boolean`, `onClose: () => void`. Import `mockChildren` for recipient chips. Layout: fixed backdrop (`bg-black/40`, `z-50`) with centered card (`max-w-[580px]`, `bg-[#FBF4EC]`, `border-radius: 24px`, `box-shadow`). Render nothing when `isOpen` is false. Manual: modal opens/closes when `isOpen` changes.

2. **Close button.** Top-right of card: 34×34 rounded square (`bg-[#F0E6D8]`, `text-[#94887B]`, `border-radius: 10px`) with X icon. Click calls `onClose`. Manual: close button works.

3. **Header.** Three items: "Cancel" (left, `#94887B`, font-weight: 700, 15px) → calls `onClose`, "New post" (center, Fredoka 600, 18px), "Publish" (right, `#D9583C`, font-weight: 800, 15px) → calls `onClose` when enabled. Manual: header renders with all three items.

4. **TO selector.** Label "TO" (800, 12px, letter-spacing 0.7px, `#94887B`). Flex-wrap container with gap 9px. Render one chip per child from `mockChildren` + "Entire room" chip. Each chip: pill shape (`border-radius: 999px`), `border: 1.5px solid`, `padding: 6px 14px 6px 6px` (children have avatar, entire room has `padding: 6px 16px`), `font-weight: 700`, `font-size: 14px`. Selected children: `bg-[#3F362E]`, `border-[#3F362E]`, `text-white`. Unselected: `bg-[#FFFDF9]`, `border-[#ECE0D0]`, `text-[#6E6359]`. "Entire room" selected: same as selected children. Logic: clicking a child chip selects it and deselects "Entire room"; clicking "Entire room" selects it and deselects all children. Default: "Entire room" selected. Each child chip includes a 26×26 circular avatar with the child's `initial`, `avatarColor`, `textColor` from mock data. Manual: chips render correctly; clicking toggles selection; "Entire room" behavior is exclusive.

5. **TYPE selector.** Label "TYPE" (800, 12px, letter-spacing 0.7px, `#94887B`). Flex-wrap container with gap 9px. 7 pill buttons, each: `padding: 8px 16px`, `border-radius: 999px`, `border: none`, `font-weight: 800`, `font-size: 13.5px`, `cursor-pointer`. Colors from `POST_TYPES` constant. Selected state: same colors as mockup (bg + text per type). Unselected state: `bg-[#FFFDF9]`, `border: 1.5px solid #ECE0D0`, `text-[#6E6359]`. Default: "Activity" selected. Manual: clicking a type pill makes it active and deactivates others.

6. **Description field.** Label "DESCRIPTION" (800, 12px, letter-spacing 0.7px, `#94887B`). Textarea with placeholder "Share how today went…", `min-height: 120px`, `resize: vertical`, `padding: 14px 16px`, `border-radius: 14px`, `border: 1.5px solid #EADFD0`, `bg: #fff`, `font-size: 15px`, `line-height: 1.5`. Bound to `description` state. Manual: typing updates state.

7. **Photos section.** Label "PHOTOS" (800, 12px, letter-spacing 0.7px, `#94887B`). Two 96×96 placeholders side by side with gap 12px. Left: camera icon SVG in `#CBB89F`, `bg-[#F4ECE1]`, `border: 1px solid #ECE0D0`, `border-radius: 14px`. Right: dashed border (`1.5px dashed #DBCDBA`), `bg-[#F4ECE1]`, plus icon SVG in `#C5503A`, "Add" text below in 12px, `#B0A290`. Both non-interactive (no click handlers). Manual: placeholders render correctly.

8. **Publish button validation.** Compute `isPublishEnabled = selectedType !== null && description.trim().length > 0`. Apply disabled styles to "Publish" link: `opacity-50`, `cursor-not-allowed`, `pointer-events-none` when disabled. When enabled, normal styles + calls `onClose` (which resets form state). Manual: Publish is grayed out until type is selected AND description has content.

9. **Integration with sidebar and home feed.**
   - `components/sidebar.tsx`: convert "New post" `<Link href="/create-post">` to `<button onClick={() => setIsModalOpen(true)}>`. Add `useState` for `isModalOpen`. Render `<CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />`. Since Sidebar is currently a server component, convert to client component.
   - `app/(staff)/page.tsx`: convert "Share a moment…" `<Link href="/create-post">` to `<button onClick={() => setIsModalOpen(true)}>`. Add `useState` for `isModalOpen`. Render `<CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />`. Since page is currently a server component, extract content to a client component (same pattern as SPEC 05's page-content.tsx).
   Manual: clicking either trigger opens the modal.

10. **Accessibility.** Add `role="dialog"` and `aria-modal="true"` on modal container. `aria-label` on close button. Escape key closes modal via `useEffect` with keydown listener. Prevent body scroll when modal is open (`overflow: hidden` on body). Manual: Escape closes modal; body scroll prevented.

11. **Responsive.** Modal adapts on mobile (full width with padding, `max-width: 90%`). TO and TYPE chip rows wrap naturally. No horizontal scroll. Manual: modal fits on small screens.

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass without errors.
- [ ] Loading `/` produces no console errors or warnings.
- [ ] "New post" in sidebar is a button (not a link) that opens the modal on click.
- [ ] "Share a moment…" in home feed is a button (not a link) that opens the modal on click.
- [ ] Modal displays with backdrop (black/40%) and centered card (max-width: 580px, background: #FBF4EC, border-radius: 24px, box-shadow).
- [ ] Close button (X icon, top-right) closes the modal.
- [ ] Clicking backdrop closes the modal.
- [ ] Pressing Escape closes the modal.
- [ ] Header shows "Cancel" (left, #94887B), "New post" (center, Fredoka 600 18px), "Publish" (right, #D9583C).
- [ ] TO section shows one chip per child from mockChildren + "Entire room" chip.
- [ ] Each child chip shows avatar (26×26, child's initial, avatarColor, textColor) + name.
- [ ] "Entire room" is selected by default (dark bg, white text).
- [ ] Selecting a child chip deselects "Entire room" and selects the child.
- [ ] Selecting "Entire room" deselects all children.
- [ ] Multiple children can be selected simultaneously.
- [ ] TYPE section shows 7 pill buttons: Meal, Nap, Activity, Milestone, Mood, Photo, Announcement.
- [ ] "Activity" is selected by default.
- [ ] Clicking a type pill makes it active and deactivates others (single-select).
- [ ] Description textarea has placeholder "Share how today went…" and min-height: 120px.
- [ ] Photos section shows two 96×96 placeholders (camera icon + dashed "Add" button), non-interactive.
- [ ] Publish button is disabled when no type is selected or description is empty.
- [ ] Publish button becomes enabled when a type is selected AND description is non-empty.
- [ ] Clicking Publish when enabled closes the modal.
- [ ] No new post appears in the feed after Publish (no persistence).
- [ ] Modal has `role="dialog"` and `aria-modal="true"`.
- [ ] On mobile, modal adapts without horizontal scroll.
- [ ] No new file touches authentication, cookies, sessions, or database.

## Decisions

- **Yes:** modal/dialog instead of separate route. Consistent with SPEC 05 pattern; keeps feed context.
- **Yes:** both triggers (sidebar + home feed) open the same modal. Unified behavior.
- **Yes:** multi-select children with exclusive "Entire room". Matches mockup; "Entire room" is the natural default when posting to the whole class.
- **Yes:** single-select type. A post has one type; multi-select types don't make semantic sense.
- **Yes:** Activity as default type. Most common post type in a daycare context.
- **Yes:** Publish requires TYPE + DESCRIPTION. TO defaults to "Entire room" (always satisfied). Photos optional.
- **Yes:** no persistence. Publish resets form and closes modal. Consistent with specs 01-05.
- **Yes:** photo placeholders are non-interactive. No file picker or upload logic; future spec when storage exists.
- **Yes:** children list from `mockChildren`. DRY — if children are added/removed in SPEC 02's mock data, the TO chips update automatically.
- **Yes:** convert Sidebar and home feed page to client components. Needed for modal state management (same pattern as SPEC 05).
- **No:** success/error messages. Modal closes silently.
- **No:** actual file upload. Photo placeholders only.
- **No:** post appearing in feed after Publish. Would require state management or mock data mutation; future spec.

## Risks

| Risk | Mitigation |
| --- | --- |
| Converting Sidebar to client component may affect other server components | Sidebar only renders static links and mock data; no async data fetching. No impact. |
| Large number of children could overflow the TO chip row | `flex-wrap: wrap` handles this; chips flow to next line. |
| Modal width (580px) may be too wide on tablets | `max-w-[580px]` with `max-width: 90%` on small screens via responsive padding. |

## What is **not** in this spec

- Real post creation or persistence.
- File upload or photo management.
- Post appearing in feed after Publish.
- Per-child feed targeting.
- Mobile mockup (responsive adaptation only).

Each one of those, if it lands, goes in its own spec.
