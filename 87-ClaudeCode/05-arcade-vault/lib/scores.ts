"use client";

import { useSyncExternalStore } from "react";
import { GAMES } from "./games";

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
const PREFIX = "arcade-vault:scores:";
const KEY = (gameId: string) => `${PREFIX}${gameId}`;
const EVENT = "arcade-vault:scores";
const EMPTY: ScoreEntry[] = [];
const cache = new Map<string, { raw: string | null; list: ScoreEntry[] }>();
// Lists whose last write failed (storage full or blocked). They answer reads for this page view.
const unsaved = new Map<string, ScoreEntry[]>();

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== "object" || value === null) return false;
  const { player, score, date } = value as Record<string, unknown>;
  return (
    typeof player === "string" &&
    typeof score === "number" &&
    Number.isFinite(score) &&
    typeof date === "string"
  );
}

/** Parses a stored list, drops malformed entries and sorts best first. Throws on a non-list. */
function parseScores(raw: string): ScoreEntry[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Stored scores are not a list");
  const list = data.filter(isScoreEntry);
  if (list.length < data.length) {
    console.warn(`[scores] dropped ${data.length - list.length} invalid entries`);
  }
  return list.sort((a, b) => b.score - a.score);
}

export function readScores(gameId: string): ScoreEntry[] {
  const kept = unsaved.get(gameId);
  if (kept) return kept;
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
    list = raw ? parseScores(raw) : EMPTY;
  } catch (error) {
    console.warn(`[scores] unreadable data for ${gameId}`, error);
    list = EMPTY;
  }
  cache.set(gameId, { raw, list });
  return list;
}

/** Returns false when the score could not be persisted; it is then kept in memory only. */
export function saveScore(gameId: string, entry: ScoreEntry): boolean {
  const list = [...readScores(gameId), entry].sort((a, b) => b.score - a.score).slice(0, 50);
  let saved = true;
  try {
    window.localStorage.setItem(KEY(gameId), JSON.stringify(list));
    unsaved.delete(gameId);
  } catch (error) {
    saved = false;
    unsaved.set(gameId, list);
    console.warn(`[scores] could not persist scores for ${gameId}`, error);
  }
  window.dispatchEvent(new Event(EVENT));
  return saved;
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useScores(gameId: string): ScoreEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => readScores(gameId),
    () => EMPTY,
  );
}

/**
 * Removes the localStorage score lists of games that are not in GAMES anymore (SPEC 08).
 * Only keys under the scores prefix are looked at, so the session and the credits are never touched.
 * Never throws: when storage is blocked there is nothing to purge.
 */
export function purgeRemovedGameScores(): void {
  try {
    const known = new Set(GAMES.map((g) => g.id));
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PREFIX) && !known.has(key.slice(PREFIX.length))) stale.push(key);
    }
    for (const key of stale) window.localStorage.removeItem(key);
    if (stale.length) window.dispatchEvent(new Event(EVENT));
  } catch (error) {
    console.warn("[scores] could not purge the scores of removed games", error);
  }
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
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ---------- Cross-game activity (landing page) ----------

export interface ActivityEntry extends ScoreEntry {
  gameId: string;
}

const EMPTY_ALL: ActivityEntry[] = [];
let allCache: { lists: ScoreEntry[][]; all: ActivityEntry[] } | null = null;

/** Every saved score of every game in GAMES. The array identity only changes when a list changed. */
export function readAllScores(): ActivityEntry[] {
  const lists = GAMES.map((g) => readScores(g.id));
  if (allCache && allCache.lists.every((l, i) => l === lists[i])) return allCache.all;
  const flat = lists.flatMap((list, i) => list.map((e) => ({ ...e, gameId: GAMES[i].id })));
  const all = flat.length ? flat : EMPTY_ALL;
  allCache = { lists, all };
  return all;
}

export function useAllScores(): ActivityEntry[] {
  return useSyncExternalStore(subscribe, readAllScores, () => EMPTY_ALL);
}

/** Newest first, by `date`. */
export function latestScores(all: ActivityEntry[], limit = 7): ActivityEntry[] {
  return [...all]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export interface TopPlayer {
  player: string;
  score: number;
  gameId: string;
}

/** Best single score per player among entries dated today (local time), best first. */
export function topPlayersToday(all: ActivityEntry[], now: Date, limit = 5): TopPlayer[] {
  const today = now.toDateString();
  const best = new Map<string, TopPlayer>();
  for (const e of all) {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime()) || d.toDateString() !== today) continue;
    const prev = best.get(e.player);
    if (!prev || e.score > prev.score)
      best.set(e.player, { player: e.player, score: e.score, gameId: e.gameId });
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/** "just now", "2 min ago", "3 h ago", "2 d ago", or a formatted date after 7 days. */
export function timeAgo(iso: string, now: Date): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return formatDate(iso);
  const sec = Math.floor((now.getTime() - t) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d} d ago` : formatDate(iso);
}
