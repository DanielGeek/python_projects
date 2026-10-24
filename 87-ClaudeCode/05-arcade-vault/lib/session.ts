"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "./supabase/client";

export interface Session {
  name: string;
  guest: boolean;
  /** Set only for a Supabase account; a guest has no user id. */
  userId?: string;
}

// An account comes from Supabase Auth (the session lives in its own cookies, the username in
// `profiles`). A guest is a local stand-in kept in localStorage; it never touches Supabase.
// Only one of them exists at a time: signing in clears the guest, and playing as a guest signs out.
const KEY = "arcade-vault:session";
const EVENT = "arcade-vault:session";
let cached: { raw: string | null; session: Session | null } = { raw: null, session: null };

// Answers when localStorage is blocked: the guest then lasts only for this page view.
let memory: Session | null = null;
let degraded = false;

// The signed-in account. Replaced as a whole, so useSyncExternalStore sees a stable snapshot.
let account: Session | null = null;
let watching = false;

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const { name, guest } = value as Record<string, unknown>;
  return typeof name === "string" && name.length > 0 && typeof guest === "boolean";
}

function readGuest(): Session | null {
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

export function readSession(): Session | null {
  return account ?? readGuest();
}

/** Returns false when the guest could not be persisted; it is then kept in memory only. */
function writeGuest(session: Session | null): boolean {
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

function setAccount(next: Session | null) {
  if (next) writeGuest(null);
  account = next;
  window.dispatchEvent(new Event(EVENT));
}

/** Loads the username of a signed-in user. Without a profile there is no usable account. */
async function loadAccount(userId: string): Promise<Session | null> {
  try {
    const { data, error } = await createClient()
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      console.error("[session] could not load the profile", error);
      return null;
    }
    return { name: data.username, guest: false, userId };
  } catch (error) {
    console.error("[session] could not load the profile", error);
    return null;
  }
}

// Starts once, on the first subscriber. Supabase fires INITIAL_SESSION right away, so a reload
// restores the account.
function watchAccount() {
  if (watching) return;
  watching = true;
  try {
    createClient().auth.onAuthStateChange((_event, authSession) => {
      const userId = authSession?.user.id;
      // Do not call Supabase inside this callback: it can deadlock the auth client.
      setTimeout(async () => {
        if (!userId) return setAccount(null);
        if (account?.userId === userId) return;
        setAccount(await loadAccount(userId));
      }, 0);
    });
  } catch (error) {
    // Missing public variables: the app keeps working with guests only.
    console.error("[session] auth is not available", error);
  }
}

async function endAccount(): Promise<void> {
  try {
    await createClient().auth.signOut();
  } catch (error) {
    console.error("[session] could not sign out of Supabase", error);
  }
  setAccount(null);
}

export async function playAsGuest(): Promise<boolean> {
  if (account) await endAccount();
  return writeGuest({ name: "GUEST", guest: true });
}

export async function signOut(): Promise<void> {
  writeGuest(null);
  if (account) await endAccount();
}

export function subscribe(cb: () => void) {
  watchAccount();
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
