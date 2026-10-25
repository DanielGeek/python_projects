import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

// Dev only: lets a phone on the same network open `npm run dev` at http://<NEXT_PUBLIC_LOCAL_URL>:<port>.
// Next matches the hostname only, so the scheme and the port of the variable are dropped. An unset or
// invalid value (like the template placeholder) allows nothing extra.
function localDevHosts(): string[] {
  try {
    return process.env.NEXT_PUBLIC_LOCAL_URL
      ? [new URL(process.env.NEXT_PUBLIC_LOCAL_URL).hostname]
      : [];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: localDevHosts(),
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
