"use client";

import { formatScore } from "@/components/ui/basics";
import { bestScore, useScores } from "@/lib/scores";

export function GameStats({ gameId, plays, difficulty }: { gameId: string; plays: string; difficulty: number }) {
  const best = bestScore(useScores(gameId));
  return (
    <dl className="av-stats">
      <div>
        <dt>PLAYS</dt>
        <dd>{plays}</dd>
      </div>
      <div>
        <dt>GLOBAL BEST</dt>
        <dd className="av-stat-best">{best == null ? "—" : formatScore(best)}</dd>
      </div>
      <div>
        <dt>DIFFICULTY</dt>
        <dd className="av-stat-stars" aria-label={`Difficulty ${difficulty} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (i < difficulty ? "★" : "☆")).join(" ")}
        </dd>
      </div>
    </dl>
  );
}
