"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatScore } from "@/components/ui/basics";
import { GAMES, getGame } from "@/lib/games";
import { latestScores, timeAgo, topPlayersToday, useAllScores } from "@/lib/scores";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

const EMPTY = "No scores yet. Be the first to play!";

function Empty() {
  return (
    <div className="av-home-empty">
      <svg className="av-home-empty-sprite" viewBox="0 0 11 8" aria-hidden="true">
        <path
          fill="currentColor"
          d="M2 0h1v1h1v1h3V1h1V0h1v1h0v1h1v1h1v3h-1v1h-1V6h-1v1H8v1H7V7H4v1H3V7H2V6H1v1H0V3h1V2h1V1H2zM3 3v1h1V3zm4 0v1h1V3z"
          fillRule="evenodd"
        />
      </svg>
      <p className="av-home-empty-msg">{EMPTY}</p>
      <div className="av-home-empty-wait av-pixel">
        AWAITING PLAYER 1<span className="av-home-eyebrow-caret">_</span>
      </div>
      <Link href="/library" className="av-home-link">
        PICK A GAME →
      </Link>
    </div>
  );
}

export function Activity() {
  const all = useAllScores();
  // Relative times are computed when the scores change; there is no timer.
  // With no scores (always the case on the server) the clock is not read, so prerendering stays pure.
  const { latest, top } = useMemo(() => {
    if (all.length === 0) return { latest: [], top: [] };
    const now = new Date();
    return {
      latest: latestScores(all, 7).map((e) => ({ ...e, ago: timeAgo(e.date, now) })),
      top: topPlayersToday(all, now, 5),
    };
  }, [all]);
  const best = top[0]?.score ?? 1;

  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="STAGE 03" tone="yellow" title="LIVE ACTIVITY" />
      <div className="av-home-activity">
        <div className="av-home-ac">
          <div className="av-home-ac-head">
            <div className="av-home-ac-title av-pixel">
              <span className="av-home-live" aria-hidden="true" />
              LATEST SCORES
            </div>
          </div>
          {latest.length === 0 ? (
            <Empty />
          ) : (
            <div className="av-home-ticker">
              {latest.map((r, i) => {
                const game = getGame(r.gameId) ?? GAMES[0];
                return (
                  <div
                    key={`${r.gameId}-${r.player}-${r.date}-${i}`}
                    className="av-home-tick"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="av-home-tick-who">
                      <span className={`av-home-tick-p av-neon-${game.accent}`}>{r.player}</span>
                      <span className="av-home-tick-mid">{game.title}</span>
                    </span>
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
            <div className="av-home-ac-title av-pixel">TOP PLAYERS · TODAY</div>
            <Link href="/hall-of-fame" className="av-home-link">
              VIEW HALL →
            </Link>
          </div>
          {top.length === 0 ? (
            <Empty />
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
