"use client";

import { useState } from "react";
import { GameCard } from "@/components/ui/game";
import { SearchBar } from "@/components/ui/interactive";
import { CATEGORIES, GAMES, type Game } from "@/lib/games";
import { bestScore, useScores } from "@/lib/scores";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function LibraryCard({ game }: { game: Game }) {
  const scores = useScores(game.id);
  return (
    <GameCard
      href={`/game/${game.id}`}
      title={game.title}
      description={game.tagline}
      category={game.category}
      accent={game.accent}
      highScore={bestScore(scores)}
      available={game.src !== null}
    />
  );
}

export function Library() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const q = normalize(query.trim());
  const games = GAMES.filter(
    (g) => (category === "All" || g.category === category) && (!q || normalize(`${g.title} ${g.category}`).includes(q)),
  );
  return (
    <section aria-label="Game library" className="av-library">
      <SearchBar value={query} onChange={setQuery} categories={CATEGORIES} category={category} onCategoryChange={setCategory} />
      {games.length > 0 ? (
        <div className="av-grid-cards">
          {games.map((g) => (
            <LibraryCard key={g.id} game={g} />
          ))}
        </div>
      ) : (
        <p className="av-empty">No games match your search.</p>
      )}
    </section>
  );
}
