# SPEC 04 — Add child (`/add-child`)

> **Status:** Completed
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-27
> **Objective:** Implement the add child form page at `/add-child`, visually matching `references/screens/add-child.dc.html`, with the staff shell, client-side validation that enables Save only when Full Name and Date of Birth are filled, and redirect to `/children` on Save without persistence.

## Why this spec exists

- SPEC 02's children listing already links "Add child" to `/add-child` (currently 404). This spec activates that route.
- It introduces the first form in the staff shell with client-side validation and state-dependent button behavior.

## Scope

**In:**

- **Add child page** at `app/(staff)/add-child/page.tsx`: centered card form with "Cancel" and "Save" header links, and fields for Full Name, Date of Birth, Room, Allergies (tags), and Medical Notes.
- **Staff shell:** reuses the existing `(staff)` layout with sidebar, nav, and mobile header from SPEC 01.
- **Room selector:** functional dropdown with three options: "Sunshine", "Rainbow", "Stars". Default value is "Sunshine". Client-side state management.
- **Save button validation:** disabled until Full Name and Date of Birth are both non-empty. Room has "Sunshine" as default value, so it is always satisfied.
- **Save behavior:** `<Link href="/children">` when enabled; no persistence, just navigation.
- **Cancel:** `<Link href="/children">` always enabled.
- **Client component:** `useState` for Full Name and Date of Birth to drive Save button enabled/disabled state, plus `useState` for selected Room.
- **Back link from child profile:** the "Edit" button in SPEC 02 already points to `/add-child`; after this spec it no longer 404s but opens the add form (not pre-filled, create-only).

**Out of scope (for future specs):**

- Edit child (pre-filled form with existing data). Could be a separate route `/children/[id]/edit` or query param.
- Real persistence (database).
- Allergy tag parsing from comma-separated input.
- Validation error messages (no inline errors shown to user).
- Integration with the children listing (no new child appears after save).

## Route mapping

| Mockup link | Route | Status |
| --- | --- | --- |
| `add-child.dc.html` | `/add-child` | This spec |
| `children.dc.html` | `/children` | SPEC 02 |

## Data model

This feature introduces no new data structures. Form fields are local state only.

```ts
// app/(staff)/add-child/page.tsx
// Local state only:
// fullName: string (required)
// dateOfBirth: string (required)
// selectedRoom: string (default: "Sunshine")
// allergies: string (optional, no validation)
// medicalNotes: string (optional, no validation)

// Available rooms (constant):
const ROOMS = ["Sunshine", "Rainbow", "Stars"];
```

Conventions:

- No persistence: form data is discarded on navigation.
- `selectedRoom` defaults to "Sunshine" but can be changed via dropdown.
- Available rooms are hardcoded in a constant array.

## Implementation plan

1. **Add child page.** `app/(staff)/add-child/page.tsx`: client component. State: `fullName`, `dateOfBirth`, `selectedRoom` (default "Sunshine"). Layout: centered card (`max-width: 520px`, `background: #FBF4EC`, `border: 1px solid #ECE0D0`, `border-radius: 24px`, `box-shadow: 0 20px 50px -24px rgba(63,54,46,.35)`). Manual: `/add-child` renders the form card inside the staff shell.

2. **Header bar.** Top section with `border-bottom: 1px solid #ECE0D0`, padding `20px 26px`. Three items: "Cancel" link (color `#94887B`, font-weight: 700, 15px) → `/children`, "Add child" title (Fredoka 600, 18px, color `#3F362E`), "Save" link (color `#D9583C`, font-weight: 800, 15px) → `/children` when enabled. Manual: header renders with all three items.

3. **Full Name field.** Label "FULL NAME" (font-weight: 800, 12px, letter-spacing: 0.7px, color `#94887B`), input with placeholder "E.g. Martina Lopez" (padding `13px 16px`, border-radius: 14px, border `1.5px solid #EADFD0`, bg `#fff`, font-size: 15px). Bound to `fullName` state via `onChange`. Manual: typing updates state.

4. **Date of Birth and Room row.** Two-column flex with `gap: 14px`. Left: Date of Birth input with placeholder "mm/dd/yyyy", same styling, bound to `dateOfBirth` state via `onChange`. Right: Room dropdown with three options ("Sunshine", "Rainbow", "Stars"), default "Sunshine". Implement as a button showing the selected room with a chevron-down SVG icon (16×16, stroke `#B0A290`), clicking it toggles a dropdown menu with the three options. When an option is clicked, update `selectedRoom` state and close the dropdown. Style: button has `padding: 13px 16px`, `border-radius: 14px`, `border: 1.5px solid #EADFD0`, `background: #fff`, `font-size: 15px`, `font-weight: 700`, `color: #3F362E`. Dropdown menu: `background: #fff`, `border: 1.5px solid #EADFD0`, `border-radius: 14px`, `box-shadow: 0 10px 20px -8px rgba(63,54,46,.2)`, each option has `padding: 12px 16px`, hover state `background: #FBF4EC`. Click outside closes the dropdown. Manual: clicking the room field opens the dropdown, selecting an option updates the display and closes the dropdown.

5. **Allergies field.** Label "ALLERGIES (TAGS)", input with placeholder "E.g. Peanuts, Lactose", same styling. No state binding needed (optional, no validation). Manual: field renders and accepts input.

6. **Medical Notes field.** Label "MEDICAL NOTES", textarea with placeholder "Instructions, medication, contacts…" (min-height: 90px, resize: vertical, line-height: 1.5), same border styling. No state binding needed. Manual: field renders and accepts multi-line input.

7. **Save button validation logic.** Compute `isSaveEnabled = fullName.trim().length > 0 && dateOfBirth.trim().length > 0`. Apply conditional styles to "Save" link: when disabled, `opacity-50`, `cursor-not-allowed`, `pointer-events-none`. When enabled, normal styles. Use `<Link href="/children">` wrapped in a `<span>` or conditional to prevent navigation when disabled. Manual: Save is grayed out initially; filling both required fields enables it. Note: `selectedRoom` is always valid (defaults to "Sunshine"), so it does not affect the Save button state.

8. **Responsive.** Card adapts padding on smaller screens. Form fields remain readable and usable at mobile widths. Manual: no horizontal scroll on mobile.

## Acceptance criteria

- [x] `npm run build` and `npm run lint` pass without errors.
- [x] Loading `/add-child` produces no console errors or warnings.
- [x] `/add-child` is rendered inside the staff shell (sidebar visible on desktop ≥1024px).
- [x] The form card is centered with `max-width: 520px`, `background: #FBF4EC`, `border: 1px solid #ECE0D0`, `border-radius: 24px`, `box-shadow: 0 20px 50px -24px rgba(63,54,46,.35)`.
- [x] Header shows "Cancel" (left, `#94887B`), "Add child" (center, Fredoka 600 18px), "Save" (right, `#D9583C`), separated by `border-bottom: 1px solid #ECE0D0`.
- [x] "Cancel" links to `/children`.
- [x] Full Name field has label "FULL NAME", placeholder "E.g. Martina Lopez", and updates `fullName` state on input.
- [x] Date of Birth field has label "DATE OF BIRTH", placeholder "mm/dd/yyyy", and updates `dateOfBirth` state on input.
- [x] Room field displays the selected room (default "Sunshine") with a chevron-down SVG icon.
- [x] Room field is clickable and opens a dropdown menu with three options: "Sunshine", "Rainbow", "Stars".
- [x] Clicking a room option updates the displayed room and closes the dropdown.
- [x] Clicking outside the dropdown closes it without changing the selection.
- [x] Date of Birth and Room are side by side with `gap: 14px`.
- [x] Allergies field has label "ALLERGIES (TAGS)", placeholder "E.g. Peanuts, Lactose".
- [x] Medical Notes field has label "MEDICAL NOTES", textarea with placeholder "Instructions, medication, contacts…", `min-height: 90px`, `resize: vertical`.
- [x] "Save" is disabled (`opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`) when Full Name or Date of Birth is empty.
- [x] "Save" becomes enabled when both Full Name and Date of Birth are non-empty.
- [x] Clicking "Save" when enabled navigates to `/children`.
- [x] No new child appears in `/children` after Save (no persistence).
- [x] On mobile, no horizontal scroll; card and fields adapt to available width.
- [x] No new file touches authentication, cookies, sessions, or database.

## Decisions

- **Yes:** staff shell with sidebar. Consistent with being inside the `(staff)` route group and `/children` section.
- **Yes:** client component for form. Needed for `useState` to drive Save button validation and room selection.
- **Yes:** Save requires Full Name + Date of Birth. Room is always pre-satisfied (has default "Sunshine"). Allergies and Medical Notes are optional.
- **Yes:** no persistence. Coherent with the project's mock-data approach. Save just navigates.
- **Yes:** create-only. Edit flow is a separate future spec.
- **Yes:** functional Room dropdown with three options (Sunshine, Rainbow, Stars). User requested multiple rooms with a working dropdown.
- **Yes:** no inline validation messages. The disabled Save button provides sufficient feedback.
- **No:** allergy tag parsing. The input accepts free text; parsing belongs to a future spec.
- **No:** sidebar active state change. The add-child route is `/add-child`, not `/children/*`. `Nav` uses `startsWith("/children")`, so "Children" will NOT be highlighted on this page. Acceptable since it is a creation form, not a children listing view.

## What is **not** in this spec

- Edit child (pre-filled form).
- Real persistence (database, API).
- Allergy tag parsing and display as pills.
- Validation error messages.
- Child appearing in listing after Save.
- Mobile mockup (responsive adaptation without design source).

Each one of those, if it lands, goes in its own spec.
