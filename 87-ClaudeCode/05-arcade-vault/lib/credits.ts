"use client";

import { useSyncExternalStore } from "react";

// One credit counter per device, shared by guests and signed-in players.
// BACKEND: if credits become per-account, replace readCredits/spendCredit/insertCoin with API calls
// and keep the exported signatures.
const KEY = "arcade-vault:credits";
const EVENT = "arcade-vault:credits";
export const INITIAL_CREDITS = 3;

// Last known balance. It answers when localStorage cannot (blocked or full), so the balance still
// goes down for this page view instead of resetting to INITIAL_CREDITS on every read.
let memory = INITIAL_CREDITS;
let degraded = false;

export function readCredits(): number {
  if (degraded) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return (memory = INITIAL_CREDITS);
    // Strict digits only: parseInt would accept "2abc" and a tampered value must not grant credits.
    const n = /^\d+$/.test(raw) ? Number(raw) : 0;
    return (memory = Number.isSafeInteger(n) ? n : 0);
  } catch {
    degraded = true;
    return memory;
  }
}

/** Returns false when the balance could not be persisted; it is then kept in memory only. */
function writeCredits(n: number): boolean {
  memory = n;
  let saved = true;
  try {
    window.localStorage.setItem(KEY, String(n));
  } catch (error) {
    saved = false;
    degraded = true;
    console.warn("[credits] could not persist the balance", error);
  }
  window.dispatchEvent(new Event(EVENT));
  return saved;
}

/** Spends one credit. Returns false, and changes nothing, when the balance is 0. */
export function spendCredit(): boolean {
  const n = readCredits();
  if (n <= 0) return false;
  writeCredits(n - 1);
  return true;
}

/** Restores the balance to INITIAL_CREDITS. Returns false when it could not be persisted. */
export function insertCoin(): boolean {
  return writeCredits(INITIAL_CREDITS);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCredits(): number {
  return useSyncExternalStore(subscribe, readCredits, () => INITIAL_CREDITS);
}
