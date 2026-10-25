import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

const byKey = Object.fromEntries(securityHeaders.map((h) => [h.key, h.value]));

describe("securityHeaders", () => {
  it("sends exactly the six headers of SPEC 17", () => {
    expect(Object.keys(byKey).sort()).toEqual(
      [
        "Content-Security-Policy",
        "Permissions-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
      ].sort(),
    );
    expect(securityHeaders).toHaveLength(6);
  });

  it("uses SAMEORIGIN, never DENY, so the player can embed the games", () => {
    expect(byKey["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(securityHeaders.some((h) => h.value === "DENY")).toBe(false);
  });

  it("limits framing to the same origin and adds no script rules", () => {
    expect(byKey["Content-Security-Policy"]).toBe("frame-ancestors 'self'");
  });

  it("has the exact values of the other headers", () => {
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(byKey["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
  });
});
