import { connection, NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// No `runtime` or `dynamic` exports: with cacheComponents Next rejects both.
// The email link from Supabase lands here with `token_hash` and `type=email`. Verifying the token
// confirms the address and opens the session (the server client writes the auth cookies).
export async function GET(request: NextRequest) {
  await connection(); // the token is per request: never prerender this
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && type === "email") {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL("/library", request.nextUrl));
      console.error("[auth/confirm] could not verify the token:", error);
    } catch (err) {
      console.error("[auth/confirm] check failed:", err);
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirm", request.nextUrl));
}
