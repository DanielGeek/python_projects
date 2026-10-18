import { connection } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

// No `runtime` or `dynamic` exports: with cacheComponents Next rejects both. A GET handler is
// dynamic by default and runs on Node.js.
function fail() {
  return Response.json({ ok: false, error: "Supabase is not reachable." }, { status: 500 });
}

// Checks the Auth health endpoint: the database has no tables yet, so a table query is not possible.
// A 200 proves the project URL is right and the publishable key is accepted.
export async function GET() {
  await connection(); // wait for a real request: never prerender this check at build time
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error(`[health/supabase] Auth health answered ${response.status}.`);
      return fail();
    }
  } catch (err) {
    console.error("[health/supabase] check failed:", err);
    return fail();
  }
  return Response.json({ ok: true });
}
