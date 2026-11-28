# SPEC 05 — Link parent modal

> **Status:** Implemented
> **Depends on:** SPEC 02
> **Date:** 2026-11-28
> **Objective:** Implement a modal dialog that opens when clicking "Link another parent" on the child profile page, with a form to invite a parent (name, email, relationship), display a fixed invitation code, and close the modal on send without persistence.

## Why this spec exists

- SPEC 02's child profile already has a "Link another parent" link pointing to `/link-parent` (currently 404). This spec activates that interaction as a modal instead of a separate route.
- It introduces the first modal/dialog pattern in the app, reusable for future features.
- The modal displays a fixed mock invitation code and form, consistent with the project's mock-data approach.

## Scope

**In:**

- **Modal component** (`components/link-parent-modal.tsx`): client component with backdrop, centered card, close button, and form fields.
- **Child profile integration** (`app/(staff)/children/[id]/page.tsx`): convert the "Link another parent" link from `<Link>` to a button that opens the modal.
- **Form fields:** Parent's Name (text input), Email (email input), Relationship (3 pill buttons: Mom, Dad, Guardian with active state).
- **Invitation code display:** Fixed code "7K4P9" with "Expires in 7 days" text, styled with dashed border and yellow background.
- **Info banner:** Blue info box explaining the parent will receive an email with an activation code.
- **Validation:** Send button disabled until Name and Email are both non-empty. Relationship defaults to "Mom".
- **Send behavior:** Close modal on click, no persistence, no changes to the profile page.
- **Close behavior:** Click close button (X icon), click backdrop, or press Escape key.
- **Accessibility:** Focus trap within modal, aria-labels, keyboard navigation.

**Out of scope (for future specs):**

- Real email sending or invitation code generation.
- Adding the parent to the profile's parent list after sending.
- Success/error messages after sending.
- Resend or cancel invitation functionality.
- Mobile-specific modal adaptations (responsive design included, but no separate mobile design).

## Data model

This feature introduces no new data structures. Form fields are local state only.

```ts
// components/link-parent-modal.tsx
// Local state:
// parentName: string (required)
// email: string (required)
// relationship: "Mom" | "Dad" | "Guardian" (default: "Mom")

// Fixed mock data:
const INVITATION_CODE = "7K4P9";
```

Conventions:

- No persistence: form data is discarded when modal closes.
- Invitation code is a hardcoded constant.
- Relationship is typed union for type safety.

## Implementation plan

1. **Modal component structure.** `components/link-parent-modal.tsx`: client component. Props: `isOpen: boolean`, `onClose: () => void`, `childName: string` (for the "to Matthew Fernandez" subtitle). Layout: fixed backdrop (`fixed inset-0 bg-black/40 z-50`) with centered card (`max-w-[480px]`, `bg-[#FBF4EC]`, `border-radius: 24px`, `box-shadow`). Render nothing when `isOpen` is false. Manual: modal opens/closes when `isOpen` changes.

2. **Close button.** Top-right corner of card: 34×34 rounded square (`bg-[#F0E6D8]`, `text-[#94887B]`, `border-radius: 10px`) with X icon. Click calls `onClose`. Manual: close button works.

3. **Header.** Two lines: "Link parent" (Fredoka 600, 18px, `#3F362E`) and `to {childName}` (13px, `#A89A8B`). Manual: header renders correctly.

4. **Info banner.** Blue box (`bg-[#E3ECFB]`, `border-radius: 14px`, `padding: 13px 16px`, `gap: 11px`) with info icon (20×20, stroke `#4E72C8`) and text "We'll email them a code to activate their account. They'll only see {childName}'s feed." (13.5px, `#3F5694`). Manual: banner displays.

5. **Parent's Name field.** Label "PARENT'S NAME" (800, 12px, letter-spacing 0.7px, `#94887B`), input with placeholder "E.g. Diego Fernandez" (padding: 13px 16px, border-radius: 14px, border: 1.5px solid `#EADFD0`, bg: `#fff`, font-size: 15px). Bound to `parentName` state. Manual: typing updates state.

6. **Email field.** Label "EMAIL", input type email with placeholder "email@example.com", same styling. Bound to `email` state. Manual: typing updates state.

7. **Relationship selector.** Label "RELATIONSHIP" (800, 12px, letter-spacing 0.7px, `#94887B`). Three pill buttons (flex, gap: 9px): "Mom", "Dad", "Guardian". Each button: padding: 11px, border-radius: 999px, border: 1.5px solid `#ECE0D0` (inactive) or `#9FB8EC` (active), background: `#FFFDF9` (inactive) or `#CCD8F4` (active), color: `#6E6359` (inactive) or `#4E72C8` (active), font-weight: 800, font-size: 14px. Default: "Mom" active. Click updates `relationship` state. Manual: clicking a pill updates active state.

8. **Invitation code display.** Box (`bg-[#FBF1D6]`, border: 1.5px dashed `#E6D08A`, border-radius: 16px, padding: 18px, text-align: center). Label "INVITATION CODE" (800, 12px, letter-spacing 0.7px, `#A88526`), code "7K4P9" (Fredoka 600, 34px, letter-spacing: 7px, `#8A7234`), "Expires in 7 days" (13px, `#A88526`). Manual: code displays correctly.

9. **Send button.** Full-width button with gradient (`linear-gradient(180deg, #F4977E, #EE8164)`), padding: 14px, border-radius: 14px, font-weight: 800, font-size: 15.5px, box-shadow. Send icon (SVG paper plane). Disabled state: `opacity-50`, `cursor-not-allowed`, `pointer-events-none` when Name or Email empty. Enabled: click calls `onClose`. Manual: button disabled when fields empty, closes modal when clicked.

10. **Integration with child profile.** `app/(staff)/children/[id]/page.tsx`: convert "Link another parent" from `<Link href="/link-parent">` to `<button onClick={() => setIsModalOpen(true)}>`. Add `useState` for `isModalOpen`. Convert page to client component (needed for modal state). Render `<LinkParentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} childName={profile.name} />`. Manual: clicking "Link another parent" opens modal.

11. **Accessibility.** Add `role="dialog"` and `aria-modal="true"` on modal container. `aria-label` on close button. Escape key closes modal via `useEffect` with keydown listener. Manual: Escape closes modal.

12. **Responsive.** Modal adapts on mobile (max-width: 90% on small screens, padding adjustments). No horizontal scroll. Manual: modal fits on small screens.

## Acceptance criteria

- [x] `npm run build` and `npm run lint` pass without errors.
- [x] Loading `/children/[id]` produces no console errors or warnings.
- [x] "Link another parent" is a button (not a link) that opens the modal on click.
- [x] Modal displays with backdrop (black/40%) and centered card (max-width: 480px, background: #FBF4EC, border-radius: 24px, box-shadow).
- [x] Close button (X icon, top-right) closes the modal.
- [x] Clicking backdrop closes the modal.
- [x] Pressing Escape closes the modal.
- [x] Header shows "Link parent" (Fredoka 600, 18px) and "to [child name]" (13px, #A89A8B).
- [x] Info banner displays with blue background, info icon, and explanatory text referencing the child's name.
- [x] Parent's Name field has label "PARENT'S NAME", placeholder "E.g. Diego Fernandez", and updates state on input.
- [x] Email field has label "EMAIL", placeholder "email@example.com", and updates state on input.
- [x] Relationship selector shows three pill buttons: Mom, Dad, Guardian.
- [x] Mom is selected by default (active state: #CCD8F4 bg, #4E72C8 text).
- [x] Clicking a relationship pill updates the active state.
- [x] Invitation code displays "7K4P9" with dashed border, yellow background, and "Expires in 7 days" text.
- [x] Send button is disabled (`opacity: 0.5`, `cursor: not-allowed`) when Name or Email is empty.
- [x] Send button becomes enabled when both Name and Email are non-empty.
- [x] Clicking Send when enabled closes the modal.
- [x] No new parent appears in the profile's parent list after Send (no persistence).
- [x] Modal has `role="dialog"` and `aria-modal="true"`.
- [x] Escape key closes the modal.
- [x] On mobile, modal adapts without horizontal scroll.
- [x] No new file touches authentication, cookies, sessions, or database.

## Decisions

- **Yes:** modal/dialog instead of separate route. Better UX for a quick action, keeps context on the profile page.
- **Yes:** fixed invitation code "7K4P9". Coherent with the project's mock-data approach (like activate-account spec).
- **Yes:** no persistence. Send just closes the modal. No parent added to list. Consistent with specs 01-04.
- **Yes:** Name + Email required for Send. Relationship defaults to "Mom" (always satisfied).
- **Yes:** pill buttons for relationship selector. Visual and intuitive, matches the mockup.
- **Yes:** Escape key + backdrop click to close. Standard UX patterns for modals.
- **Yes:** role="dialog" and aria-modal="true" for accessibility.
- **Yes:** convert child profile page to client component. Needed for modal state management.
- **No:** focus trap with Tab key. Simplified: Escape + backdrop close is sufficient for MVP. Full focus trap deferred to future spec if needed.
- **No:** email sending or code generation. Future spec when backend exists.
- **No:** adding parent to profile after Send. Would require state management or persistence; future spec.
- **No:** success/error messages. Modal closes silently; user can re-open if needed.

## Risks

| Risk | Mitigation |
| --- | --- |
| Converting child profile to client component may affect existing behavior | Profile page only uses mock data lookup; converting to client component has no impact on data or routing. |
| Modal may cause body scroll issues | Use `overflow: hidden` on body via `useEffect` when modal is open. |

## What is **not** in this spec

- Real email sending or invitation code generation.
- Adding the parent to the profile's parent list after Send.
- Success/error messages after Send.
- Resend or cancel invitation functionality.
- Mobile-specific modal design (responsive adaptation only).
- Focus trap with Tab key navigation.

Each one of those, if it lands, goes in its own spec.
