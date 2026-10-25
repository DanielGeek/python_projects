# Arcade Vault

A web platform for playing arcade games online and competing for the highest score.

## Features

- **Five playable games** (static HTML/canvas, embedded in an iframe): Asteroids, Drop, Brick Buster, Snake and Froggy. Each has the skins classic, retro and neon plus a light/dark theme.
- **Global leaderboard** in Supabase (`/hall-of-fame`, game tabs, top 50 per game). Scores are saved from the browser under RLS.
- **Accounts and guests** (Supabase Auth): email and password sign-up with a username and email confirmation, sign-in, sign-out, and "Play as guest" (saves scores as `GUEST`).
- **Profile page** (`/profile`): username, email and sign out, accounts only.
- **Touch controls** (the Gamepad MK-II pad) on phones, plus swipe in Froggy.
- **Credits** per device: one credit per game start, `INSERT COIN` at 0.
- **Landing, library, game detail and About pages**, with a contact form that emails through Resend.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · TypeScript · Supabase (Postgres, Auth, RLS) · Resend · Vitest.

## Getting started

```bash
npm install
cp .env.template .env   # then fill in the values
npm run dev             # http://localhost:3000
```

| Command                       | What it does                 |
| ----------------------------- | ---------------------------- |
| `npm run dev`                 | Dev server (Turbopack)       |
| `npm run build` / `npm start` | Production build / serve     |
| `npm run lint`                | ESLint                       |
| `npm run format`              | Prettier over the whole repo |
| `npm test`                    | Vitest, single run           |

### Environment variables

Server only (never prefix with `NEXT_PUBLIC_`): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `SUPABASE_DB_PASSWORD`.

Public by design (security comes from RLS): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Optional, to test on a phone over the network: `NEXT_PUBLIC_LOCAL_URL` and `NEXT_PUBLIC_PORT`. There is no service role key.

Supabase Auth setup lives in the dashboard (custom SMTP through Resend, Site URL and redirect URLs, "Confirm email" on, the confirmation template link, minimum password length 8 and password requirements). See `CLAUDE.md` for the exact values.

## Database

SQL migrations live in `supabase/migrations/` and are applied with the Supabase MCP. Tables: `games`, `scores` and `profiles`, all with Row Level Security. The public roles have least-privilege grants: `select`, plus `insert` on a few `scores` columns. `lib/rls.test.ts` fails when a migration creates a table in `public` without RLS.

## Security

Hardened in SPEC 17:

- Security headers on every route (`nosniff`, `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `Referrer-Policy`, HSTS, `Permissions-Policy`).
- `proxy.ts` protects `/game/[id]/play` (account or guest) and `/profile` (account only), using `getClaims()`.
- `?next=` goes through `safeNextPath`, so there is no open redirect.
- Password rule: 8 to 72 characters with a lowercase letter, an uppercase letter, a digit and a symbol.
- `rls_auto_enable()` is no longer executable by `anon` or `authenticated`.

Accepted and open items are tracked in `references/security/security-checklist.md` and `references/security/security-audit.md`: the two `username_available` advisor warnings (needed by the sign-up form), leaked password protection (Supabase Pro plan), and no effective rate limit on password sign-ins.

### Security auditor

The `security-auditor` agent (`.claude/agents/security-auditor.md`) audits the database (RLS, policies, grants, `SECURITY DEFINER` functions, advisors, migration drift, REST probes with the publishable key) and the app (headers, proxy, open redirect, secrets, Route Handlers, the iframe bridge, dependencies). It is read-only: it reports findings and never fixes them; every fix goes to a `/spec`. Its memory is `references/security/security-audit.md`.

Last run (2026-10-25): nothing critical, high or medium, and four low findings (an unindexed foreign key on `scores.user_id`, `rls_auto_enable()` not created by any migration, `scores.user_id` readable by `anon`, and the host `message` listener not validating the message shape).

## Spec-driven design

Features are specified in `specs/NN-<slug>.md` (01 to 17) and in `specs/game-jam/<id>/` before they are built. A spec goes Draft → Approved → Implemented, and its acceptance criteria are ticked as each step is done. Based on `/spec` and `/spec-impl`, following the practices of https://github.com/Klerith/fernando-skills:

```bash
npx skills@latest add Klerith/fernando-skills
```

| Skill             | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| `/spec`           | Writes a spec section by section                                   |
| `/spec-impl`      | Implements an Approved spec on its own branch; never commits       |
| `/add-game`       | Writes the spec for a new playable game                            |
| `/spec-impl-game` | `/spec-impl` for games, then `skin-designer`, then `mobile-porter` |

## Agents

Agents live in `.claude/agents/`. Each works only on what you name and keeps a single memory file.

| Agent                      | What it does                                          | Memory                                  |
| -------------------------- | ----------------------------------------------------- | --------------------------------------- |
| `game-planner`             | Decides which game to add next                        | `references/game-suggestions-todo.md`   |
| `game-jam`                 | Turns a game description into Draft specs             | —                                       |
| `skin-designer`            | Adds skins and light/dark themes to named games       | `references/game-with-themes.md`        |
| `mobile-porter`            | Fixes the phone layout of named routes                | `references/mobile-porting.md`          |
| `game-performance-booster` | Audits, measures and fixes game performance (SPEC 14) | `references/game-performance.md`        |
| `security-auditor`         | Read-only database and app security audit             | `references/security/security-audit.md` |

## Project guide

`CLAUDE.md` holds the full architecture, conventions and per-module notes. Specs and docs are written in English.
