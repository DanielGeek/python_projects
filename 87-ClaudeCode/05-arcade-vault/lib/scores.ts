"use client";

import { useSyncExternalStore } from "react";

export interface ScoreEntry {
  player: string;
  score: number;
  /** ISO date string. */
  date: string;
}

// Guest and signed-in scores both live in localStorage for now.
// BACKEND: for signed-in players, replace readScores/saveScore with calls to the real API
// (e.g. GET/POST /api/scores?game=<id>, or a Supabase `scores` table with
// user_id, game_id, score, created_at) and keep localStorage only for guests.
const KEY = (gameId: string) => `arcade-vault:scores:${gameId}`;
const EVENT = "arcade-vault:scores";
const EMPTY: ScoreEntry[] = [];
const cache = new Map<string, { raw: string | null; list: ScoreEntry[] }>();

export function readScores(gameId: string): ScoreEntry[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY(gameId));
  } catch {
    return EMPTY;
  }
  const hit = cache.get(gameId);
  if (hit && hit.raw === raw) return hit.list;
  let list: ScoreEntry[] = EMPTY;
  try {
    list = raw ? (JSON.parse(raw) as ScoreEntry[]).sort((a, b) => b.score - a.score) : EMPTY;
  } catch {
    list = EMPTY;
  }
  cache.set(gameId, { raw, list });
  return list;
}

export function saveScore(gameId: string, entry: ScoreEntry) {
  const list = [...readScores(gameId), entry].sort((a, b) => b.score - a.score).slice(0, 50);
  try {
    window.localStorage.setItem(KEY(gameId), JSON.stringify(list));
  } catch {
    // Storage full or blocked: the score is simply not kept.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useScores(gameId: string): ScoreEntry[] {
  return useSyncExternalStore(subscribe, () => readScores(gameId), () => EMPTY);
}

export function bestScore(list: ScoreEntry[]): number | null {
  return list.length ? list[0].score : null;
}

export function personalBest(list: ScoreEntry[], player: string) {
  const i = list.findIndex((e) => e.player === player);
  return i < 0 ? undefined : { rank: i + 1, score: list[i].score, date: formatDate(list[i].date) };
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
}
