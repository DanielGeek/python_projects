# SPEC 17 — Security hardening

> **Status:** Approved
> **Depends on:** SPEC 06, SPEC 08, SPEC 15
> **Date:** 2026-10-25
> **Objective:** Apply the basic security checklist of `references/security/security-checklist.md` (security headers, Supabase Auth limits, a locked-down `rls_auto_enable()`, an RLS guard) and add a `proxy.ts` that protects the player and a new `/profile` page.

---

## Why this spec exists

`references/security/security-checklist.md` lists five basic measures and a Supabase advisor report with five security warnings. Some are already done (RLS on `games`, `scores` and `profiles`; password length 8 to 72 in `lib/auth.ts`), some live only in the Supabase dashboard, and some are code.

One item of the checklist cannot be applied as written. `X-Frame-Options: DENY` would stop the player page from loading, because `/game/[id]/play` embeds every game in a same-origin iframe (`/games/<id>/index.html`). This spec uses `SAMEORIGIN` instead.

The spec also adds route protection with `proxy.ts` (Next 16 name for `middleware.ts`, see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Guests live only in localStorage, so the server cannot see them. The proxy therefore accepts either a Supabase session or a guest cookie. The guest cookie is written by the browser, so it is a UX gate and not a security boundary: what protects data is RLS, not the proxy.

---

## Scope

**In:**

- `lib/security-headers.ts` (new): the list of security headers, with a test on its values.
- `next.config.ts`: a `headers()` function that sends the list on every route.
- Migration `supabase/migrations/<version>_lock_rls_auto_enable.sql`, applied with `apply_migration`, that revokes `execute` on `public.rls_auto_enable()` from `public`, `anon` and `authenticated`.
- A test that rebuilds the schema from `supabase/migrations/` and fails when a table in `public` has no `enable row level security` (in `lib/leaderboard.test.ts` or a new `lib/rls.test.ts`).
- A one-time RLS check with `execute_sql` on `pg_tables` and `pg_policies`.
- Manual Supabase dashboard steps: minimum password length 8, password requirements "Lowercase, uppercase letters, digits and symbols (recommended)". The sign-up and sign-in rate limit per IP stays at the Supabase default (see Decisions).
- `lib/auth.ts`: `validateSignUp` also requires at least one lowercase letter, one uppercase letter, one digit and one symbol, so the form shows the error before Supabase rejects the password as weak. `app/login/auth-card.tsx` shows the rule as a hint under the sign-up password field. `lib/auth.test.ts` covers the new rule. `validateSignIn` does not change, so old accounts can still sign in.
- `proxy.ts` (new, project root): exports `proxy` and a `config.matcher` of `["/game/:id/play", "/profile"]`. It refreshes and validates the Supabase session and applies the access rules below.
- `lib/supabase/proxy.ts` (new): `updateSession(request)` builds a server client over the request cookies, calls `getClaims()` and returns the response (with refreshed cookies) and whether an account is signed in.
- `lib/route-guard.ts` (new): pure `decideAccess({ pathname, account, guest })` that returns `allow` or a redirect path, plus `GUEST_COOKIE`. `lib/route-guard.test.ts` covers it.
- `lib/safe-next.ts` (new): pure `safeNextPath(value)` that accepts only a same-origin relative path and defaults to `/library`. SPEC 16 reuses it instead of writing its own.
- `lib/session.ts`: `playAsGuest` sets the guest cookie, sign-out and sign-in of an account remove it, and reading an existing guest from localStorage sets it again (guests created before this spec).
- `app/login/auth-card.tsx` and `app/login/page.tsx`: read `?next=`, and after sign-in or "Play as guest" go to `safeNextPath(next)` instead of always `/library`.
- `app/profile/page.tsx` and a client component (new): a minimal page with the username, the email and a sign-out button. It is for accounts only.
- `components/ui/navbar.tsx`: a "Profile" link, only for an account.
- Update `CLAUDE.md` and tick `references/security/security-checklist.md`.

**Out of scope (for future specs):**

- Leaked password protection (HaveIBeenPwned). It needs the Supabase Pro plan. It stays open in the checklist until the project upgrades; then it is one switch in the dashboard.
- `Content-Security-Policy` with script rules. The games use inline scripts and Next injects its own, so it needs nonces and a full pass over the five games.
- Changing `public.username_available(name text)`. It is `SECURITY DEFINER` and executable by `anon` and `authenticated` on purpose: the sign-up form needs it. Its two advisor warnings stay and are documented.
- A rate limit on the `username_available` RPC or on `POST /api/contact`.
- Captcha, MFA, service role key.
- A signed guest cookie. The guest cookie stays a plain client-written flag.
- Protecting `/library`, `/game/[id]`, `/hall-of-fame`, `/about` or `/api/*`. They stay public.
- Profile features beyond showing the username and email and signing out: editing the username or email, changing the password, deleting the account.
- Moving the guest or the credits to the server.
- Forcing existing accounts to change a password that does not meet the new rule.
- Fixing advisor warnings that are not in the checklist file.

---

## Data model

No new tables or columns. This spec adds one list of headers, one migration, one cookie and one set of access rules.

```ts
// Sent for source "/(.*)" in next.config.ts headers()
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

`Content-Security-Policy` carries only `frame-ancestors 'self'`. It is the modern twin of `X-Frame-Options` and adds no script rules.

Migration, described (not final SQL):

```sql
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
```

Route protection:

```ts
// lib/route-guard.ts
export const GUEST_COOKIE = "arcade-vault-guest"; // value "1", Path=/, SameSite=Lax, 1 year, not httpOnly

type Access = { allow: true } | { allow: false; redirect: string };
// decideAccess({ pathname, account, guest }): Access
//   /game/<id>/play  -> allow when account or guest, else redirect "/login?next=<pathname>"
//   /profile         -> allow when account, else redirect "/login?next=/profile" (a guest does not pass)
//   any other path   -> allow
```

`proxy.ts` matcher: `["/game/:id/play", "/profile"]`. Nothing else runs the proxy: the games under `/games/*`, `/_next/*`, `/api/*`, `/auth/*` and static files never reach it.

Dashboard values:

```text
Authentication > Sign In / Providers > Email   minimum password length = 8
                                               password requirements = Lowercase, uppercase letters, digits and symbols (recommended)
Authentication > Rate Limits                   sign-ups and sign-ins per IP, kept at the default: 30 requests per 5 minutes (360 per hour)
```

---

## Implementation plan

1. Create `lib/security-headers.ts` with the `securityHeaders` list above and `lib/security-headers.test.ts` that checks the exact keys and values (`SAMEORIGIN`, not `DENY`; `frame-ancestors 'self'`). Manual test: `npm test`.
2. In `next.config.ts` add `headers: async () => [{ source: "/(.*)", headers: securityHeaders }]`. Keep the rest of the config as is. Manual test: run `npm run dev`, `curl -I http://localhost:3000/` shows the six headers, and `/game/asteroids/play` still loads the game in its iframe.
3. Check that the headers also arrive on `/games/asteroids/index.html` and on `/api/health/supabase`. Fix the `source` pattern if one route is missing.
4. Inspect `public.rls_auto_enable()` with `execute_sql` (its definition and what uses it). Write and apply the migration that revokes `execute`, check the version with `list_migrations`, and save the file in `supabase/migrations/` with that version. Manual test: `get_advisors` (security) no longer lists `rls_auto_enable`.
5. Add the RLS guard test: read `supabase/migrations/*.sql`, collect every `create table public.<name>`, and fail when one has no matching `alter table public.<name> enable row level security`. Manual test: `npm test`.
6. Run the one-time RLS check with `execute_sql`: every table in schema `public` has `rowsecurity = true`, and `games`, `scores` and `profiles` each have at least one policy.
7. Update `validateSignUp` in `lib/auth.ts` with the composition rule (lowercase, uppercase, digit, symbol) and add the hint under the sign-up password field of `app/login/auth-card.tsx`. Add cases to `lib/auth.test.ts`. Manual test: `npm test`, then try a sign-up with `password1` and see the error.
8. Do the dashboard steps: set the minimum password length to 8, the password requirements to "Lowercase, uppercase letters, digits and symbols (recommended)" and leave the sign-up and sign-in rate limit per IP at the Supabase default (30 requests per 5 minutes; the field only accepts a value per 5 minutes, see Decisions).
9. Manual test of the limits: send a sign-up with a 7-character password, and another with 8 lowercase letters only, straight to the Supabase Auth API with the publishable key and see both rejected; repeat failed sign-ins (wrong password, so no email is sent) from one IP until the API answers `429` at the default limit of 30 per 5 minutes.
10. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` and the proxy guide, then create `lib/safe-next.ts` with `safeNextPath` and its test: reject `//evil.example`, `https://evil.example`, `/\evil` and an empty value; accept `/login/reset` and `/game/asteroids/play`; default `/library`. Manual test: `npm test`.
11. Create `lib/route-guard.ts` (`GUEST_COOKIE`, `decideAccess`) and `lib/route-guard.test.ts`: cover the four cases (visitor, guest, account, public path) for `/game/<id>/play` and `/profile`. Manual test: `npm test`.
12. Create `lib/supabase/proxy.ts` (`updateSession`) and `proxy.ts` with the matcher `["/game/:id/play", "/profile"]`. Call `getClaims()`, never `getSession()`, to decide `account`. Read the guest flag from `request.cookies`, call `decideAccess`, and redirect with `NextResponse.redirect` carrying the refreshed cookies. Manual test: with no session and no cookie, `curl -I http://localhost:3000/game/asteroids/play` answers a redirect to `/login?next=%2Fgame%2Fasteroids%2Fplay`.
13. Make the guest cookie follow the guest in `lib/session.ts`: set it in `playAsGuest` and when an existing guest is read from localStorage, remove it on sign-out and when an account signs in. Add cases to the guest tests of `lib/session.test.ts`. Manual test: choose "Play as guest" and see the cookie in the browser, then reach `/game/asteroids/play`.
14. In `app/login/auth-card.tsx` and `app/login/page.tsx` read `?next=` and navigate to `safeNextPath(next)` after sign-in and after "Play as guest". Manual test: open `/game/asteroids/play` as a visitor, sign in, and land back on the player.
15. Create `app/profile/page.tsx` and its client component (username, email, sign-out) and add the "Profile" link for accounts in `components/ui/navbar.tsx`. The page also shows a message and a link to `/login` when there is no account, so it does not depend on the proxy alone. Manual test: signed in, `/profile` shows the username; as a guest it redirects to `/login?next=/profile`.
16. Update `CLAUDE.md` (headers, the proxy and the guest cookie, `safeNextPath`, `/profile`, the password rule, the migration, the guard test, the accepted advisor warnings) and tick `references/security/security-checklist.md`, leaving leaked password protection open with a note.

---

## Acceptance criteria

- [x] `GET /` answers with `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy: frame-ancestors 'self'`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` and `Permissions-Policy`.
- [x] The same headers arrive on `/api/health/supabase` and on `/games/asteroids/index.html`.
- [x] `/game/asteroids/play` still loads the game inside the iframe, with no console error about framing.
- [x] A page from another origin cannot embed `http://localhost:3000/` in an iframe.
- [x] No response uses `X-Frame-Options: DENY`.
- [x] `get_advisors` (security) no longer lists `rls_auto_enable` for `anon` or for `authenticated`.
- [x] A call to `/rest/v1/rpc/rls_auto_enable` with the publishable key is rejected.
- [x] `username_available` still works: the sign-up form still tells a taken username from a free one.
- [x] `get_advisors` (security) lists only the two `username_available` warnings and leaked password protection.
- [x] Every table in schema `public` has `rowsecurity = true`.
- [x] The RLS guard test fails when a migration creates a public table without RLS, and passes on the current migrations.
- [x] A sign-up with a 7-character password sent straight to the Supabase Auth API is rejected by the server.
- [x] A sign-up with 8 lowercase letters only, sent straight to the Supabase Auth API, is rejected by the server as weak.
- [x] `validateSignUp` rejects a password that lacks a lowercase letter, an uppercase letter, a digit or a symbol, and accepts `Abcdef1!`.
- [x] The sign-up form shows the password rule before the user submits.
- [x] `validateSignIn` still accepts any non-empty password, and an account made before this spec can sign in.
- [x] The sign-up and sign-in rate limit per IP is the Supabase default (30 requests per 5 minutes), and the API answers `429` when it is exceeded.
- [x] A visitor with no session and no guest cookie who opens `/game/asteroids/play` is redirected to `/login?next=%2Fgame%2Fasteroids%2Fplay`.
- [ ] After signing in from that redirect, the user lands on `/game/asteroids/play`.
- [ ] After "Play as guest" from that redirect, the user lands on `/game/asteroids/play`.
- [ ] A guest with the cookie reaches `/game/asteroids/play` and still saves scores as `GUEST`.
- [x] A guest created before this spec (localStorage only) gets the cookie on the next page load and can open the player.
- [ ] A visitor or a guest who opens `/profile` is redirected to `/login?next=/profile`; an account sees its username and email.
- [x] After sign-out the guest cookie is gone and `/game/asteroids/play` redirects to `/login`.
- [ ] `/`, `/library`, `/game/asteroids`, `/hall-of-fame`, `/about`, `/login`, `/api/*` and `/games/*` are never redirected by the proxy.
- [ ] A forged cookie `arcade-vault-guest=1` opens the player, and this is documented as accepted in `CLAUDE.md`.
- [ ] `/login?next=//evil.example` and `/login?next=https://evil.example` navigate to `/library` after sign-in.
- [x] The proxy uses `getClaims()` and never `getSession()`; a tampered `sb-*` cookie does not count as an account.
- [ ] `references/security/security-checklist.md` shows RLS, minimum password length, signup rate and security headers as done, and leaked password protection as open.
- [ ] `npm test`, `npm run lint` and `npm run build` pass.

---

## Decisions

- **Yes:** `X-Frame-Options: SAMEORIGIN` plus `frame-ancestors 'self'`. The player embeds the games in a same-origin iframe, so `DENY` breaks it. Third parties still cannot frame the site.
- **No:** `DENY` on the app pages and `SAMEORIGIN` only on `/games/*`. Two header sets for no gain, since no page needs to refuse framing by the site itself.
- **Yes:** add `Strict-Transport-Security` and `Permissions-Policy`. They are low risk and the games use no camera, microphone or location. Browsers ignore HSTS on plain `http://localhost`.
- **No:** `Content-Security-Policy` with script rules. Inline scripts in the games and the Next runtime need nonces and a test pass of every game. Its own spec.
- **Yes:** keep `username_available` executable by `anon` and `authenticated`. The sign-up form needs it before the account exists. SPEC 15 already records this as intended.
- **Yes:** revoke `rls_auto_enable()`. The app never calls it and the browser should not reach a `SECURITY DEFINER` function over REST.
- **No:** move the username check to a server Route Handler with a service role key. It adds a server secret and changes the SPEC 15 flow to close a warning that is accepted.
- **Yes:** leave leaked password protection open and say why. It is a Pro plan switch. Writing our own HaveIBeenPwned call adds a Route Handler and a new failure path for little gain.
- **Yes:** minimum password length 8 and the password requirement "Lowercase, uppercase letters, digits and symbols (recommended)" in the dashboard. The user chose it. The length matches SPEC 15 and closes the gap where a direct API call accepts 6 characters.
- **Yes:** mirror the composition rule in `validateSignUp`, so the form rejects a weak password with a clear message before the server does. Supabase stays the authority.
- **No:** touch `validateSignIn` or force a reset on old accounts. Sign-in must not lock out a player whose password predates the rule.
- **Yes:** a test that keeps RLS on for every table created in `supabase/migrations/`, plus a one-time check on the live database. The test stops the next table from shipping open; the check proves today's state.
- **Yes:** keep the sign-up and sign-in rate limit per IP at the Supabase default, 30 requests per 5 minutes (360 per hour). The dashboard field only accepts a value per 5 minutes, so the first target of 5 per hour cannot be expressed, and the fallback of 5 per 5 minutes was dropped by the user: it would count wrong passwords too and share one small quota among players behind the same network. Rate limits belong to Supabase Auth, not to our code.
- **Yes:** add `proxy.ts` now. SPEC 15 left it out because nothing needed a server-side session. A protected route does. Next 16 names the file `proxy.ts`; `middleware.ts` is deprecated.
- **Yes:** protect only `/game/[id]/play` (account or guest) and `/profile` (account). Landing, library, detail, hall of fame and About stay public for visitors and search engines.
- **Yes:** the proxy accepts a session or the guest cookie. Guests must keep playing (SPEC 08, SPEC 15), and they exist only in the browser.
- **Yes:** the guest cookie is a plain client-written flag and is documented as not secure. A forged cookie gives nothing that `anon` does not already have, since RLS lets `anon` save a `GUEST` score without it.
- **No:** a signed, httpOnly guest cookie. It needs a Route Handler and a new server secret to protect a gate that guards no data.
- **Yes:** a narrow matcher with two paths, not a wide one with exclusions. `/games/*`, `/_next/*`, `/api/*` and static files never run the proxy, so the game iframes and assets pay no cost.
- **Yes:** `getClaims()` in the proxy, which verifies the JWT, and the refresh of the token cookie on the protected paths. `getSession()` reads the cookie without verifying it and must not decide access. The browser client still refreshes tokens on every other page.
- **Yes:** the proxy is not the only guard. `/profile` also checks the session on the page, because Next docs say the proxy is for optimistic checks, not full authorization.
- **Yes:** `?next=` with `safeNextPath` and the same-origin rule. An open redirect on a login page is a phishing risk. `lib/safe-next.ts` lives in this spec so SPEC 16 reuses it.
- **Yes:** a minimal `/profile` (username, email, sign-out). A protected route needs a real target. Editing features go in their own spec.
- **No:** protect `/api/*`. `POST /api/contact` is public on purpose and `/api/health/supabase` carries no data.

---

## Risks

| Risk                                                                             | Mitigation                                                                                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A header breaks a page or the game iframe                                        | Steps 2 and 3 test the player and a game file by hand; `SAMEORIGIN` is chosen for this reason.                    |
| HSTS with `includeSubDomains` is cached by browsers for two years                | Only HTTPS hosts are affected; `localhost` ignores it. Remove the flag if a subdomain without HTTPS appears.      |
| `rls_auto_enable()` is used by an event trigger and revoking `execute` breaks it | Step 4 reads its definition and what uses it before the migration.                                                |
| The dashboard rate limit field cannot express "per hour"                         | Confirmed: it only takes a value per 5 minutes. The default of 30 per 5 minutes stays, recorded in Decisions.     |
| The rate limit blocks several players behind one IP (school, event)              | The value is a dashboard setting and can be raised without a deploy.                                              |
| The RLS guard test misses a table written with a different SQL spelling          | It matches `create table` with and without `if not exists` and quotes; fix the pattern if a migration is skipped. |
| A guest from before this spec has no cookie and is sent to `/login`              | Step 13 sets the cookie when the guest is read from localStorage, on the next page load.                          |
| The cookie is out of sync with localStorage (cleared in one place only)          | The cookie is rewritten on read; if it is missing the guest picks "Play as guest" again.                          |
| SPEC 16 also writes `safeNextPath` and `next` handling                           | This spec creates `lib/safe-next.ts`; SPEC 16 step 5 imports it instead of defining its own.                      |
| The proxy slows down the player page                                             | Narrow matcher; `getClaims()` verifies the JWT locally with the signing keys. Measure if the page feels slower.   |
| A tampered `sb-*` cookie passes the check                                        | `getClaims()` verifies the signature; the tampered token counts as no account. Tested by hand.                    |
| Leaked password protection stays off                                             | Documented as open in the checklist and in `CLAUDE.md`; upgrade the plan to close it.                             |

---

## What is **not** in this spec

- Leaked password protection (needs the Pro plan).
- A `Content-Security-Policy` with script rules.
- Changes to `username_available` or a rate limit on it.
- Captcha, MFA or a service role key.
- A signed guest cookie, or protecting routes other than `/game/[id]/play` and `/profile`.
- Profile editing: username, email, password, account deletion.
- Forcing existing accounts to change their password.
- A rate limit on `POST /api/contact`.

Each one of those, if it lands, goes in its own spec.
