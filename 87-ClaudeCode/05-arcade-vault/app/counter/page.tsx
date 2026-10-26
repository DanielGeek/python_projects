import type { Metadata } from "next";
import { PokemonCounter } from "./pokemon-counter";

export const metadata: Metadata = { title: "Counter · Arcade Vault" };

export default function CounterPage() {
  return <PokemonCounter />;
}
