# Special Pokemon names

PokeAPI identifiers are lowercase slugs. `fetch_pokemon.py` applies these rules automatically, but use the exact identifiers below when a lookup fails.

| Display name | API identifier | Rule |
| --- | --- | --- |
| Nidoran♀ | `nidoran-f` | gender symbols become `-f` / `-m` |
| Nidoran♂ | `nidoran-m` | gender symbols become `-f` / `-m` |
| Mr. Mime | `mr-mime` | drop periods, spaces become hyphens |
| Mime Jr. | `mime-jr` | drop periods, spaces become hyphens |
| Farfetch'd | `farfetchd` | apostrophes are dropped |
| Sirfetch'd | `sirfetchd` | apostrophes are dropped |
| Type: Null | `type-null` | drop the colon, spaces become hyphens |
| Ho-Oh | `ho-oh` | lowercase, keep the hyphen |
| Porygon-Z | `porygon-z` | lowercase, keep the hyphen |
| Jangmo-o | `jangmo-o` | lowercase, keep the hyphen |

## Variants

Regional and battle variants use suffixes on the base name:

| Variant | Examples |
| --- | --- |
| Regional forms | `raichu-alola`, `vulpix-alola`, `meowth-galar` |
| Mega Evolutions | `charizard-mega-x`, `charizard-mega-y`, `mewtwo-mega-y` |
| Gigantamax | `charizard-gmax`, `pikachu-gmax` |
| Other forms | `rotom-wash`, `deoxys-speed`, `kyogre-primal`, `urshifu-rapid-strike` |

If a variant identifier fails, query the base Pokemon and report the base form.
