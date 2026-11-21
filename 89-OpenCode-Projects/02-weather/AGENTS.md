# AGENTS.md

## Project

- Bun TypeScript CLI. `index.ts` starts the application; `src/cli.ts` owns the interactive menu, `src/open-meteo.ts` the HTTP client, `src/config.ts` environment loading, `src/colors.ts` ANSI styling, `src/store.ts` state and persistence, and `src/types.ts` shared types and validation.
- Open-Meteo geocoding supplies coordinates for the forecast request. Geocoding uses `language=en`, matching the README example; the CLI itself is in English.
- State is stored as `weather.json` in the process working directory. The first saved city becomes the default, and option 8 toggles Celsius/Fahrenheit. Runtime data and compiled binaries are gitignored.
- Terminal output is styled through `src/colors.ts`; colors are disabled automatically for non-TTY output and when `NO_COLOR` is set.
- `OPEN_METEO_GEOCODING_URL` and `OPEN_METEO_FORECAST_URL` are required endpoint settings loaded centrally by `src/config.ts`; application code and tests import `environment` from that module. Copy `.env.example` to `.env`. Bun loads the working-directory file automatically, and `src/config.ts` additionally loads the `.env` beside a compiled executable so Finder launches work. Follow `bun-instructions.md` and prefer Bun APIs over Node-oriented dependencies.

## Commands

```bash
cp .env.example .env
bun install
bun run start                    # interactive CLI
bun run typecheck                # bun check using tsconfig.json
bun test                         # all tests; no network required
bun test tests/store.test.ts     # focused test file
bun run build                    # creates ./weather
./weather
```

Use Bun instead of Node, npm, npx, or `tsc`. Keep `package.json` and `bun.lock` changes together when dependencies change.

## Verification

Run `bun run typecheck` and `bun test` after changes. Exercise interactive workflows with `bun run start` when changing the menu, persistence, or API integration. Tests read the endpoint environment variables, mock Open-Meteo responses, and use temporary directories for storage; only manual weather lookups require network access.
