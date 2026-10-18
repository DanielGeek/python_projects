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

// Answers when localStorage is blocked: the session then lasts only for this page view.
let memory: Session | null = null;
let degraded = false;

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const { name, guest } = value as Record<string, unknown>;
  return typeof name === "string" && name.length > 0 && typeof guest === "boolean";
}

export function readSession(): Session | null {
  if (degraded) return memory;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    degraded = true;
    return memory;
  }
  if (raw === cached.raw) return cached.session;
  let session: Session | null = null;
  try {
    const data: unknown = raw ? JSON.parse(raw) : null;
    session = isSession(data) ? data : null;
  } catch {
    session = null;
  }
  if (raw && !session) console.warn("[session] ignored an invalid stored session");
  cached = { raw, session };
  return session;
}

/** Returns false when the session could not be persisted; it is then kept in memory only. */
function write(session: Session | null): boolean {
  memory = session;
  let saved = true;
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch (error) {
    saved = false;
    degraded = true;
    console.warn("[session] could not persist the session", error);
  }
  window.dispatchEvent(new Event(EVENT));
  return saved;
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
  return useSyncExternalStore(subscribe, readSession, () => null);
}
