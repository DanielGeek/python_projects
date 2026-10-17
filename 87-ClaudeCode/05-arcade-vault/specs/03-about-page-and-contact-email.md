# SPEC 03 — About page and contact email

> **Status:** Approved
> **Depends on:** SPEC 02
> **Date:** 2026-10-16
> **Objective:** Add the `/about` page exactly as in `references/templates/home-about/about.jsx`, with a contact form that sends a real email to the team through Resend.

---

## Why this spec exists

SPEC 02 left the `About` page, its contact form and the `About` nav link out of scope because the form "has no backend and needs its own decisions". This spec makes those decisions. The page itself is a port of the reference. The new part is the first server-side code in the project: a Route Handler at `POST /api/contact` that validates the message and sends it with the Resend SDK.

The reference text was already translated to English in `references/templates/home-about/`. That folder is the visual and copy source for this spec.

---

## Scope

**In:**

- New route `/about` with two parts of `about.jsx`: the About hero (kicker, title, mission, three highlights) and the Contact section (intro with three tips, form), joined by the pixel divider.
- Contact form with `NAME`, `EMAIL` and `MESSAGE` fields, the `▶  SEND MESSAGE` button, the shake animation on invalid input, and the `VAULT-OS // TERMINAL` success screen with `SEND ANOTHER MESSAGE`.
- Real email delivery through a Route Handler, `POST /api/contact`, using the `resend` npm package. The form calls it with `fetch`.
- Server-side validation with length limits, and a honeypot field against bots.
- An inline `[ERR]` terminal-style error when sending fails or the API key is missing. The form keeps what the visitor typed.
- Nav: new `About` link in the top bar and the mobile drawer.
- Scroll "reveal" on the divider and the contact section, reusing `app/_home/reveal.tsx`.
- About CSS ported from `references/templates/home-about/styles.css` (section `ABOUT PAGE`) with `av-about-*` class names.
- Environment variables `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, plus a committed `.env.template`.
- Update `CLAUDE.md` with the new route, files and environment variables.

**Out of scope (for future specs):**

- A confirmation email to the visitor.
- Rate limiting, CAPTCHA, or any anti-abuse beyond validation and the honeypot.
- Storing messages in a database or an admin inbox.
- A verified sending domain. Development uses the Resend sandbox sender.
- HTML-formatted or React Email templates. The email is plain text.
- Attachments, file uploads, or a subject field.
- Translating the page to another language.
- The reference `Theme variants` and `GAMEPAD` CSS sections.

---

## Data model

This feature persists no data. It adds one API contract, a shared validation function and three environment variables.

```ts
// lib/contact.ts — pure functions, no browser or server APIs, used by the form and the route
export const LIMITS = { name: 80, email: 254, message: 2000 } as const;

export type ContactField = "name" | "email" | "message";
export interface ContactInput { name: string; email: string; message: string }

/** Trims the values and returns per-field errors; an empty object means valid. */
export function validateContact(input: ContactInput): Partial<Record<ContactField, string>>;
```

API contract of `POST /api/contact`:

```ts
// Request: Content-Type: application/json
interface ContactRequest extends ContactInput {
  website?: string;                                      // honeypot, must be empty
}

// Responses
// 200 { ok: true }
// 400 { ok: false; error: string; fieldErrors?: Partial<Record<ContactField, string>> }  invalid JSON or invalid fields
// 500 { ok: false; error: string }                       RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL missing
// 502 { ok: false; error: string }                       Resend returned an error
```

Client state in `app/about/contact-form.tsx` (local `useState`, not exported):

```ts
type FormStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; message: string };                  // shown after "[ERR]"
```

Validation rules (run by `validateContact` in the browser for the shake and again in the route, trimmed values):

| Field     | Rule                                             |
| --------- | ------------------------------------------------ |
| `name`    | required, 1 to 80 characters                     |
| `email`   | required, valid format, at most 254 characters   |
| `message` | required, 1 to 2000 characters                   |
| `website` | must be empty. If filled, answer `200 { ok: true }` without calling Resend |

Environment variables (server only, never `NEXT_PUBLIC_`):

```
RESEND_API_KEY=            # provided by the user later
CONTACT_TO_EMAIL=salomons.cripto@gmail.com
CONTACT_FROM_EMAIL=Arcade Vault <onboarding@resend.dev>
```

Email sent to Resend:

- `from`: `CONTACT_FROM_EMAIL`.
- `to`: `CONTACT_TO_EMAIL`.
- `replyTo`: the visitor's email, so replying in the inbox answers the visitor.
- `subject`: `[Arcade Vault] Message from <name>`, with line breaks removed from the name.
- `text`: name, email, then the message. Plain text only, so the message cannot inject HTML.

Conventions:

- The Resend SDK returns `{ data, error }` and does not throw on API errors. Any `error`, or a missing `RESEND_API_KEY`, becomes `status: "error"`.
- The API key is read inside the `POST` function, never at module load, so a missing key does not break the build or the page render.
- The route is public, so it trusts nothing from the browser: it re-validates every field and ignores any unknown property in the body.
- The route runs on the Node.js runtime (`export const runtime = "nodejs"`) and is never cached.
- Real error details are logged with `console.error` on the server. The visitor sees a generic message.
- Static page copy (mission, highlights, tips) lives in the components, not in `lib/`.

Route map after this spec:

| Route                | Content                           |
| -------------------- | --------------------------------- |
| `/about`             | About + Contact (new)             |
| `POST /api/contact`  | Sends the contact email (new)     |
| all other routes     | Unchanged                         |

File layout:

```
app/about/page.tsx              composes the page, metadata "About · Arcade Vault"
app/about/highlights.tsx        three highlights + HighlightIcon (HEART, BROWSER, PLANT)
app/about/divider.tsx           pixel divider (decorative)
app/about/contact-form.tsx      client form, fetch to /api/contact, shake, terminal success and error
app/api/contact/route.ts        POST handler: honeypot, validation, env check, Resend call
lib/contact.ts                  LIMITS and validateContact, shared by form and route
.env.template                    the three variable names, no secrets
```

---

## Implementation plan

1. **Dependency and env.** `npm install resend`. Fill `.env.template` (already created by the user) with the three variables and add an exception in `.gitignore` (`!.env.template`) so it can be committed. Manual test: `npm run build` still passes and `git status` shows `.env.template` as trackable.
2. **Route skeleton and nav.** Create `app/about/page.tsx` with the metadata `About · Arcade Vault` and a placeholder heading. Add `About` to the links in `components/ui/navbar.tsx` (top bar and drawer), active on `/about`. Manual test: the link opens `/about` and is highlighted only there.
3. **About CSS.** Port the `ABOUT PAGE` rules from the reference into `app/globals.css` with the `av-about-*` prefix, reusing existing tokens. Port the `shake` keyframes only if `globals.css` does not already have an equivalent. Manual test: nothing visible changes yet.
4. **About hero.** Create `highlights.tsx` and add the kicker `▸ ABOUT`, the title `ABOUT ARCADE VAULT`, the mission paragraph and the three highlights to the page. Manual test: `/about` matches the reference hero at desktop and 375 px.
5. **Divider.** Create `divider.tsx` and add it to the page inside `Reveal`. Manual test: the 24 pixels blink with staggered delays.
6. **Contact section (static).** Create `contact-form.tsx` with the intro, the three tips and the form fields. The submit button only prevents default. Wrap the section in `Reveal`. Manual test: layout matches the reference, two columns above 900 px and one below.
7. **Validation and API route.** Create `lib/contact.ts` with `LIMITS` and `validateContact`. Create `app/api/contact/route.ts` with `POST`: parse JSON, honeypot check, validation, env check, Resend call, and the status codes from the data model. Manual test with `curl`: invalid JSON and invalid fields return 400, a missing `RESEND_API_KEY` returns 500, and a filled `website` returns 200 without sending.
8. **Wire the form.** In `contact-form.tsx`, run `validateContact` on submit (shake and field errors, no request), then `fetch("/api/contact", { method: "POST" })` with a JSON body. Add the hidden honeypot input, the `SENDING…` disabled button, the server `fieldErrors`, and the inline `[ERR]` line. Manual test: empty submit shakes without a network request; typed values survive an error.
9. **Success screen.** Render the `VAULT-OS // TERMINAL` block when the status is `sent`, with `THANK YOU, <NAME>.` and the `SEND ANOTHER MESSAGE` button that resets the form. Manual test: with a real `RESEND_API_KEY` in `.env`, a submitted message arrives at `salomons.cripto@gmail.com` and the success screen shows.
10. **Docs.** Update `CLAUDE.md`: the `/about` route, the `app/about/` files, `POST /api/contact`, `lib/contact.ts` and the three environment variables.

---

## Acceptance criteria

- [ ] `npm run lint` and `npm run build` finish without errors, with no `RESEND_API_KEY` set.
- [ ] `/about` renders in this order: About hero, pixel divider, Contact section.
- [ ] The hero shows `▸ ABOUT`, `ABOUT ARCADE VAULT`, the mission paragraph and exactly three highlights: `MADE WITH ❤️ FOR PLAYERS`, `HTML GAMES — RUN IN ANY BROWSER`, `A CONSTANTLY GROWING PROJECT`.
- [ ] The Contact section shows `▸ CONTACT`, `CONTACT US` and the tips `REPLY IN 24-48H`, `SUGGESTIONS WELCOME`, `NO SPAM, EVER`.
- [ ] All visible text on `/about` is in English.
- [ ] The nav shows `About` in the top bar and the drawer, highlighted only on `/about`.
- [ ] The divider and the contact section start hidden and become visible when they scroll into view.
- [ ] Submitting with any empty field makes the form shake and shows an error for each empty field, without sending a request to `/api/contact`.
- [ ] `POST /api/contact` answers 400 with `fieldErrors` for a name over 80 characters, an invalid email, or a message over 2000 characters, and 400 for a body that is not valid JSON.
- [ ] `POST /api/contact` with valid data and a valid key answers `200 { "ok": true }`. With no `RESEND_API_KEY` it answers 500, and when Resend returns an error it answers 502.
- [ ] `GET /api/contact` answers 405.
- [ ] The button reads `SENDING…` and is disabled while the request is in flight.
- [ ] With a valid `RESEND_API_KEY`, submitting valid data delivers one email to `CONTACT_TO_EMAIL`, with the visitor's email as Reply-To and the subject `[Arcade Vault] Message from <name>`.
- [ ] After a successful send, the terminal screen shows `MESSAGE RECEIVED. WE WILL REPLY SOON. THANK YOU, <NAME IN UPPERCASE>.`
- [ ] `SEND ANOTHER MESSAGE` returns to an empty form.
- [ ] Without `RESEND_API_KEY`, or when Resend returns an error, the form shows an `[ERR]` line, keeps the typed values and allows a retry. No stack trace or key reaches the browser.
- [ ] A submission with the honeypot `website` field filled shows the success screen and sends no email.
- [ ] `RESEND_API_KEY` does not appear in the client bundle or in any file tracked by git.
- [ ] `.env.template` is tracked and lists the three variable names with no secret values.
- [ ] `/about` has no horizontal scroll at 375 px width.
- [ ] The previous pages (`/`, `/library`, `/game/drop`, `/login`, `/hall-of-fame`) still render without new console errors.

---

## Decisions

- **Yes:** a Route Handler `POST /api/contact` with the `resend` SDK. This was an explicit user decision. It gives a stable HTTP contract that can be tested with `curl` and reused by another client, and it keeps the key on the server. **No:** a Server Action, which was the first proposal and was replaced. **No:** raw `fetch` to the Resend REST API, which adds manual error handling for no gain.
- **Yes:** one validation function in `lib/contact.ts`, used by the form for the shake and by the route as the authority. It avoids two copies of the limits drifting apart. The browser check is only a convenience.
- **Yes:** distinct status codes (400, 500, 502) with a generic `error` text. The client only needs the message, and the real cause goes to the server log.
- **Yes:** the recipient `salomons.cripto@gmail.com` goes in `CONTACT_TO_EMAIL`, not in the code. This was an explicit user decision.
- **Yes:** the API key is supplied later by the user and lives only in `.env`. The spec and the repo contain no key.
- **Yes:** `CONTACT_FROM_EMAIL` is read only from the environment, with no default in the code. This was an explicit user decision. A missing value answers 500, like the other two variables. `.env.template` and `.env` use `Arcade Vault <onboarding@resend.dev>`. It needs no domain setup, and the Resend sandbox only delivers to the address that owns the Resend account. Using the owner's Gmail as the recipient makes that work. A verified domain is a later change of one variable.
- **Yes:** `replyTo` is the visitor's email. The `from` stays fixed because sending as an arbitrary visitor address would fail SPF/DKIM checks and be marked as spam.
- **Yes:** server validation plus a honeypot. It stops lazy bots with no dependency. **No:** rate limiting in memory, because on serverless the memory is not shared between instances and gives false confidence. **No:** CAPTCHA, which adds a third-party script to a retro-styled page.
- **Yes:** a honeypot hit answers `sent`, so the bot gets no signal to adapt.
- **Yes:** on failure, show an inline error and keep the typed text. **No:** faking success, because the visitor would believe a message arrived when it did not. **No:** a confirmation copy to the visitor, which doubles the quota and requires a verified domain to deliver.
- **Yes:** plain-text email. Messages from visitors are untrusted, and plain text removes any HTML injection risk.
- **Yes:** strip line breaks from the name before building the subject, to avoid header injection.
- **Yes:** the page is a faithful port of the reference, including copy and the shake and terminal effects. This was an explicit user decision.
- **Yes:** reuse `Reveal` from `app/_home/` instead of copying it. It is a small client wrapper with no landing-specific logic.
- **Yes:** `About` goes in the nav now. SPEC 02 removed it only because the page did not exist.
- **Yes:** add `!.env.template` to `.gitignore`, which currently ignores every `.env*` file. **No:** documenting the variables only in `CLAUDE.md`, because a template file is the standard way to find them.

---

## Risks

| Risk                                                                                   | Mitigation                                                                                                      |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| The Resend sandbox sender only delivers to the account owner's email                   | `CONTACT_TO_EMAIL` is the owner's Gmail. A different recipient requires a verified domain and a new `CONTACT_FROM_EMAIL`. |
| The API key is not set yet, so the form shows an error                                 | Expected. The error path is an acceptance criterion and the build does not need the key.                        |
| A bot floods the form and burns the Resend quota                                       | Honeypot and length limits reduce it. Rate limiting and CAPTCHA are recorded as a future spec.                  |
| Gmail may filter `onboarding@resend.dev` mail into spam                                | Accepted for development. Move to a verified domain before production.                                          |
| The key leaks into the client bundle                                                   | Only read in `app/api/contact/route.ts`, never prefixed `NEXT_PUBLIC_`. An acceptance criterion checks the bundle.            |
| A Next 16 Route Handler API differs from older documentation                           | Read `node_modules/next/dist/docs/` for Route Handlers before step 7, as `AGENTS.md` requires.                   |
| Anyone can call the public endpoint directly, skipping the form and its honeypot       | The route re-validates everything and caps lengths. Rate limiting is a future spec (see Scope).                  |
| Reveal sections stay hidden if JavaScript fails                                        | `Reveal` already shows content when `IntersectionObserver` is missing, and the content is in the server HTML.   |

---

## What is **not** in this spec

- A confirmation email to the visitor.
- Rate limiting, CAPTCHA, or a message database.
- A verified sending domain or HTML email templates.
- Attachments or a subject field.
- The reference `Theme variants` and `GAMEPAD` styles.

Each one of those, if it lands, goes in its own spec.
