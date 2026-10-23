# SPEC 15 — Supabase Auth with email and password

> **Status:** Approved.
> **Depends on:** SPEC 04, SPEC 06, SPEC 08
> **Date:** 2026-10-23
> **Objective:** Replace the local fake sign-in with Supabase Auth (email and password, sign-up with a username and email confirmation, sign-in, sign-out) and tie each saved score to the signed-in user.

---

## Why this spec exists

`/login` is a stand-in. `lib/session.ts` stores a name in localStorage, `app/login/auth-card.tsx` accepts any username and password, and nothing proves who the player is. SPEC 08 left it that way on purpose: the score name is free text, so the ranking can be forged by calling the REST API directly.

This spec adds real accounts with Supabase Auth and links `scores` to them. A signed-in player can only save scores under their own username. A guest can still play and save, but only under the name `GUEST`.

The work is split in two. This spec covers email and password only. Google, GitHub and password recovery are SPEC 16, because they need external setup (OAuth apps) and extra screens.

---

## Scope

**In:**

- Migration `supabase/migrations/<version>_auth_profiles.sql`, applied with `apply_migration`, that:
  - creates `public.profiles` (one row per user, holds the username),
  - creates a trigger that inserts the profile when a row appears in `auth.users`,
  - creates the function `public.username_available(name text)`,
  - adds `scores.user_id`,
  - replaces the `insert` policy of `scores` with two policies, one for guests and one for signed-in users.
- `lib/auth.ts` (new): pure validators `validateSignUp` and `validateSignIn`, and wrappers over the Supabase browser client that never throw: `signUpWithEmail`, `signInWithEmail`, `resendConfirmation`, `signOutEverywhere`.
- `lib/session.ts`: `useSession` reads the real Supabase session. The exported shape stays `Session | null`. `Session` gets an optional `userId`.
- `app/login/auth-card.tsx`: real sign-in (email + password) and sign-up (username + email + password) with submitting, error and "check your email" states. The Google and GitHub buttons keep their current "not available yet" notice (SPEC 16).
- `app/auth/confirm/route.ts` (new): `GET` Route Handler that verifies the email confirmation link and redirects.
- `lib/leaderboard.ts`: `ScoreInput` gets an optional `userId`; `toScoreRow` returns `user_id`.
- `app/game/[id]/play/game-player.tsx`: a signed-in player saves under their username and `userId`; a guest saves as `GUEST` with no name field.
- `components/ui/navbar.tsx`: sign-out waits for Supabase.
- Manual dashboard steps, listed in the plan below (Resend SMTP, redirect URLs, confirmation email template).
- Tests: `lib/auth.test.ts`, `toScoreRow` with `userId`, the guest path of `lib/session.ts`.
- Update `CLAUDE.md`.

**Out of scope (for future specs):**

- Google and GitHub sign-in, password recovery, generated usernames (SPEC 16).
- `proxy.ts` and a server-rendered session. The browser client refreshes the token by itself.
- Profile page, changing the username or email, deleting the account.
- Moving credits (`lib/credits.ts`) to Supabase.
- Captcha, rate limits and breached-password checks beyond the Supabase defaults.
- Moving `/library`, `/game/[id]` and the landing from local scores to global scores.
- Changing the old rows of `scores`: they keep `user_id null` and their free-text name.

---

## Data model

```sql
-- One row per account. The username is the public name in leaderboards.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Z0-9_]{3,12}$' and username <> 'GUEST')
);
create unique index profiles_username_key on public.profiles (username);

-- scores gets the owner. Null for guests and for every row created before this spec.
alter table public.scores
  add column user_id uuid references auth.users (id) on delete set null;
```

Policies and grants (described, not final SQL):

- `profiles`: RLS on. `authenticated` may `select` the row where `id = auth.uid()`. No `insert`, `update` or `delete` grant for `anon` or `authenticated`: only the trigger writes.
- Trigger function `public.handle_new_user()`: `security definer`, `set search_path = ''`. It inserts `(new.id, upper(btrim(new.raw_user_meta_data ->> 'username')))`. Its `execute` is revoked from `anon` and `authenticated`.
- `public.username_available(name text) returns boolean`: `security definer`, `set search_path = ''`, compares `upper(btrim(name))` with `profiles.username`. `execute` granted to `anon` and `authenticated`.
- `scores`: `grant insert (user_id)` to `anon` and `authenticated`. Drop the policy "anyone can submit a score". Add:
  - guests (`anon`): `user_id is null and player = 'GUEST'` and the score bounds of SPEC 08.
  - signed-in (`authenticated`): `user_id = auth.uid()` and `player = (select username from public.profiles where id = auth.uid())` and the score bounds. This needs `select` on `profiles` for `authenticated` (granted above).

TypeScript:

```ts
export interface Session {
  name: string; // username for an account, GUEST for a guest
  guest: boolean;
  userId?: string; // set only for an account
}

// "unknown" is any other failure (for example the profile trigger failing); the UI shows a generic error.
export type AuthFailure =
  "username_taken" | "invalid_credentials" | "email_not_confirmed" | "network" | "unknown";
export type AuthResult = { ok: true } | { ok: false; code: AuthFailure };
```

Conventions:

- Usernames are stored upper-case. The form accepts any case and upper-cases it.
- Passwords are never stored by the app. Supabase keeps the hash.

---

## Implementation plan

1. Write the migration, apply it with `apply_migration`, and check the version with `list_migrations`. Save the file with that version in its name. Manual test: `list_tables` shows `profiles`; `get_advisors` shows no new warning.
2. Do the manual dashboard setup: SMTP through Resend, Site URL and redirect URLs (`http://localhost:3000` and the `NEXT_PUBLIC_LOCAL_URL` host), and the "Confirm signup" email template with the link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Manual test: a test sign-up sends the email.
3. Create `lib/auth.ts` with `validateSignUp` and `validateSignIn` only, plus `lib/auth.test.ts`. Rules: username `^[A-Za-z0-9_]{3,12}$` and not `GUEST` (any case); email `^\S+@\S+\.\S+$`; password 8 to 72 characters (72 is the bcrypt limit; Supabase ignores anything beyond it).
4. Add the wrappers to `lib/auth.ts`. `signUpWithEmail` calls `username_available` first, then `signUp` with the username in `options.data` and `emailRedirectTo`. Map Supabase errors to `AuthFailure`. Manual test: sign up from a scratch script or the console.
5. Make `lib/session.ts` real: read `getSession` and listen to `onAuthStateChange`, load the own `profiles` row, keep the guest in localStorage under the same key and event. Remove `signIn(name)`. `playAsGuest` signs out of Supabase first. `signOut` clears both. Keep `useSession` working for every consumer (`hero`, `pricing`, `navbar`, `game-scores`, `hall-of-fame`, `game-player`).
6. Create `app/auth/confirm/route.ts`: read `token_hash` and `type`, call `verifyOtp` through `lib/supabase/server.ts`, redirect to `/library` on success or `/login?error=confirm` on failure. Use `await connection()`; export neither `runtime` nor `dynamic`.
7. Rewrite the submit logic of `app/login/auth-card.tsx`: Sign in tab (email, password), Create account tab (username, email, password), disabled button while submitting, `[ERR]` line per `AuthFailure`, "Check your email" screen after sign-up, "Resend confirmation" action on `email_not_confirmed`, and a notice for `?error=confirm`.
8. Update `lib/leaderboard.ts` (`userId` in `ScoreInput` and `toScoreRow`) and `game-player.tsx` (remove the guest name field and its copy, send `GUEST` or the username with `userId`). Update `lib/leaderboard.test.ts` for the new row shape.
9. Make the sign-out button in `components/ui/navbar.tsx` call the new async `signOut`.
10. Update `CLAUDE.md` (auth, `profiles`, `scores.user_id`, new route, new migration, new test file, env notes).

---

## Acceptance criteria

- [x] `public.profiles` exists with RLS on and the unique index on `username`.
- [x] `anon` and `authenticated` have no `insert`, `update` or `delete` on `profiles`.
- [ ] Creating an account with an unused username creates exactly one `profiles` row with the username in upper-case.
- [ ] Sign-up with a username that is taken shows "Username taken" and does not call `signUp`.
- [ ] Sign-up with the username `guest` in any case is rejected by the form.
- [ ] After sign-up the screen shows "Check your email" and the user is not signed in yet.
- [ ] The confirmation link opens `/auth/confirm`, signs the user in and lands on `/library`.
- [ ] A bad or used confirmation link lands on `/login?error=confirm` and shows an error.
- [ ] Sign-in with a wrong password shows one generic `[ERR]` line that does not say which field is wrong.
- [ ] Sign-in before confirming shows "Resend confirmation", and the action sends a new email.
- [ ] After sign-in the navbar shows the username, and `useSession` returns `{ name, guest: false, userId }`.
- [ ] Reloading the page keeps the user signed in.
- [ ] Sign-out clears the Supabase session and the navbar shows the sign-in button.
- [ ] "Play as guest" still works with no account and `useSession` returns `GUEST`.
- [ ] A signed-in player's saved score has `user_id = auth.uid()` and `player` equal to their username.
- [ ] A REST insert as a signed-in user with a different `player` is rejected.
- [ ] A REST insert as a signed-in user with another `user_id` is rejected.
- [ ] A REST insert as `anon` with `player` other than `GUEST`, or with a `user_id`, is rejected.
- [ ] The final-score modal has no name field for a guest, and the guest score is saved as `GUEST`.
- [ ] Old `scores` rows are unchanged and still show in `/hall-of-fame`.
- [ ] No password or token is written to localStorage by the app code.
- [ ] `npm test`, `npm run lint` and `npm run build` pass.
- [ ] `get_advisors` (security) shows no new warning compared with before the migration, except the two for `username_available` (lints 0028 and 0029), which are intended: the sign-up form needs `anon` to call it.

---

## Decisions

- **Yes:** Supabase Auth. The project, the clients in `lib/supabase/` and RLS are already there.
- **Yes:** log in with email and password; the username is asked at sign-up and lives in `profiles`. Supabase Auth signs in by email, and a username login would need a server lookup that exposes which usernames exist.
- **No:** username login or "email or username". Extra server code for little value.
- **Yes:** email confirmation through `/auth/confirm` with `verifyOtp`. It stops accounts made with other people's emails.
- **No:** confirmation off. Simpler, but anyone could register any email.
- **Yes:** SMTP through Resend, set in the Supabase dashboard. The default Supabase SMTP has a very low hourly limit and only sends to project members.
- **Yes:** `profiles` filled by a database trigger, not by the client. The client cannot choose its own row or skip the format check.
- **Yes:** `username_available` before `signUp` for a clear "Username taken" message. The unique index is the final authority.
- **Yes:** `scores.user_id` now, with the name forced by RLS for signed-in users. This removes the forgery that SPEC 08 accepted for accounts.
- **Yes:** guests keep saving globally with `user_id null` and `player = 'GUEST'`. This is still forgeable (anyone can post as `GUEST` with any score in range); it is accepted.
- **No:** guests saved only locally. It was offered and not chosen.
- **Yes:** "Play as guest" stays a local session, not a Supabase anonymous user.
- **Yes:** no `proxy.ts` in this spec. Nothing is rendered on the server from the session, so the browser client is enough.
- **No:** changing `Session` consumers. `useSession` keeps its signature; `userId` is optional.
- **No:** re-assigning old rows to users. They have no owner to link to.

---

## Risks

| Risk                                                               | Mitigation                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Resend SMTP wrong in the dashboard, so no email arrives            | Step 2 has a manual test. The "Resend confirmation" action helps to retry. The sandbox sender only reaches the Resend account owner. |
| The profile trigger fails, which blocks sign-up                    | `username_available` runs first and the form validates the format. The UI shows a generic error on any other failure.                |
| Two people sign up with the same username at once                  | The unique index rejects the second one; the UI shows "Username taken".                                                              |
| The policy subquery on `profiles` fails without the `select` grant | The grant is part of the migration and an acceptance criterion checks a signed-in insert.                                            |
| `username_available` lets anyone test if a username exists         | Accepted: usernames are public in the leaderboards anyway.                                                                           |
| `useSession` becomes async and flickers on first paint             | Server snapshot stays `null`; the navbar already renders the signed-out state first.                                                 |
| A redirect URL is missing in the dashboard, so the link is refused | Step 2 lists both hosts, including `NEXT_PUBLIC_LOCAL_URL` for phone testing.                                                        |

---

## What is **not** in this spec

- Google and GitHub sign-in (SPEC 16).
- Password recovery (SPEC 16).
- Generated usernames for OAuth users (SPEC 16).
- `proxy.ts`, server-side session reads, protected routes.
- Profile page, username or email change, account deletion.
- Credits in Supabase.
- Captcha and rate limiting.
- Global scores in `/library`, `/game/[id]` and the landing.

Each one of those, if it lands, goes in its own spec.
