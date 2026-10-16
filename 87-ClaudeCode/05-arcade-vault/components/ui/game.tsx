"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { Accent } from "@/lib/games";
import type { ScoreEntry } from "@/lib/scores";
import { formatDate } from "@/lib/scores";
import { Button, ScoreBadge, cx, formatScore } from "./basics";

const ART: Record<Accent, string> = { cyan: "var(--cyan)", magenta: "var(--magenta)", yellow: "var(--yellow)", green: "var(--green)" };

export function CoverArt({ id }: { id: string }) {
  return <div className={`av-cover av-cover-${id}`} aria-hidden />;
}

export function GameCard({
  id,
  href,
  title,
  description,
  category,
  accent = "cyan",
  highScore,
  available = true,
}: {
  /** Game id, selects the cover art. */
  id: string;
  href: string;
  title: string;
  description: string;
  category?: string;
  accent?: Accent;
  highScore: number | null;
  available?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px) scale(1.03)`;
  }
  return (
    <article
      ref={ref}
      className="av-card"
      style={{ "--av-art": ART[accent] } as CSSProperties}
      onMouseMove={move}
      onMouseLeave={() => ref.current && (ref.current.style.transform = "")}
    >
      <div className="av-card-art">
        {category && <span className="av-card-cat">{category.toUpperCase()}</span>}
        <CoverArt id={id} />
        <div className="av-card-badge">
          <ScoreBadge score={highScore} />
        </div>
      </div>
      <div className="av-card-body">
        <h3 className="av-card-title">{title}</h3>
        <p className="av-card-desc">{description}</p>
        {available ? (
          <Link href={href} className="av-btn av-btn-outline av-btn-block" aria-label={`Play ${title}`}>
            Play
          </Link>
        ) : (
          <Button variant="outline" block disabled>
            Coming soon
          </Button>
        )}
      </div>
    </article>
  );
}

export function HUD({
  score,
  lives,
  maxLives = 3,
  level,
  player,
  paused,
  onPause,
  onExit,
}: {
  score: number;
  lives: number | null;
  maxLives?: number;
  level: number | null;
  player: string;
  paused: boolean;
  onPause: () => void;
  onExit: () => void;
}) {
  const pips = Math.max(maxLives, lives ?? 0);
  return (
    <div className="av-hud">
      <div className="av-hud-stat">
        <span className="av-hud-label">SCORE</span>
        <span className="av-hud-value av-hud-score">{String(score).padStart(6, "0")}</span>
      </div>
      {lives != null && (
        <div className="av-hud-stat">
          <span className="av-hud-label">LIVES</span>
          <span className="av-lives" aria-label={`${lives} lives`}>
            {Array.from({ length: pips }, (_, i) => (
              <span key={i} className={cx("av-life", i >= lives && "av-life-off")} />
            ))}
          </span>
        </div>
      )}
      <div className="av-hud-stat">
        <span className="av-hud-label">LEVEL</span>
        <span className="av-hud-value">{level ?? 1}</span>
      </div>
      <div className="av-hud-stat">
        <span className="av-hud-label">PLAYER</span>
        <span className="av-hud-player">{player}</span>
      </div>
      <div className="av-hud-actions">
        <Button variant="outline" size="sm" onClick={onPause}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onExit}>
          Exit
        </Button>
      </div>
    </div>
  );
}

export function CRTScreen({ children, aspect = "4 / 3", on = true, overlay }: { children: ReactNode; aspect?: string; on?: boolean; overlay?: ReactNode }) {
  return (
    <div className="av-crt">
      <div className="av-crt-screen" style={{ aspectRatio: aspect }}>
        {children}
        {overlay}
      </div>
      <div className="av-crt-foot">
        <span className="av-crt-brand">ARCADE VAULT</span>
        <span className={cx("av-led", on && "av-led-on")} aria-hidden />
      </div>
    </div>
  );
}

export function Leaderboard({
  entries,
  title = "Top scores",
  currentPlayer,
  personalBest,
  showDate = true,
  limit = 10,
}: {
  entries: ScoreEntry[];
  title?: string | false;
  currentPlayer?: string;
  personalBest?: { rank: number; score: number; date: string };
  showDate?: boolean;
  limit?: number;
}) {
  const rows = entries.slice(0, limit);
  return (
    <section className="av-board" aria-label={title || "Top scores"}>
      {title !== false && <h3 className="av-board-title">{title}</h3>}
      {rows.length === 0 ? (
        <p className="av-board-empty">No scores yet. Be the first to play!</p>
      ) : (
        <table className="av-table">
          <thead>
            <tr>
              <th scope="col">RANK</th>
              <th scope="col">PLAYER</th>
              <th scope="col" className="av-num">
                SCORE
              </th>
              {showDate && (
                <th scope="col" className="av-num">
                  DATE
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const you = !!currentPlayer && r.player === currentPlayer;
              return (
                <tr key={`${r.player}-${r.date}-${i}`} className={cx("av-row-in", i < 3 && `av-medal-${i + 1}`, you && "av-you")} style={{ animationDelay: `${i * 70}ms` }}>
                  <td className="av-rank">{String(i + 1).padStart(2, "0")}</td>
                  <td className="av-player">
                    {r.player}
                    {you && <span className="av-you-tag">YOU</span>}
                  </td>
                  <td className="av-num av-score">{formatScore(r.score)}</td>
                  {showDate && <td className="av-num av-date">{formatDate(r.date)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {personalBest && (
        <div className="av-pb">
          <span className="av-pb-label">YOUR PERSONAL BEST</span>
          <span className="av-date">
            #{personalBest.rank} · {personalBest.date}
          </span>
          <span className="av-pb-score">{formatScore(personalBest.score)}</span>
        </div>
      )}
    </section>
  );
}
