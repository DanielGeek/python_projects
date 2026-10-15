import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/basics";
import { GAMES, getGame } from "@/lib/games";
import { GameScores } from "./game-scores";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/juegos/[id]">): Promise<Metadata> {
  const game = getGame((await params).id);
  return { title: game ? `${game.title} · Arcade Vault` : "Juego no encontrado · Arcade Vault" };
}

export default async function GameDetail({ params }: PageProps<"/juegos/[id]">) {
  const game = getGame((await params).id);
  if (!game) notFound();

  return (
    <div className="av-container av-detail">
      <div className="av-detail-main">
        <span className="av-card-cat av-detail-cat" style={{ background: `var(--${game.accent})` }}>
          {game.category.toUpperCase()}
        </span>
        <h1 className="av-detail-title">{game.title}</h1>
        <p className="av-detail-desc">{game.description}</p>
        <p className="av-detail-controls">
          <span className="av-hud-label">CONTROLES</span>
          {game.controls}
        </p>
        <div className="av-detail-actions">
          {game.src ? (
            <ButtonLink href={`/juegos/${game.id}/jugar`} size="lg" pulse>
              Jugar ahora
            </ButtonLink>
          ) : (
            <span className="av-soon">PRÓXIMAMENTE EN EL VAULT</span>
          )}
          <ButtonLink href="/" variant="ghost">
            Volver al Vault
          </ButtonLink>
        </div>
      </div>
      <aside className="av-detail-side">
        <GameScores gameId={game.id} />
      </aside>
    </div>
  );
}
