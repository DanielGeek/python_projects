"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/basics";
import { Leaderboard, Podium } from "@/components/ui/game";
import { Tabs } from "@/components/ui/interactive";
import { GAMES } from "@/lib/games";
import { personalBest, useScores } from "@/lib/scores";
import { useSession } from "@/lib/session";

export function HallOfFame() {
  const [gameId, setGameId] = useState(GAMES[0].id);
  const scores = useScores(gameId);
  const session = useSession();
  const me = session && !session.guest ? session.name : undefined;
  return (
    <div className="av-hof">
      <Tabs label="Games" value={gameId} onChange={setGameId} tabs={GAMES.map((g) => ({ id: g.id, label: g.title }))} />
      <Podium key={`podium-${gameId}`} entries={scores} />
      {/* key re-runs the staggered row entrance when switching games */}
      <Leaderboard key={gameId} entries={scores} title={false} currentPlayer={me} personalBest={me ? personalBest(scores, me) : undefined} />
      <div className="av-hof-back">
        <ButtonLink href="/" size="lg">
          Back to the library
        </ButtonLink>
      </div>
    </div>
  );
}
