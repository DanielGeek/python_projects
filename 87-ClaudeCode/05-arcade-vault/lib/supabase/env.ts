export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

type Source = Record<string, string | undefined>;

/** Reads and validates the two public variables. Throws an Error naming the missing variable. */
export function getSupabaseEnv(
  // Literal references so Next can inline the NEXT_PUBLIC_* values in the browser bundle.
  source: Source = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
): SupabaseEnv {
  const url = source.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url) throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
  if (!/^https?:\/\//.test(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://");
  }
  if (!publishableKey) {
    throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return { url, publishableKey };
}
