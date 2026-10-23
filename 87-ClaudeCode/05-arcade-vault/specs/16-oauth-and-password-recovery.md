# SPEC 16 — Google and GitHub sign-in and password recovery

> **Status:** Approved.
> **Depends on:** SPEC 15
> **Date:** 2026-10-23
> **Objective:** Add Google and GitHub sign-in (with an automatically generated username) and an email-based password recovery flow to the Supabase Auth set up in SPEC 15.

---

## Why this spec exists

SPEC 15 delivers accounts with email and password. The Google and GitHub buttons on `/login` still show "not available yet", and a player who forgets the password has no way back in.

OAuth users never type a username, so the profile trigger of SPEC 15 would fail for them. This spec changes the trigger to generate a valid username when none is given. Both features also need setup outside the repo (OAuth apps at Google and GitHub, provider switches and email templates in the Supabase dashboard), which is why they are not part of SPEC 15.

---

## Scope

**In:**

- Migration `supabase/migrations/<version>_oauth_usernames.sql` that replaces `public.handle_new_user()` so that a missing, invalid or taken username becomes a generated one.
- `app/auth/callback/route.ts` (new): `GET` Route Handler that exchanges the OAuth `code` for a session.
- `app/login/auth-card.tsx`: the Google and GitHub buttons start the OAuth flow; a "Forgot password?" link in the Sign in tab opens a form that asks for the email.
- `lib/auth.ts`: `signInWithProvider`, `requestPasswordReset` and `updatePassword`, never throwing, same `AuthResult` shape as SPEC 15.
- `app/auth/confirm/route.ts`: accepts an optional relative `next` path, so the recovery link can land on the reset screen.
- `app/login/reset/page.tsx` and its client form (new): new password and repeat, then redirect to `/library`.
- Manual dashboard steps: OAuth apps, provider switches, redirect URLs and the "Reset password" email template.
- Tests: new validator for the reset form, the safe `next` check, the username generator rules.
- Update `CLAUDE.md`.

**Out of scope (for future specs):**

- Letting the player change the generated username.
- Linking several providers to one account, or merging an OAuth account with an email account.
- Other providers (Discord, Apple), magic link, phone login.
- A "change password" screen for a signed-in player.
- Any change to `scores`, RLS or `proxy.ts`.

---

## Data model

No new tables or columns. The table `public.profiles` stays as in SPEC 15.

The generated username follows the same format check, `^[A-Z0-9_]{3,12}$`:

```text
base      = provider name (user_name, then name, then the part of the email before "@"),
            upper-cased, every character outside [A-Z0-9] removed, cut to 7 characters
username  = base + "_" + 4 random digits         -> e.g. DANIEL_4821
fallback  = "PLAYER_" + 4 random digits           (when base is empty or is GUEST)
collision = try again with new digits, up to 10 times, then fall back to PLAYER_####
```

If the sign-up metadata already carries a valid, free username (the SPEC 15 email flow), it is used unchanged.

---

## Implementation plan

1. Write the migration that replaces `handle_new_user()` with the generation rules above (still `security definer`, `set search_path = ''`, `execute` revoked from `anon` and `authenticated`). Apply it with `apply_migration`, check the version with `list_migrations`. Manual test: insert two users with the same provider name through the SQL editor in a branch or test project and read two different usernames.
2. Do the manual dashboard setup: create the Google and GitHub OAuth apps, paste the client ids and secrets in Supabase, enable both providers, add `/auth/callback` and `/auth/confirm` to the redirect URLs for every host used (localhost and `NEXT_PUBLIC_LOCAL_URL`), and set the "Reset password" template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/login/reset`.
3. Create `app/auth/callback/route.ts`: read `code`, call `exchangeCodeForSession` through `lib/supabase/server.ts`, redirect to `/library` or `/login?error=oauth`. Use `await connection()`; export neither `runtime` nor `dynamic`.
4. Add `signInWithProvider(provider)` to `lib/auth.ts` (`signInWithOAuth` with `redirectTo = origin + "/auth/callback"`) and wire the two buttons of the auth card. Remove the "not available yet" notice. Show an `[ERR]` line for `?error=oauth`.
5. Add the `next` handling to `app/auth/confirm/route.ts`: accept only a path that starts with a single `/`, has no `//`, no `\` and no scheme; otherwise use `/library`. Add a pure `safeNextPath` function with tests.
6. Add `requestPasswordReset(email)` to `lib/auth.ts` and the "Forgot password?" form in the auth card. The success message is the same whether the email exists or not.
7. Create `app/login/reset/page.tsx` with a client form: new password (at least 8 characters) and repeat, `updatePassword` through `updateUser`, then redirect to `/library`. Without a recovery session the page shows a message and a link to `/login`.
8. Update `CLAUDE.md`.

---

## Acceptance criteria

- [ ] Clicking Google or GitHub on `/login` opens the provider's consent screen.
- [ ] After consent the user lands on `/library` signed in, and the navbar shows a generated username.
- [ ] The generated username matches `^[A-Z0-9_]{3,12}$` and is never `GUEST`.
- [ ] Two OAuth users with the same provider name get two different usernames.
- [ ] An OAuth user whose provider name has no letters or digits gets `PLAYER_` followed by 4 digits.
- [ ] An email sign-up with a valid free username still keeps exactly that username.
- [ ] A cancelled or failed OAuth flow lands on `/login?error=oauth` and shows an `[ERR]` line.
- [ ] "Forgot password?" shows a form that asks for the email only.
- [ ] The confirmation message after requesting a reset is the same for an existing and an unknown email.
- [ ] The recovery email link opens `/login/reset` with an active recovery session.
- [ ] A password shorter than 8 characters, or two passwords that differ, is rejected by the reset form.
- [ ] After a successful reset the user is signed in and can sign in again with the new password.
- [ ] `/login/reset` with no recovery session shows a message and does not call `updateUser`.
- [ ] `safeNextPath` rejects `//evil.example`, `https://evil.example`, `/\evil` and an empty value, and accepts `/login/reset`.
- [ ] A score saved by an OAuth user has `user_id = auth.uid()` and `player` equal to the generated username.
- [ ] `npm test`, `npm run lint` and `npm run build` pass.
- [ ] `get_advisors` (security) shows no new warning compared with before the migration.

---

## Decisions

- **Yes:** generate the username for OAuth users. It needs no extra screen and the sign-in flow has no dead end.
- **No:** a "choose your username" screen after the first OAuth login. It adds a half-created account state and a route guard.
- **Yes:** the generated name keeps a recognizable part of the provider name (up to 7 characters) plus 4 digits. It reads like an arcade tag and stays inside the 12 characters.
- **Yes:** retry on collision, then fall back to `PLAYER_####`, so the trigger never blocks a sign-up.
- **Yes:** the OAuth callback uses the PKCE `code` exchange on the server, so the session is created from a Route Handler and not from a URL fragment.
- **Yes:** recovery reuses `/auth/confirm` with `next`, so there is one place that verifies email links.
- **Yes:** `safeNextPath` allows only a same-origin relative path. An open redirect on an auth route is a phishing risk.
- **Yes:** the reset request answers the same for any email, so it does not tell which emails have accounts.
- **No:** linking providers. Supabase keeps separate accounts per provider unless identities are linked on purpose; that is its own design.
- **No:** a username editor. Not needed to ship OAuth, and a rename needs rules about old scores.

---

## Risks

| Risk                                                                    | Mitigation                                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Wrong redirect URL in the OAuth app or in Supabase                      | Step 2 lists every URL and host. The acceptance criteria test the full flow on localhost. |
| Two sign-ups pick the same generated name at the same time              | The unique index rejects one; the trigger retries up to 10 times, then uses the fallback. |
| The same email signs in with Google and with a password as two accounts | Out of scope here. Noted for a later spec about linking identities.                       |
| Recovery link opened on another device or after it expired              | `/login/reset` handles the no-session case; the user can request a new link.              |
| Open redirect through `next`                                            | `safeNextPath` with tests, and `/library` as the default.                                 |
| Provider secrets leak into the repo                                     | Secrets live only in the Supabase dashboard. No env variable and no code reads them.      |

---

## What is **not** in this spec

- Editing the generated username.
- Linking or merging accounts across providers.
- Other providers, magic link, phone login.
- A change-password screen for signed-in players.
- Changes to `scores`, RLS, or `proxy.ts`.

Each one of those, if it lands, goes in its own spec.
