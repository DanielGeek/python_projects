# SPEC 10 — Authentication and Route Protection

> **Status:** Approved
> **Depends on:** SPEC 03, SPEC 07, SPEC 08
> **Date:** 2026-11-28
> **Objective:** Implement real email/password authentication against Supabase with session management, route protection via proxy.ts and DAL, and logout functionality.

## Why this spec exists

- SPEC 03 implemented the login and activate-account screens with mock data and no real authentication.
- The project now has Supabase configured with `utils/supabase/server.ts`, `client.ts`, and `middleware.ts`, plus database tables for `daycares` and `users` (SPEC 07, 08).
- Routes are currently unprotected: anyone can access `/(staff)/*` without authentication.
- This spec bridges the gap between mock UI and real auth, establishing the security foundation for all future features.

## Scope

**In:**

- **Real login:** Convert `/login` from a `<Link>` to a form with Server Action calling `supabase.auth.signInWithPassword()`.
- **Session management:** Use Supabase's cookie-based sessions via `@supabase/ssr`.
- **Route protection:** Create `proxy.ts` at project root to refresh sessions and redirect unauthenticated users.
- **Data Access Layer (DAL):** Create `lib/dal.ts` with `verifySession()` and `getUser()` for server-side auth checks.
- **Protected routes:** All routes except `/login` and `/activate-account` require authentication.
- **Redirect logic:**
  - Unauthenticated user accessing protected route → redirect to `/login`.
  - Authenticated user accessing `/login` → redirect to `/` (feed).
  - Successful login → redirect to `/`.
- **Error handling:** Display generic "Invalid email or password" message on failed login.
- **Loading state:** Button shows spinner and is disabled while authenticating.
- **Validation:** Use zod for email/password validation (shared schema in `lib/validations/auth.ts`).
- **Logout:** Add `LogoutButton` component in staff shell sidebar, calls Server Action to sign out and redirect to `/login`.
- **Supabase pattern:** Follow official `@supabase/ssr` + Next.js 16 proxy pattern for session refresh.

**Out of scope (for future specs):**

- Real activate-account flow (password creation, invitation tokens).
- Forgot password / password recovery.
- Sign up / user registration.
- Email verification.
- Multi-factor authentication.
- Role-based access control (staff vs family).
- Session persistence configuration (cookies already handled by Supabase).
- Mobile-specific UI for auth screens.

## Route mapping

| Route | Status | Protection |
| --- | --- | --- |
| `/login` | SPEC 03 (updated) | Public, redirects to `/` if authenticated |
| `/activate-account` | SPEC 03 | Public, no changes |
| `/(staff)/*` | SPEC 01, 02 | Protected, redirects to `/login` if not authenticated |
| `/` (feed) | SPEC 01 | Protected |

## Data model

No new database tables or columns. This spec uses Supabase Auth's built-in `auth.users` table.

```ts
// lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```ts
// lib/dal.ts
import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const verifySession = cache(async () => {
  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isAuth: false, userId: null };
  }

  return { isAuth: true, userId: user.id };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.isAuth) return null;

  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return user;
});
```

Conventions:

- DAL functions use React's `cache()` to deduplicate requests within a render pass.
- `"server-only"` import ensures DAL never runs in the browser.
- Validation schemas are shared and reusable for future auth forms.

## Implementation plan

1. **Install zod.** Add `zod` dependency for form validation.

2. **Create validation schema.** `lib/validations/auth.ts` with `loginSchema` for email/password validation. Reusable for future auth forms.

3. **Create Data Access Layer.** `lib/dal.ts` with `verifySession()` and `getUser()`. Uses `createClient` from `utils/supabase/server.ts` to check session via `supabase.auth.getUser()`. Returns minimal user info.

4. **Create authentication actions.** `app/actions/auth.ts` with two Server Actions:
   - `login(formData)`: validates with zod, calls `supabase.auth.signInWithPassword()`, returns error message or redirects to `/`.
   - `logout()`: calls `supabase.auth.signOut()`, redirects to `/login`.

5. **Create LoginForm client component.** `app/login/LoginForm.tsx`: controlled form with email/password inputs, zod validation, loading state (spinner + disabled button), error message display. Calls `login` action on submit.

6. **Update login page.** `app/login/page.tsx`: replace `<Link href="/">` with `<LoginForm />`. Keep all visual design from SPEC 03 (hero, layout, styles). Add redirect logic in Server Component: if authenticated, redirect to `/`.

7. **Create proxy.ts.** Root `proxy.ts` following Supabase SSR pattern:
   - Export `proxy()` function that calls `updateSession()`.
   - `updateSession()` in `utils/supabase/proxy.ts`: creates Supabase client with cookie handling, calls `supabase.auth.getUser()` to refresh session.
   - Check session: if no session and route is not `/login` or `/activate-account`, redirect to `/login`.
   - If session exists and route is `/login`, redirect to `/`.
   - Export `config.matcher` to exclude static assets.

8. **Update Supabase middleware client.** `utils/supabase/middleware.ts`: ensure `setAll` properly handles cookies for session refresh (may already be correct from scaffolding).

9. **Create LogoutButton component.** `components/auth/LogoutButton.tsx`: client component with form calling `logout` action. Styled to match staff shell design.

10. **Add LogoutButton to staff shell.** `app/(staff)/layout.tsx`: import and render `LogoutButton` in sidebar (top-right corner or bottom, depending on existing layout).

11. **Test login flow.** Manual verification:
    - Valid credentials → redirect to `/`.
    - Invalid credentials → show "Invalid email or password" error.
    - Loading state → button disabled with spinner.
    - Authenticated user on `/login` → redirect to `/`.

12. **Test route protection.** Manual verification:
    - Unauthenticated access to `/(staff)/feed` → redirect to `/login`.
    - Unauthenticated access to `/(staff)/children` → redirect to `/login`.
    - Authenticated access to protected routes → works normally.

13. **Test logout.** Manual verification:
    - Click logout button → session cleared, redirect to `/login`.
    - After logout, accessing protected routes → redirect to `/login`.

## Acceptance criteria

- [ ] `npm run build` and `npm run lint` pass without errors.
- [ ] Loading `/login` produces no console errors or warnings.
- [ ] `/login` displays the LoginForm component with email and password fields.
- [ ] Login form validates email format and password presence before submitting.
- [ ] Login form shows loading state (spinner + disabled button) while authenticating.
- [ ] Login with valid Supabase credentials redirects to `/`.
- [ ] Login with invalid credentials shows "Invalid email or password" error message.
- [ ] Authenticated user accessing `/login` is automatically redirected to `/`.
- [ ] `proxy.ts` exists at project root and runs on all routes except static assets.
- [ ] Unauthenticated user accessing `/(staff)/feed` is redirected to `/login`.
- [ ] Unauthenticated user accessing `/(staff)/children` is redirected to `/login`.
- [ ] Unauthenticated user accessing any other protected route is redirected to `/login`.
- [ ] Authenticated user accessing protected routes works normally (no redirect loop).
- [ ] `lib/dal.ts` exists with `verifySession()` and `getUser()` functions.
- [ ] DAL functions use React's `cache()` for deduplication.
- [ ] Logout button is visible in staff shell sidebar.
- [ ] Clicking logout clears the session and redirects to `/login`.
- [ ] After logout, accessing protected routes redirects to `/login`.
- [ ] `/activate-account` remains unchanged and accessible without authentication.
- [ ] No visual design changes to `/login` page (hero, layout, styles from SPEC 03 preserved).
- [ ] zod is installed and validation schemas are in `lib/validations/auth.ts`.

## Decisions

- **Yes:** Server Actions for login/logout. Modern Next.js pattern, no API routes needed.
- **Yes:** zod for validation. Reusable schema, better DX than manual checks, small dependency.
- **Yes:** Shared validation schema in `lib/validations/auth.ts`. DRY principle, ready for future auth forms.
- **Yes:** DAL in `lib/dal.ts` following Next.js convention. Centralizes auth checks, uses React `cache()`.
- **Yes:** proxy.ts following Supabase SSR pattern. Official pattern, handles session refresh automatically.
- **Yes:** All routes protected except `/login` and `/activate-account`. Simpler than listing protected routes, safer for future additions.
- **Yes:** Generic error message "Invalid email or password". Security best practice, doesn't reveal if email exists.
- **Yes:** Loading state with spinner. Standard UX, prevents double-submission.
- **Yes:** Logout in sidebar. Natural location for user actions, visible but not intrusive.
- **Yes:** Redirect authenticated users from `/login` to `/`. Prevents confusion, natural flow.
- **No:** Forgot password. Deserves its own spec, not blocking for login.
- **No:** Real activate-account flow. Separate concern, requires invitation tokens.
- **No:** Sign up / registration. Not needed, users are invited.
- **No:** Role-based access control. Future spec when family feed is implemented.
- **No:** API routes for auth. Server Actions are simpler and more integrated.
- **No:** Custom session management. Supabase handles it, no need to reinvent.

## Risks

| Risk | Mitigation |
| --- | --- |
| Supabase credentials not configured | Verify `.env` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Fail fast with clear error if missing. |
| Cookie handling issues with Supabase SSR | Follow official `@supabase/ssr` pattern exactly. Test session refresh in proxy. |
| Redirect loops (authenticated user stuck on `/login`) | Test redirect logic thoroughly: proxy checks session before redirecting. |
| zod validation errors not user-friendly | Use clear error messages from zod schema, display in form. |
| proxy.ts performance impact | Use `config.matcher` to exclude static assets. Session refresh is fast (single Supabase call). |
| Logout button placement conflicts with existing sidebar design | Review current sidebar layout, place button in natural location (top-right or bottom). |
| Supabase Auth rate limiting on failed logins | Not a concern for MVP, but monitor if many failed attempts. Can add captcha later if needed. |

## What is **not** in this spec

- Real activate-account flow (password creation, invitation tokens, email verification).
- Forgot password / password recovery.
- Sign up / user registration.
- Role-based access control (staff vs family).
- Mobile-specific UI for auth screens.
- Session persistence configuration (already handled by Supabase).
- Email templates for invitations or password recovery.
- Multi-factor authentication.
- OAuth / social login.
- User profile management.

Each one of those, if it lands, goes in its own spec.
