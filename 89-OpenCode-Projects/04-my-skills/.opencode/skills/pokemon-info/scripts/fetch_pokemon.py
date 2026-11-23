#!/usr/bin/env python3
"""Summarize Pokemon data from PokeAPI.

Usage:
    python3 fetch_pokemon.py <name-or-id>
    python3 fetch_pokemon.py <name-or-id> --species
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request

BASE_URL = "https://pokeapi.co/api/v2"
REQUEST_TIMEOUT_SECONDS = 15
REQUEST_HEADERS = {"User-Agent": "opencode-skill/pokemon-info"}
EVOLUTION_DETAIL_KEYS = (
    "trigger",
    "min_level",
    "item",
    "held_item",
    "known_move",
    "known_move_type",
    "min_happiness",
    "min_affection",
    "time_of_day",
    "location",
    "needs_overworld_rain",
    "turn_upside_down",
)


def normalize_identifier(raw):
    """Convert a display name such as 'Mr. Mime' into its API identifier."""
    identifier = raw.strip().lower()
    identifier = identifier.replace("♀", "-f").replace("♂", "-m")
    identifier = re.sub(r"[.'’´:]", "", identifier)
    return identifier.replace(" ", "-")


def fetch_json(url):
    request = urllib.request.Request(url, headers=REQUEST_HEADERS)
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode())


def english_value(entries, field):
    """Return the requested field from the first English entry."""
    for entry in entries:
        if entry["language"]["name"] == "en":
            return entry[field]
    return None


def print_battle_summary(identifier):
    data = fetch_json(f"{BASE_URL}/pokemon/{identifier}")

    print(f"Name: {data['name']} (id {data['id']})")
    print(f"Types: {' / '.join(slot['type']['name'] for slot in data['types'])}")
    print(f"Height: {data['height'] / 10} m")
    print(f"Weight: {data['weight'] / 10} kg")

    print("Abilities:")
    for entry in data["abilities"]:
        hidden = " (hidden)" if entry["is_hidden"] else ""
        print(f"  - {entry['ability']['name']}{hidden}")

    print("Base stats:")
    total = sum(entry["base_stat"] for entry in data["stats"])
    for entry in data["stats"]:
        print(f"  {entry['stat']['name']}: {entry['base_stat']}")
    print(f"  total: {total}")

    sprites = (data.get("sprites") or {}).get("other", {}).get("official-artwork", {})
    artwork = sprites.get("front_default")
    if artwork:
        print(f"Official artwork: {artwork}")

    cry = (data.get("cries") or {}).get("latest")
    if cry:
        print(f"Cry: {cry}")


def format_evolution_details(details):
    """List unique evolution conditions; the API repeats one per game generation."""
    conditions = []
    for detail in details:
        parts = []
        for key in EVOLUTION_DETAIL_KEYS:
            value = detail.get(key)
            if not value:
                continue
            if isinstance(value, dict):
                value = value.get("name")
            if isinstance(value, bool):
                parts.append(key.replace("_", " "))
            else:
                parts.append(f"{key.replace('_', ' ')} {value}")
        condition = ", ".join(parts)
        if condition and condition not in conditions:
            conditions.append(condition)
    return " / ".join(conditions)


def print_evolution_chain(node, depth=0):
    line = f"{'  ' * depth}- {node['species']['name']}"
    details = format_evolution_details(node.get("evolution_details", []))
    if details:
        line += f" ({details})"
    print(line)
    for child in node.get("evolves_to", []):
        print_evolution_chain(child, depth + 1)


def print_species_summary(identifier):
    data = fetch_json(f"{BASE_URL}/pokemon-species/{identifier}")

    print(f"Species: {data['name']} (id {data['id']})")

    genus = english_value(data.get("genera", []), "genus")
    if genus:
        print(f"Genus: {genus}")

    traits = {
        "Color": (data.get("color") or {}).get("name"),
        "Shape": (data.get("shape") or {}).get("name"),
        "Habitat": (data.get("habitat") or {}).get("name"),
        "Growth rate": (data.get("growth_rate") or {}).get("name"),
    }
    parts = [f"{label}: {value}" for label, value in traits.items() if value]
    if parts:
        print(" | ".join(parts))

    if data.get("is_legendary"):
        print("Legendary: yes")
    if data.get("is_mythical"):
        print("Mythical: yes")

    flavor = english_value(data.get("flavor_text_entries", []), "flavor_text")
    if flavor:
        print(f"Pokedex entry: {' '.join(flavor.split())}")

    chain_url = (data.get("evolution_chain") or {}).get("url")
    if chain_url:
        print("Evolution chain:")
        print_evolution_chain(fetch_json(chain_url)["chain"])


def parse_args():
    parser = argparse.ArgumentParser(description="Summarize Pokemon data from PokeAPI.")
    parser.add_argument("pokemon", help="Pokemon name or Pokedex number")
    parser.add_argument(
        "--species",
        action="store_true",
        help="show the Pokedex entry and evolution chain instead of battle data",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    identifier = normalize_identifier(args.pokemon)
    try:
        if args.species:
            print_species_summary(identifier)
        else:
            print_battle_summary(identifier)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            sys.exit(
                f"Pokemon '{identifier}' not found. Check the spelling or use the "
                "Pokedex number. See references/special-names.md for unusual names."
            )
        sys.exit(f"PokeAPI returned HTTP {error.code}.")
    except urllib.error.URLError as error:
        sys.exit(f"Could not reach PokeAPI: {error.reason}")


if __name__ == "__main__":
    main()
