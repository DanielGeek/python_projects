import { createClient } from "./supabase/client";
import type { ScoreEntry } from "./scores";

export type LeaderboardResult = { ok: true; entries: ScoreEntry[] } | { ok: false };

interface ScoreRow {
  player: string;
  score: number;
  created_at: string;
}

const LIMIT = 50;

/** Maps a `scores` row to the shape the Leaderboard and Podium already use. */
export function rowToEntry(row: ScoreRow): ScoreEntry {
  return { player: row.player, score: row.score, date: row.created_at };
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
