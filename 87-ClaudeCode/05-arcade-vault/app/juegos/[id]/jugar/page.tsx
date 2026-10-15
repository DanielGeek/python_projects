import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/games";
import { GamePlayer } from "./game-player";

export function generateStaticParams() {
  return GAMES.filter((g) => g.src).map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/juegos/[id]/jugar">): Promise<Metadata> {
  const game = getGame((await params).id);
  return { title: game ? `Jugando ${game.title} · Arcade Vault` : "Arcade Vault" };
}

export default async function PlayPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  const game = getGame((await params).id);
  if (!game?.src) notFound();
  return <GamePlayer game={game} />;
}
