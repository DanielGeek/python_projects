import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// No `runtime` or `dynamic` exports: with cacheComponents Next rejects both. A GET handler is
// dynamic by default and runs on Node.js.
function fail() {
  return Response.json({ ok: false, error: "Supabase is not reachable." }, { status: 500 });
}

// Reads one row id from `games`. A 200 proves the project URL is right, the publishable key is
// accepted and the schema from the games_and_scores migration exists.
export async function GET() {
  await connection(); // wait for a real request: never prerender this check at build time
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("games")
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(5000));
    if (error) {
      console.error("[health/supabase] games query failed:", error);
      return fail();
    }
  } catch (err) {
    console.error("[health/supabase] check failed:", err);
    return fail();
  }
  return Response.json({ ok: true });
}
