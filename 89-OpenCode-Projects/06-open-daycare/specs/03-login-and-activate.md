# SPEC 03 — Login and account activation (`/login`, `/activate-account`)

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-27
> **Objective:** Implement login and account activation screens, visually matching `references/screens/login.dc.html` and `references/screens/activate-account.dc.html`, without real authentication or database, reusing fonts and design tokens from SPEC 01.

## Why this spec exists

- SPEC 01 and 02 implemented the staff shell and children pages. The route mapping already references `/login` as a 404.
- These screens are public (no shell required) and introduce the first form-based interactions in the app (input fields, checkbox state).
- With no auth and no DB, all data is mock; real authentication belongs to a future spec.

## Scope

**In:**

- **Login page** (`app/login/page.tsx`): split layout with hero on the left (coral gradient, OpenDayCare branding) and form on the right.
- **Activate account page** (`app/activate-account/page.tsx`): centered layout with invitation card and form.
- **No Staff/Family selector** on login (only one role: staff).
- **Forgot password** → `/forgot-password` (404 today).
- **Activate account link** → `/activate-account`.
- **Sign in link** → `/login`.
- **Mandatory checkbox** for account activation (button disabled until checked).
- **Post-login redirect** → `/` (staff feed).
- **Post-activation redirect** → `/login` (natural flow: activate → login).
- **Fixed mock data** on activate-account (code "7K4P9", email "lucy.fernandez@gmail.com", child "Matthew · Sunshine Room").
- **Root layout** without staff shell (public screens).
- **Fredoka and Nunito fonts** reused from root layout (SPEC 01).
- **Design tokens** reused from `globals.css` (SPEC 01).
- **Responsive**: hero hides on mobile, form adapts.

**Out of scope (for future specs):**

- Real authentication (login, sessions, cookies, `proxy.ts`, DAL).
- Database (users, hashed passwords, invitation tokens).
- Credential validation (no "invalid credentials" error messages).
- Password recovery (`/forgot-password` is a 404).
- Full onboarding flow (sending invitations by email, generating codes).
- Family feed (does not exist yet).
- Role selector (Staff/Family).
- Form data persistence.

## Route mapping

| Mockup link | Route | Status |
| --- | --- | --- |
| `login.dc.html` | `/login` | This spec |
| `activate-account.dc.html` | `/activate-account` | This spec |
| `feed.dc.html` | `/` | SPEC 01 |
| `forgot-password.dc.html` | `/forgot-password` | 404 today |

## Data model

```ts
// app/activate-account/page.tsx
const mockInvitation = {
  childName: "Matthew",
  roomName: "Sunshine Room",
  initial: "M",
  avatarColor: "#A9D9E8",
  textColor: "#1F7A93",
  invitationCode: "7K4P9",
  email: "lucy.fernandez@gmail.com",
};
```

Conventions:

- No persistence: form data is local state only (React `useState`).
- Invitation data is a mock constant (does not come from query params or backend).
- Child colors and data are fixed, matching the mockup.

## Implementation plan

1. **Login page structure.** `app/login/page.tsx`: split layout with 2-column grid (`1.05fr 1fr`). Left column: hero with gradient (`linear-gradient(155deg, #F6A98E 0%, #F2937A 45%, #EC7E62 100%)`), OpenDayCare logo (sun icon + Fredoka 600 21px text), title "Every child's day, shared with their family." (Fredoka 42px), subtitle, footer "🌿 Sunshine Room Daycare". Right column: centered form with "Sign in" (Fredoka 30px), email field, password field, "Forgot your password?" link, "Sign in" button (coral gradient), "Activate your account" link. Manual: `/login` shows the split layout.

2. **Hero decorative circles.** Add two absolute decorative circles in the hero (top-right 420×420, bottom-left 300×300, `background: rgba(255,255,255,.12)` and `.10`). Matches the mockup.

3. **Login form fields.** Email input (style: `border: 1.5px solid #EADFD0`, `border-radius: 14px`, `padding: 14px 16px`, `background: #fff`, `font-size: 15px`). Upper labels (font-weight: 700, 12px, color `#94887B`, letter-spacing: 0.7px). "Forgot your password?" link aligned right (color `#C5503A`, font-weight: 700, 13.5px). "Sign in" button (full width, padding 15px, border-radius 15px, gradient `linear-gradient(180deg, #F4977E, #EE8164)`, font-weight: 800, 16px, box-shadow). Manual: fields render with correct styles.

4. **Login links.** "Sign in" → `<Link href="/">` (redirects to feed). "Forgot your password?" → `<Link href="/forgot-password">` (404 today). "Activate your account" → `<Link href="/activate-account">` (matches the mockup). Manual: links work correctly.

5. **Activate account page structure.** `app/activate-account/page.tsx`: centered layout with `max-width: 440px`. Logo (sun icon in gradient, 58×58, border-radius: 18px, box-shadow). Title "Welcome to OpenDayCare" (Fredoka 32px). Subtitle "You've been invited to follow your child's day. Create a password to activate the account." (15.5px, color `#94887B`). Manual: `/activate-account` shows the centered layout.

6. **Invitation card.** Card with flex, gap 14px, white background, border `#EADFD0`, border-radius: 16px, padding: 14px 16px. Circular avatar (44×44, bg `#A9D9E8`, initial "M" Fredoka 600 19px, color `#1F7A93`). Text: "You've been invited to follow" (13px, color `#94887B`), "Matthew · Sunshine Room" (Fredoka 600, 17px). Manual: card renders correctly.

7. **Activate account form fields.** Invitation code field (fixed value "7K4P9", letter-spacing: 3px, font-weight: 700, Fredoka, 18px). Email field (fixed value "lucy.fernandez@gmail.com", 15px). Create password field (type password, placeholder, 15px). All with the same border-radius 14px, padding 14px 16px, border `#EADFD0`, white background. Manual: fields render with mock values.

8. **Authorization checkbox.** Label with flex, gap 12px, background `#FBF1D6`, border-radius: 14px, padding: 14px 16px. Custom checkbox (24×24, border-radius: 8px, bg `#5FB97E` when checked, white check SVG). Text "I authorize the daycare to take and share photos of my child within the app." (14px, color `#8A7234`, line-height: 1.45). Client component with `useState` for checkbox state. Manual: checkbox checks/unchecks.

9. **Activate button disabled state.** "Activate my account" button (same style as "Sign in"). When checkbox is unchecked: `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`. When checked: normal styles. `<Link href="/login">` only when enabled. Manual: button is disabled until checkbox is checked.

10. **Activate account links.** "Sign in" link (color `#C5503A`, font-weight: 800, 14.5px) → `<Link href="/login">`. Manual: link works correctly.

11. **Responsive design.** Login: on mobile (`< 768px`), hero hides (`hidden md:block`), form takes full width. Activate account: adapts naturally (already centered). Padding: 40px on desktop, 20px on mobile. Manual: on mobile no split layout, only the form.

12. **Background color.** Both pages have `background: #FBF4EC` (mockup cream color). Applied to root container. Manual: cream background is visible.

## Acceptance criteria

- [x] `npm run build` and `npm run lint` pass without errors.
- [x] Loading `/login` produces no console errors or warnings.
- [x] `/login` shows the split layout: hero on the left (coral gradient, logo, title, subtitle, footer) and form on the right.
- [x] Hero has the two absolute decorative circles (420×420 top-right, 300×300 bottom-left).
- [x] Form shows "Sign in" (Fredoka 30px), email field, password field, "Forgot your password?" link aligned right, "Sign in" button (coral gradient), "Activate your account" link.
- [x] "Sign in" button redirects to `/`.
- [x] "Forgot your password?" redirects to `/forgot-password` (404 today).
- [x] "Activate your account" redirects to `/activate-account`.
- [x] Loading `/activate-account` produces no console errors or warnings.
- [x] `/activate-account` shows the centered layout with logo, title, subtitle, invitation card, form, checkbox, and button.
- [x] Invitation card shows circular avatar "M" (bg `#A9D9E8`, color `#1F7A93`), "You've been invited to follow", "Matthew · Sunshine Room".
- [x] Fields show mock values: invitation code "7K4P9", email "lucy.fernandez@gmail.com".
- [x] Authorization checkbox is unchecked by default.
- [x] "Activate my account" button is disabled (`opacity: 0.5`, `cursor: not-allowed`) when checkbox is unchecked.
- [x] When checkbox is checked, button enables and redirects to `/login` on click.
- [x] "Sign in" link redirects to `/login`.
- [x] On mobile (`< 768px`), `/login` does not show the hero (only the form), no horizontal scroll.
- [x] On mobile, `/activate-account` adapts without horizontal scroll.
- [x] Both pages have `background: #FBF4EC`.
- [x] Fredoka and Nunito load correctly from root layout (SPEC 01).
- [x] No new files touch authentication, cookies, sessions, or database.

## Decisions

- **Yes:** no Staff/Family selector. User confirmed it is not needed; only one role: staff. Simplifies the flow.
- **Yes:** fixed mock data on activate-account. Consistent with the mock data pattern from specs 01 and 02.
- **Yes:** mandatory checkbox. UX best practice for informed consent.
- **Yes:** post-login redirect → `/`. Without real auth, always redirects to staff feed.
- **Yes:** post-activation redirect → `/login`. Natural flow: activate account → login.
- **Yes:** root layout without staff shell. These are public screens, no sidebar or nav required.
- **Yes:** links to future 404 routes (`/forgot-password`). Same pattern as specs 01 and 02.
- **Yes:** responsive without mobile mockup. Hero hides on mobile, form adapts. Re-evaluated when official mobile mockups exist.
- **No:** real authentication. No backend, no sessions, no cookies. Consistent with the current project approach.
- **No:** credential validation. No error messages. Button always redirects.
- **No:** dynamic invitation data (query params, backend). Fixed mock for now.
- **No:** role selector (Staff/Family). User confirmed it is not needed.

## Risks

| Risk | Mitigation |
| --- | --- |
| No mobile mockup for these screens | Adaptation: hero hides on mobile, form adapts. Screenshot verification at 390×844. Re-evaluated when mobile mockups exist. |
| Tailwind conversion may introduce subtle differences (gradients, shadows) | Mandatory screenshot comparison against HTML mockups before closing. |
| Mandatory checkbox may be confusing if not obvious | Disabled button (`opacity: 0.5`) clearly indicates action is required. |

## What is **not** in this spec

- Real authentication (login, sessions, cookies, `proxy.ts`, DAL).
- Database (users, passwords, tokens).
- Credential validation.
- Password recovery (`/forgot-password` is a 404).
- Full onboarding flow (sending invitations, generating codes).
- Family feed.
- Role selector (Staff/Family).
- Official mobile design (adjusted when mockups exist).

Each one of those, if it lands, goes in its own spec.
