import { connection, NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

// No `runtime` or `dynamic` exports: with cacheComponents Next rejects both.
// The email links from Supabase land here with `token_hash` and `type`: `email` confirms the address
// (sign-up), `recovery` opens a recovery session (SPEC 16, "Forgot password?"). Verifying the token opens
// the session (the server client writes the auth cookies). `next` says where to go afterwards; only a
// same-origin relative path passes, anything else goes to /library (open redirect on an auth route).
export async function GET(request: NextRequest) {
  await connection(); // the token is per request: never prerender this
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && (type === "email" || type === "recovery")) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error)
        return NextResponse.redirect(
          new URL(safeNextPath(searchParams.get("next")), request.nextUrl),
        );
      console.error("[auth/confirm] could not verify the token:", error);
    } catch (err) {
      console.error("[auth/confirm] check failed:", err);
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirm", request.nextUrl));
}
