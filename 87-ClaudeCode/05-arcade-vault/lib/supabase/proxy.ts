import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * SPEC 17. Refreshes the Supabase session of a request and says whether an account is signed in.
 * Uses getClaims(), which verifies the JWT signature. getSession() only reads the cookie, so a tampered
 * `sb-*` cookie would pass it. Any failure counts as "no account", never as an error for the visitor.
 * The returned response carries the refreshed cookies: copy them to any redirect built from it.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; account: boolean }> {
  let response = NextResponse.next({ request });

  let env;
  try {
    env = getSupabaseEnv();
  } catch (error) {
    // Without the variables the app runs with guests only (lib/session.ts), so there is no account.
    console.error("[proxy] Supabase is not configured", error);
    return { response, account: false };
  }

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options);
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getClaims();
    return { response, account: !error && Boolean(data?.claims?.sub) };
  } catch (error) {
    console.error("[proxy] getClaims failed", error);
    return { response, account: false };
  }
}
