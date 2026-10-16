"use client";

import { Leaderboard } from "@/components/ui/game";
import { useScores } from "@/lib/scores";
import { useSession } from "@/lib/session";

export function GameScores({ gameId }: { gameId: string }) {
  const scores = useScores(gameId);
  const session = useSession();
  return <Leaderboard entries={scores} showDate={false} currentPlayer={session?.guest ? undefined : session?.name} />;
}
