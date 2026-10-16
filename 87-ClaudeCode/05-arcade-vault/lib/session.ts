"use client";

import { useSyncExternalStore } from "react";

export interface Session {
  name: string;
  guest: boolean;
}

// Local stand-in for authentication so the screens work end to end.
// BACKEND: replace signIn/signUp/signOut with the real provider (REST auth endpoints,
// Supabase Auth with email + Google/GitHub OAuth, etc.). Never store passwords here.
const KEY = "arcade-vault:session";
const EVENT = "arcade-vault:session";
let cached: { raw: string | null; session: Session | null } = { raw: null, session: null };

function read(): Session | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cached.raw) return cached.session;
  let session: Session | null = null;
  try {
    session = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    session = null;
  }
  cached = { raw, session };
  return session;
}

function write(session: Session | null) {
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Blocked storage: the session lasts only for this page view.
  }
  window.dispatchEvent(new Event(EVENT));
}

export const signIn = (name: string) => write({ name: name.trim().toUpperCase(), guest: false });
export const playAsGuest = () => write({ name: "GUEST", guest: true });
export const signOut = () => write(null);

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
