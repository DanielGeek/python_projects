import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** Supabase client for Server Components and Route Handlers. Created per call, reads request cookies. */
export async function createClient(): Promise<SupabaseClient> {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet)
            cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. Harmless until proxy.ts refreshes the session.
        }
      },
    },
  });
}
