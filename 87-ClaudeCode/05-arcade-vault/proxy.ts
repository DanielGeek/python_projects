import { NextResponse, type NextRequest } from "next/server";
import { decideAccess, GUEST_COOKIE } from "@/lib/route-guard";
import { updateSession } from "@/lib/supabase/proxy";

// SPEC 17. An optimistic gate, not a security boundary: a guest only has a cookie that the browser
// writes, so anyone can forge it. What protects data is RLS. /profile also checks the session on the page.
export async function proxy(request: NextRequest) {
  const { response, account } = await updateSession(request);
  const access = decideAccess({
    pathname: request.nextUrl.pathname,
    account,
    guest: request.cookies.get(GUEST_COOKIE)?.value === "1",
  });
  if (access.allow) return response;

  const redirect = NextResponse.redirect(new URL(access.redirect, request.url));
  // Keep the refreshed session cookies on the redirect.
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

// Only these two paths run the proxy: the games under /games/*, /_next/*, /api/*, /auth/* and static
// files never reach it.
export const config = {
  matcher: ["/game/:id/play", "/profile"],
};
