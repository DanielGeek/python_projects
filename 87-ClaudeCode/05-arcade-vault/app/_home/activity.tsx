"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatScore } from "@/components/ui/basics";
import { GAMES, getGame } from "@/lib/games";
import { latestScores, timeAgo, topPlayersToday, useAllScores } from "@/lib/scores";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

const EMPTY = "No scores yet. Be the first to play!";

export function Activity() {
  const all = useAllScores();
  // Relative times are computed when the scores change; there is no timer.
  // With no scores (always the case on the server) the clock is not read, so prerendering stays pure.
  const { latest, top } = useMemo(() => {
    if (all.length === 0) return { latest: [], top: [] };
    const now = new Date();
    return { latest: latestScores(all, 7).map((e) => ({ ...e, ago: timeAgo(e.date, now) })), top: topPlayersToday(all, now, 5) };
  }, [all]);
  const best = top[0]?.score ?? 1;

  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="// 03" tone="yellow" title="LIVE ACTIVITY" />
      <div className="av-home-activity">
        <div className="av-home-ac">
          <div className="av-home-ac-head">
            <div className="av-home-ac-title av-pixel">▸ LATEST SCORES</div>
          </div>
          {latest.length === 0 ? (
            <p className="av-home-empty">{EMPTY}</p>
          ) : (
            <div className="av-home-ticker">
              {latest.map((r, i) => {
                const game = getGame(r.gameId) ?? GAMES[0];
                return (
                  <div key={`${r.gameId}-${r.player}-${r.date}-${i}`} className="av-home-tick" style={{ animationDelay: `${i * 60}ms` }}>
                    <span className={`av-home-tick-p av-neon-${game.accent}`}>{r.player}</span>
                    <span className="av-home-tick-mid">▸ {game.title}</span>
                    <span className="av-home-tick-s">+{formatScore(r.score)}</span>
                    <span className="av-home-tick-t">{r.ago}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="av-home-ac">
          <div className="av-home-ac-head">
            <div className="av-home-ac-title av-pixel">▸ TOP PLAYERS · TODAY</div>
            <Link href="/hall-of-fame" className="av-home-link">
              VIEW HALL →
            </Link>
          </div>
          {top.length === 0 ? (
            <p className="av-home-empty">{EMPTY}</p>
          ) : (
            <div className="av-home-top">
              {top.map((r, i) => (
                <div
                  key={r.player}
                  className={`av-home-toprow${i < 3 ? ` av-home-toprow-${i + 1}` : ""}`}
                  style={{ "--bar": Math.max(0.08, r.score / best) } as React.CSSProperties}
                >
                  <span className="av-home-toprow-rk">#{String(i + 1).padStart(2, "0")}</span>
                  <span className="av-home-toprow-p">{r.player}</span>
                  <span className="av-home-toprow-s">{formatScore(r.score)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
