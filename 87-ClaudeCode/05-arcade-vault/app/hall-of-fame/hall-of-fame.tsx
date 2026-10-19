"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/basics";
import { Leaderboard, Podium } from "@/components/ui/game";
import { Tabs } from "@/components/ui/interactive";
import { GAMES } from "@/lib/games";
import { fetchTopScores, type LeaderboardResult } from "@/lib/leaderboard";
import { personalBest, type ScoreEntry } from "@/lib/scores";
import { useSession } from "@/lib/session";

const NO_ENTRIES: ScoreEntry[] = [];

export function HallOfFame() {
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [attempt, setAttempt] = useState(0);
  // The result remembers which game and attempt it answers, so a late response for another tab is ignored.
  const [loaded, setLoaded] = useState<{
    gameId: string;
    attempt: number;
    result: LeaderboardResult;
  } | null>(null);
  const session = useSession();
  const me = session && !session.guest ? session.name : undefined;

  useEffect(() => {
    let current = true;
    fetchTopScores(gameId).then((result) => {
      if (current) setLoaded({ gameId, attempt, result });
    });
    return () => {
      current = false;
    };
  }, [gameId, attempt]);

  const result =
    loaded && loaded.gameId === gameId && loaded.attempt === attempt ? loaded.result : null;
  const entries = result?.ok ? result.entries : NO_ENTRIES;
  return (
    <div className="av-hof">
      <Tabs
        label="Games"
        value={gameId}
        onChange={setGameId}
        tabs={GAMES.map((g) => ({ id: g.id, label: g.title }))}
      />
      <Podium key={`podium-${gameId}-${result?.ok}`} entries={entries} />
      {/* min-height keeps the page from jumping between loading, error, empty and data */}
      <div className="av-hof-results">
        {result?.ok ? (
          /* key re-runs the staggered row entrance when switching games */
          <Leaderboard
            key={gameId}
            entries={entries}
            title={false}
            currentPlayer={me}
            personalBest={me ? personalBest(entries, me) : undefined}
          />
        ) : (
          <section className="av-board" aria-label="Top scores">
            {result ? (
              <div className="av-hof-error">
                <div className="av-about-error" role="alert">
                  <span className="av-about-error-tag">[ERR]</span> Could not load the scores. Check
                  your connection and try again.
                </div>
                <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
                  Retry
                </Button>
              </div>
            ) : (
              <p className="av-board-empty" role="status">
                LOADING…
              </p>
            )}
          </section>
        )}
      </div>
      <div className="av-hof-back">
        <ButtonLink href="/library" size="lg">
          Back to the library
        </ButtonLink>
      </div>
    </div>
  );
}
