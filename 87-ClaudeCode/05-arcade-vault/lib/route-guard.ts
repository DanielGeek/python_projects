// SPEC 17. Who may open the protected routes. Pure, so proxy.ts and the tests share it.
// The guest cookie is written by the browser (lib/session.ts), so it is a UX gate and not a security
// boundary: a forged cookie only opens the player, and `anon` can already save a GUEST score without it.
// What protects data is RLS, not this.
export const GUEST_COOKIE = "arcade-vault-guest"; // value "1", Path=/, SameSite=Lax, 1 year, not httpOnly

export type Access = { allow: true } | { allow: false; redirect: string };

export interface AccessInput {
  pathname: string;
  /** A Supabase session verified by the proxy with getClaims(). */
  account: boolean;
  /** The guest cookie is present. */
  guest: boolean;
}

const PLAYER = /^\/game\/[^/]+\/play\/?$/;
const PROFILE = /^\/profile\/?$/;

function toLogin(pathname: string): Access {
  return { allow: false, redirect: `/login?next=${encodeURIComponent(pathname)}` };
}

export function decideAccess({ pathname, account, guest }: AccessInput): Access {
  if (PLAYER.test(pathname)) return account || guest ? { allow: true } : toLogin(pathname);
  // A guest does not pass: the profile is for accounts only.
  if (PROFILE.test(pathname)) return account ? { allow: true } : toLogin("/profile");
  return { allow: true };
}
