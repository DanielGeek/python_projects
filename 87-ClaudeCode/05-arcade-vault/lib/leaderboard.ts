import { createClient } from "./supabase/client";
import type { ScoreEntry } from "./scores";

export type LeaderboardResult = { ok: true; entries: ScoreEntry[] } | { ok: false };

interface ScoreRow {
  player: string;
  score: number;
  created_at: string;
}

const LIMIT = 50;
const PLAYER_MAX = 20;
// Same bounds as the insert policy on `scores`; the policy is the authority, this avoids a request
// that is certain to be rejected.
const SCORE_MAX = 9_999_999;

export interface ScoreInput {
  gameId: string;
  player: string;
  score: number;
}

/** What goes into the insert, or null when the input cannot be a valid score. */
export function toScoreRow(
  input: ScoreInput,
): { game_id: string; player: string; score: number } | null {
  const player = input.player.trim().slice(0, PLAYER_MAX);
  if (!player) return null;
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > SCORE_MAX) return null;
  return { game_id: input.gameId, player, score: input.score };
}

/** Maps a `scores` row to the shape the Leaderboard and Podium already use. */
export function rowToEntry(row: ScoreRow): ScoreEntry {
  return { player: row.player, score: row.score, date: row.created_at };
}

/** Inserts one score. Never throws: resolves true when saved, false on any failure. */
export async function submitScore(input: ScoreInput): Promise<boolean> {
  const row = toScoreRow(input);
  if (!row) {
    console.error("[leaderboard] score not sent: invalid name or score", input.gameId);
    return false;
  }
  try {
    // No .select(): it needs only the insert policy and does not read the row back.
    const { error } = await createClient().from("scores").insert(row);
    if (error) {
      console.error(`[leaderboard] could not save the score for ${row.game_id}`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[leaderboard] could not save the score for ${row.game_id}`, error);
    return false;
  }
}

/** Top 50 scores of a game, best first. Never throws: failures come back as { ok: false }. */
export async function fetchTopScores(gameId: string): Promise<LeaderboardResult> {
  try {
    const { data, error } = await createClient()
      .from("scores")
      .select("player, score, created_at")
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(LIMIT);
    if (error) {
      console.error(`[leaderboard] could not load scores for ${gameId}`, error);
      return { ok: false };
    }
    return { ok: true, entries: (data as ScoreRow[]).map(rowToEntry) };
  } catch (error) {
    console.error(`[leaderboard] could not load scores for ${gameId}`, error);
    return { ok: false };
  }
}
