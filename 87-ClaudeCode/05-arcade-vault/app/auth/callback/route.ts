import { connection, NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// No `runtime` or `dynamic` exports: with cacheComponents Next rejects both.
// Google and GitHub send the player back here (SPEC 16) with a one-time `code` (PKCE). Exchanging it
// on the server opens the session: the server client writes the auth cookies. A cancelled consent
// screen comes back with `error` instead of `code`.
export async function GET(request: NextRequest) {
  await connection(); // the code is per request: never prerender this
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (code && !searchParams.get("error")) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/library", request.nextUrl));
      console.error("[auth/callback] could not exchange the code:", error);
    } catch (err) {
      console.error("[auth/callback] exchange failed:", err);
    }
  }
  return NextResponse.redirect(new URL("/login?error=oauth", request.nextUrl));
}
