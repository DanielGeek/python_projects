import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/basics";
import { CoverArt } from "@/components/ui/game";
import { GAMES, getGame } from "@/lib/games";
import { GameScores } from "./game-scores";
import { GameStats } from "./game-stats";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/game/[id]">): Promise<Metadata> {
  const game = getGame((await params).id);
  return { title: game ? `${game.title} · Arcade Vault` : "Game not found · Arcade Vault" };
}

export default async function GameDetail({ params }: PageProps<"/game/[id]">) {
  const game = getGame((await params).id);
  if (!game) notFound();

  return (
    <div className="av-container av-detail">
      <div className="av-detail-main">
        <div className="av-detail-cover">
          <CoverArt id={game.id} />
        </div>
        <div className="av-detail-tags">
          <span className="av-card-cat av-detail-cat" style={{ background: `var(--${game.accent})` }}>
            {game.category.toUpperCase()}
          </span>
          {game.tags.map((t) => (
            <span key={t} className="av-detail-tag">
              {t}
            </span>
          ))}
        </div>
        <h1 className="av-detail-title">{game.title}</h1>
        <p className="av-detail-desc">{game.description}</p>
        <p className="av-detail-controls">
          <span className="av-hud-label">CONTROLS</span>
          {game.controls}
        </p>
        <GameStats gameId={game.id} plays={game.plays} difficulty={game.difficulty} />
        <div className="av-detail-actions">
          {game.src ? (
            <ButtonLink href={`/game/${game.id}/play`} size="lg" pulse>
              Play now
            </ButtonLink>
          ) : (
            <span className="av-soon">COMING SOON TO THE VAULT</span>
          )}
          <ButtonLink href="/" variant="ghost">
            Back to the Vault
          </ButtonLink>
        </div>
      </div>
      <aside className="av-detail-side">
        <GameScores gameId={game.id} />
      </aside>
    </div>
  );
}
