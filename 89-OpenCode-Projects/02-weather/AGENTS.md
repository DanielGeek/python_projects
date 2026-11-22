# AGENTS.md

## Project

- Bun TypeScript CLI. `src/index.ts` starts the application; `src/presentation/` owns the menu, output, and input; `src/actions/` orchestrates user operations; `src/api/` wraps Open-Meteo geocoding and forecast requests; `src/storage/` persists state; `src/types/` holds shared types and validation; and `src/utils/` holds colors, formatting, constants, and environment loading.
- Open-Meteo geocoding supplies coordinates for the forecast request. Geocoding uses `language=en`, matching the README example; the CLI itself is in English.
- State is stored in the process working directory as `cities.json` (saved cities and the default city) and `settings.json` (temperature unit). A legacy `weather.json` is migrated once into both files and renamed to `weather.json.bak`. The first saved city becomes the default, and option 8 toggles Celsius/Fahrenheit. Runtime data and compiled binaries are gitignored.
- Terminal output is styled through `src/utils/colors.ts`; colors are disabled automatically for non-TTY output and when `NO_COLOR` is set.
- `OPEN_METEO_GEOCODING_URL` and `OPEN_METEO_FORECAST_URL` are required endpoint settings loaded centrally by `src/utils/environment.ts`; application code and tests import `environment` from that module. Copy `.env.example` to `.env`. Bun loads the working-directory file automatically, and `src/utils/environment.ts` additionally loads the `.env` beside a compiled executable so Finder launches work. Follow `bun-instructions.md` and prefer Bun APIs over Node-oriented dependencies.

## Commands

```bash
cp .env.example .env
bun install
bun run start                    # interactive CLI
bun run typecheck                # bun check using tsconfig.json
bun test                         # all tests; no network required
bun test tests/storage/citiesStorage.test.ts  # focused test file
bun run build                    # creates ./weather
./weather
```

Use Bun instead of Node, npm, npx, or `tsc`. Keep `package.json` and `bun.lock` changes together when dependencies change.

## Verification

Run `bun run typecheck` and `bun test` after changes. Exercise interactive workflows with `bun run start` when changing the menu, persistence, or API integration. Tests mirror the `src/` layout under `tests/api/`, `tests/storage/`, `tests/presentation/`, and `tests/utils/`; they read the endpoint environment variables, mock Open-Meteo responses, and use temporary directories for storage. Only manual weather lookups require network access.
