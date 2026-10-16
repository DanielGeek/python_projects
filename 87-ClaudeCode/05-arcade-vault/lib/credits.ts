"use client";

import { useSyncExternalStore } from "react";

// One credit counter per device, shared by guests and signed-in players.
// BACKEND: if credits become per-account, replace readCredits/spendCredit/insertCoin with API calls
// and keep the exported signatures.
const KEY = "arcade-vault:credits";
const EVENT = "arcade-vault:credits";
export const INITIAL_CREDITS = 3;

export function readCredits(): number {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return INITIAL_CREDITS;
    const n = Number.parseInt(raw, 10);
    return Number.isInteger(n) && n >= 0 ? n : INITIAL_CREDITS;
  } catch {
    return INITIAL_CREDITS;
  }
}

function writeCredits(n: number) {
  try {
    window.localStorage.setItem(KEY, String(n));
  } catch {
    // Storage blocked: the balance simply does not persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Spends one credit. Returns false, and changes nothing, when the balance is 0. */
export function spendCredit(): boolean {
  const n = readCredits();
  if (n <= 0) return false;
  writeCredits(n - 1);
  return true;
}

/** Restores the balance to INITIAL_CREDITS. */
export function insertCoin() {
  writeCredits(INITIAL_CREDITS);
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
