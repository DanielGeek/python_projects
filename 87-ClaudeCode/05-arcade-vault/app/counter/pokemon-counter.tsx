"use client";

import { useState } from "react";

const MAX_POKEMON = 1025;

function artworkUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function PokemonCounter() {
  const [count, setCount] = useState(1);
  // Wraps around so the counter never points past the last Pokémon.
  const pokemonId = ((count - 1) % MAX_POKEMON) + 1;

  return (
    <section style={{ display: "grid", justifyItems: "center", gap: 16, padding: "48px 16px" }}>
      <h1 className="av-pixel av-neon-yellow">POKÉMON COUNTER</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={pokemonId}
        src={artworkUrl(pokemonId)}
        alt={`Pokémon #${pokemonId}`}
        width={256}
        height={256}
      />
      <p className="av-pixel">#{pokemonId}</p>
      <button type="button" className="av-pixel" onClick={() => setCount((c) => c + 1)}>
        CLICKS: {count}
      </button>
    </section>
  );
}
