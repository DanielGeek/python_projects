# SPEC 17 — Security hardening

> **Status:** Approved
> **Depends on:** SPEC 06, SPEC 08, SPEC 15
> **Date:** 2026-10-25
> **Objective:** Apply the basic security checklist of `references/security/security-checklist.md`: security headers in Next.js, Supabase Auth limits, a locked-down `rls_auto_enable()` and a guard that keeps RLS on for every public table.

---

## Why this spec exists

`references/security/security-checklist.md` lists five basic measures and a Supabase advisor report with five security warnings. Some are already done (RLS on `games`, `scores` and `profiles`; password length 8 to 72 in `lib/auth.ts`), some live only in the Supabase dashboard, and some are code.

One item of the checklist cannot be applied as written. `X-Frame-Options: DENY` would stop the player page from loading, because `/game/[id]/play` embeds every game in a same-origin iframe (`/games/<id>/index.html`). This spec uses `SAMEORIGIN` instead.

---

## Scope

**In:**

- `lib/security-headers.ts` (new): the list of security headers, with a test on its values.
- `next.config.ts`: a `headers()` function that sends the list on every route.
- Migration `supabase/migrations/<version>_lock_rls_auto_enable.sql`, applied with `apply_migration`, that revokes `execute` on `public.rls_auto_enable()` from `public`, `anon` and `authenticated`.
- A test that rebuilds the schema from `supabase/migrations/` and fails when a table in `public` has no `enable row level security` (in `lib/leaderboard.test.ts` or a new `lib/rls.test.ts`).
- A one-time RLS check with `execute_sql` on `pg_tables` and `pg_policies`.
- Manual Supabase dashboard steps: minimum password length 8, password requirements "Lowercase, uppercase letters, digits and symbols (recommended)", sign-up and sign-in rate limit per IP.
- `lib/auth.ts`: `validateSignUp` also requires at least one lowercase letter, one uppercase letter, one digit and one symbol, so the form shows the error before Supabase rejects the password as weak. `app/login/auth-card.tsx` shows the rule as a hint under the sign-up password field. `lib/auth.test.ts` covers the new rule. `validateSignIn` does not change, so old accounts can still sign in.
- Update `CLAUDE.md` and tick `references/security/security-checklist.md`.

**Out of scope (for future specs):**

- Leaked password protection (HaveIBeenPwned). It needs the Supabase Pro plan. It stays open in the checklist until the project upgrades; then it is one switch in the dashboard.
- `Content-Security-Policy` with script rules. The games use inline scripts and Next injects its own, so it needs nonces and a full pass over the five games.
- Changing `public.username_available(name text)`. It is `SECURITY DEFINER` and executable by `anon` and `authenticated` on purpose: the sign-up form needs it. Its two advisor warnings stay and are documented.
- A rate limit on the `username_available` RPC or on `POST /api/contact`.
- Captcha, MFA, service role key, `proxy.ts`.
- Forcing existing accounts to change a password that does not meet the new rule.
- Fixing advisor warnings that are not in the checklist file.

---

## Data model

No new tables or columns. This spec adds one list of headers and one migration.

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

Dashboard values:

```text
Authentication > Sign In / Providers > Email   minimum password length = 8
                                               password requirements = Lowercase, uppercase letters, digits and symbols (recommended)
Authentication > Rate Limits                   sign-ups and sign-ins per IP, target 5 per hour
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
8. Do the dashboard steps: set the minimum password length to 8, the password requirements to "Lowercase, uppercase letters, digits and symbols (recommended)" and the sign-up and sign-in rate limit per IP. Check the unit of the rate limit field first. If it only accepts a value per 5 minutes, use 5 per 5 minutes and note it in the Decisions section.
9. Manual test of the limits: send a sign-up with a 7-character password, and another with 8 lowercase letters only, straight to the Supabase Auth API with the publishable key and see both rejected; repeat sign-ups from one IP until the API answers `429`.
10. Update `CLAUDE.md` (headers, the password rule, the migration, the guard test, the accepted advisor warnings) and tick `references/security/security-checklist.md`, leaving leaked password protection open with a note.

---

## Acceptance criteria

- [ ] `GET /` answers with `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Content-Security-Policy: frame-ancestors 'self'`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` and `Permissions-Policy`.
- [ ] The same headers arrive on `/api/health/supabase` and on `/games/asteroids/index.html`.
- [ ] `/game/asteroids/play` still loads the game inside the iframe, with no console error about framing.
- [ ] A page from another origin cannot embed `http://localhost:3000/` in an iframe.
- [ ] No response uses `X-Frame-Options: DENY`.
- [ ] `get_advisors` (security) no longer lists `rls_auto_enable` for `anon` or for `authenticated`.
- [ ] A call to `/rest/v1/rpc/rls_auto_enable` with the publishable key is rejected.
- [ ] `username_available` still works: the sign-up form still tells a taken username from a free one.
- [ ] `get_advisors` (security) lists only the two `username_available` warnings and leaked password protection.
- [ ] Every table in schema `public` has `rowsecurity = true`.
- [ ] The RLS guard test fails when a migration creates a public table without RLS, and passes on the current migrations.
- [ ] A sign-up with a 7-character password sent straight to the Supabase Auth API is rejected by the server.
- [ ] A sign-up with 8 lowercase letters only, sent straight to the Supabase Auth API, is rejected by the server as weak.
- [ ] `validateSignUp` rejects a password that lacks a lowercase letter, an uppercase letter, a digit or a symbol, and accepts `Abcdef1!`.
- [ ] The sign-up form shows the password rule before the user submits.
- [ ] `validateSignIn` still accepts any non-empty password, and an account made before this spec can sign in.
- [ ] The sign-up and sign-in rate limit per IP is set, and the API answers `429` when it is exceeded.
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
- **Yes:** set the sign-up rate limit in the dashboard, target 5 per hour per IP. Rate limits belong to Supabase Auth, not to our code.

---

## Risks

| Risk                                                                             | Mitigation                                                                                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A header breaks a page or the game iframe                                        | Steps 2 and 3 test the player and a game file by hand; `SAMEORIGIN` is chosen for this reason.                    |
| HSTS with `includeSubDomains` is cached by browsers for two years                | Only HTTPS hosts are affected; `localhost` ignores it. Remove the flag if a subdomain without HTTPS appears.      |
| `rls_auto_enable()` is used by an event trigger and revoking `execute` breaks it | Step 4 reads its definition and what uses it before the migration.                                                |
| The dashboard rate limit field cannot express "per hour"                         | Step 7 checks the unit and falls back to 5 per 5 minutes, recorded in Decisions.                                  |
| The rate limit blocks several players behind one IP (school, event)              | The value is a dashboard setting and can be raised without a deploy.                                              |
| The RLS guard test misses a table written with a different SQL spelling          | It matches `create table` with and without `if not exists` and quotes; fix the pattern if a migration is skipped. |
| Leaked password protection stays off                                             | Documented as open in the checklist and in `CLAUDE.md`; upgrade the plan to close it.                             |

---

## What is **not** in this spec

- Leaked password protection (needs the Pro plan).
- A `Content-Security-Policy` with script rules.
- Changes to `username_available` or a rate limit on it.
- Captcha, MFA, service role key or `proxy.ts`.
- Forcing existing accounts to change their password.
- A rate limit on `POST /api/contact`.

Each one of those, if it lands, goes in its own spec.
