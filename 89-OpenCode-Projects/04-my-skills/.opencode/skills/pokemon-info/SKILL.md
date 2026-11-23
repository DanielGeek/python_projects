---
name: Pokemon Info
description: Answer questions about Pokemon using live data from PokeAPI. Use this skill whenever the user mentions any Pokemon by name or Pokedex number, or asks about Pokemon types, stats, abilities, evolutions, Pokedex entries, or matchups and comparisons — even if they never say the word "Pokemon" (e.g. "what type is gengar", "tell me about #25", "who's stronger, blastoise or charizard?").
---

# Pokemon Info

Answer Pokemon questions with live data from PokeAPI (<https://pokeapi.co>). Do not answer from memory: stats, abilities, and even types changed between generations, and many Pokemon have regional or mega variants. Always check the API.

## How to fetch data

Run the bundled script (`scripts/fetch_pokemon.py`, relative to this skill's directory). Never fetch the raw endpoints with webfetch or curl: each response is ~100 KB of JSON, and the script prints only the fields that matter.

Battle data — types, abilities, base stats, height, weight, artwork:

```bash
python3 scripts/fetch_pokemon.py ditto
python3 scripts/fetch_pokemon.py 25
```

Pokedex entry — description, habitat, and the full evolution chain:

```bash
python3 scripts/fetch_pokemon.py charmander --species
```

Run both when the question needs battle data plus lore (e.g. "how does Charmander evolve and what are its stats?").

The script accepts names and Pokedex numbers, and normalizes special names automatically: "Mr. Mime" becomes mr-mime, "Nidoran♀" becomes nidoran-f.

## Handling failures

A 404 means the identifier does not exist. Read `references/special-names.md` and retry with the exact API identifier (variants use suffixes such as `raichu-alola` or `charizard-mega-x`). If it still fails, tell the user the Pokemon doesn't exist instead of guessing.

## Answering rules

- Report the data faithfully and include the Pokedex number.
- Run the script once per Pokemon; for comparisons, once per side.
- Answer in the user's language, but keep Pokemon names as printed by the script.
