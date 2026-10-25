// SPEC 17. Sent on every route from next.config.ts.
// X-Frame-Options is SAMEORIGIN, not DENY: /game/[id]/play embeds every game in a same-origin iframe.
// The Content-Security-Policy carries only frame-ancestors, the modern twin of X-Frame-Options.
export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
