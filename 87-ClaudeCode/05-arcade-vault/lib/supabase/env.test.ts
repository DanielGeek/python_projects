import { describe, expect, it } from "vitest";
import { getSupabaseEnv } from "./env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

describe("getSupabaseEnv", () => {
  it("returns url and publishableKey when both variables are set", () => {
    expect(getSupabaseEnv(valid)).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_URL when the url is missing", () => {
    expect(() => getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: undefined })).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL",
    );
  });

  it("throws naming NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when the key is missing", () => {
    expect(() =>
      getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("treats empty and blank strings as missing", () => {
    expect(() => getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "" })).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL",
    );
    expect(() => getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "   " })).toThrow(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  });

  it("rejects a url that is not http(s)", () => {
    expect(() =>
      getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "your_supabase_url_here" }),
    ).toThrow("http");
  });

  it("trims surrounding whitespace", () => {
    expect(
      getSupabaseEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "  https://example.supabase.co  " }).url,
    ).toBe("https://example.supabase.co");
  });
});
