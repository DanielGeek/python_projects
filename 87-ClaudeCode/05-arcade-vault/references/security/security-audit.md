# Security audit memory

Memory of the `security-auditor` agent (`.claude/agents/security-auditor.md`). It audits and reports; fixes go to a `/spec`. See also `security-checklist.md` and `specs/17-security-hardening.md`.

## Checks

| ID    | Area | Check                                                                   | Status  | Evidence | Last run |
| ----- | ---- | ----------------------------------------------------------------------- | ------- | -------- | -------- |
| DB-1  | db   | RLS on every `public` table and the expected policies                   | not run |          |          |
| DB-2  | db   | Least-privilege grants for `anon` and `authenticated`                   | not run |          |          |
| DB-3  | db   | `SECURITY DEFINER` functions, ACL and `search_path`                     | not run |          |          |
| DB-4  | db   | Security and performance advisors                                       | not run |          |          |
| DB-5  | db   | Migration drift (live vs files) and RLS tests                           | not run |          |          |
| DB-6  | db   | REST probes with the publishable key (must be rejected)                 | not run |          |          |
| APP-1 | app  | Security headers (`SAMEORIGIN`, six headers)                            | not run |          |          |
| APP-2 | app  | Proxy matcher and `getClaims()`                                         | not run |          |          |
| APP-3 | app  | Open redirect: `safeNextPath` on every user-fed redirect                | not run |          |          |
| APP-4 | app  | Secrets: no service role key, `.env` not tracked                        | not run |          |          |
| APP-5 | app  | Route Handlers: `/api/contact`, `/api/health/supabase`, `/auth/confirm` | not run |          |          |
| APP-6 | app  | Auth: password rule, `/profile` checks `getUser()`                      | not run |          |          |
| APP-7 | app  | XSS / injection grep and the iframe bridge (`source`, `KEYS`)           | not run |          |          |
| APP-8 | app  | Dependencies: `npm audit --omit=dev`                                    | not run |          |          |
| APP-9 | app  | Known gaps still as documented                                          | not run |          |          |

## Accepted risks (SPEC 17)

- `public.username_available(name text)` is `SECURITY DEFINER` and executable by `anon` and `authenticated` on purpose: the sign-up form needs it. Two advisor warnings.
- Leaked password protection is off: it needs the Supabase Pro plan, one switch in the dashboard when the project upgrades. One advisor warning.
- The guest cookie `arcade-vault-guest=1` is a plain client-written flag; a forged one opens the player, which protects no data.
- `anon` can still save a `GUEST` score for any range-valid value by calling the REST API directly (RLS enforces `player = 'GUEST'` and `user_id is null`).
- `X-Frame-Options` is `SAMEORIGIN`, not `DENY`, because the player embeds the games in a same-origin iframe.

## Open gaps (future specs)

- Password sign-ins have no effective rate limit; captcha or MFA would close it.
- No `Content-Security-Policy` with script rules (the games use inline scripts).
- No rate limit on `POST /api/contact` or on the `username_available` RPC.
- No signed guest cookie; no service role key.

## Findings log

| Date | Finding | Severity | Closed by |
| ---- | ------- | -------- | --------- |
