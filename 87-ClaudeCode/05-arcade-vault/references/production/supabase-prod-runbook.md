# Supabase production runbook

Moves the development Supabase project to a new, empty production project. **You** run every step: Claude has no access to production (`.env.prod` and `scripts/supabase-prod.sh` are in the `deny` rules of `.claude/settings.json`, and the Supabase MCP only reaches dev).

Decisions: production starts clean (no test scores, no test users; the five `games` rows come from the migrations), hosting is Vercel (`<PROD_URL>` below is your production URL), migrations go through the Supabase CLI without `supabase link`.

What lives where:

| Piece                                                                | How it reaches prod                                                                                                                                                                            |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tables, RLS, policies, grants, functions, auth trigger, `games` rows | The 9 files in `supabase/migrations/` (`supabase db push`)                                                                                                                                     |
| `public.rls_auto_enable()` and the `ensure_rls` event trigger        | `bootstrap-rls-auto-enable.sql`. Supabase creates them in a new project and no migration does, but migration 9 revokes `execute` on the function, so it has to exist before the push          |
| Auth settings (SMTP, URLs, email template, password rules)           | Dashboard checklist below (not versioned)                                                                                                                                                      |
| Extensions, Edge Functions, Storage, cron                            | Nothing to do (dev uses none beyond the defaults)                                                                                                                                              |

## 0. Prerequisites

- [x] `.env.prod` filled from `.env.prod.template` with the **production** values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DB_PASSWORD`, Resend values).
- [x] `psql` (`brew install libpq`) and the Supabase CLI are installed.

## 1. Database

Run from the repo root, in your own terminal.

```bash
./scripts/supabase-prod.sh check       # connection OK; says if bootstrap is needed
```

The direct host `db.<ref>.supabase.co` is IPv6 only. If `check` cannot connect, copy the **Session pooler** string from the dashboard (Connect), put it in `.env.prod` as `SUPABASE_PROD_DB_URL=...` and run `check` again.

```bash
./scripts/supabase-prod.sh bootstrap   # only creates what is missing; asks y/N
./scripts/supabase-prod.sh dry-run     # must list the 9 migrations
./scripts/supabase-prod.sh push        # asks y/N
./scripts/supabase-prod.sh verify      # every line must say PASS
```

The script refuses to run if `.env.prod` points at the dev project (`sxwaixbuvhubktrkktnx`). A failed `push` leaves the applied migrations in `supabase_migrations.schema_migrations`; run `push` again.

- [x] `check` OK
- [x] `bootstrap` OK (or already present)
- [x] `dry-run` lists the 9 migrations
- [x] `push` finished
- [x] `verify`: all PASS

## 2. Dashboard of the production project (copy from dev)

- [ ] **Authentication > Sign In / Providers**: Email on, **Confirm email** on.
- [ ] **Authentication > URL Configuration**: Site URL `<PROD_URL>`; redirect URLs `<PROD_URL>/**` (and the Vercel preview pattern if you want previews). No `localhost` in production.
- [ ] **Authentication > Email Templates > Confirm sign up**: link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. The default `{{ .ConfirmationURL }}` does not work with `/auth/confirm`.
- [ ] **Authentication > SMTP**: `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key (better a different one from dev). The sandbox sender `onboarding@resend.dev` only delivers to the Resend account owner, so real users could not confirm their email. Verify a domain in Resend and use a sender of that domain (also for `CONTACT_FROM_EMAIL`).
- [ ] **Authentication > Passwords**: minimum length 8, requirements "Lowercase, uppercase letters, digits and symbols".
- [ ] **Authentication > Rate limits**: defaults (30 requests per 5 minutes per IP).
- [ ] **Leaked password protection**: only on the Pro plan; turn it on if production is Pro (accepted advisor warning otherwise).
- [ ] **Project Settings > API**: copy the URL and the **publishable** key. The service role key is not used anywhere and never goes in a `NEXT_PUBLIC_` variable.

## 3. Vercel

- [ ] Environment variables (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Not `SUPABASE_DB_PASSWORD`, `NEXT_PUBLIC_LOCAL_URL` or `TELEGRAM_*`.
- [ ] Redeploy (`NEXT_PUBLIC_*` values are inlined at build time).
- [ ] When the domain is final, update Site URL and redirect URLs (section 2).

## 4. Checks after the deploy

REST probes with the production publishable key (replace the placeholders; the key is public by design):

```bash
SB=https://<prod-ref>.supabase.co; KEY=<prod-publishable-key>
# expect 200 and 5 games
curl -s "$SB/rest/v1/games?select=id" -H "apikey: $KEY"
# expect 401 (the function is not executable by the browser)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$SB/rest/v1/rpc/rls_auto_enable" -H "apikey: $KEY"
# expect an RLS error: anon may only insert player = 'GUEST' with user_id null
curl -s -X POST "$SB/rest/v1/scores" -H "apikey: $KEY" -H "Content-Type: application/json" \
  -d '{"game_id":"asteroids","player":"HACKER","score":1}'
```

- [ ] The three probes answer as expected.
- [ ] Dashboard > Advisors (security): only the two `username_available` warnings (and leaked password protection if not on Pro).
- [ ] `GET <PROD_URL>/api/health/supabase` answers `200 { "ok": true }`.
- [ ] Sign up, receive the email, confirm (goes through `/auth/confirm`), sign in.
- [ ] Play a game and save one score as the account and one as a guest; both show in `/hall-of-fame`.
- [ ] Send the `/about` contact form and receive the email.

## 5. Future migrations

Claude writes and tests the migration in dev (MCP `apply_migration`) and saves it in `supabase/migrations/`. You review it, update `verify-prod.expected` if it changes policies, grants or functions, then run `dry-run`, `push` and `verify`. Only the new files are applied, because production keeps its own migration history.
