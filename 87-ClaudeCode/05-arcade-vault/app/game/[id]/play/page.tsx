import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GAMES, getGame } from "@/lib/games";
import { GamePlayer } from "./game-player";

export function generateStaticParams() {
  return GAMES.filter((g) => g.src).map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/game/[id]/play">): Promise<Metadata> {
  const game = getGame((await params).id);
  return { title: game ? `Playing ${game.title} · Arcade Vault` : "Arcade Vault" };
}

export default function PlayPage({ params }: PageProps<"/game/[id]/play">) {
  return (
    <Suspense fallback={null}>
      <Player params={params} />
    </Suspense>
  );
}

async function Player({ params }: { params: PageProps<"/game/[id]/play">["params"] }) {
  const game = getGame((await params).id);
  if (!game?.src) notFound();
  return <GamePlayer game={game} />;
}
