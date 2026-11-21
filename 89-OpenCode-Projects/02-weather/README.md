## Weather CLI App

A console application for saving cities and checking their current weather with Open-Meteo. It can also be compiled into a standalone executable.

### Features

- Search for and save cities.
- Keep a default city.
- Check the weather for the default city or all saved cities.
- Switch between Celsius and Fahrenheit.
- Colored terminal output: cyan menu, yellow temperature, green success, and red errors. Set `NO_COLOR=1` to disable colors.
- Persist settings and cities locally in `weather.json`.

## Stack

- Bun.js
- TypeScript
- Open-Meteo

## Open-Meteo requests

1. Use the Geocoding API to find the city's coordinates.
2. Use the Forecast API to get the current temperature at those coordinates.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=en&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Setup and run

```bash
cp .env.example .env
bun install
bun run start
```

The two Open-Meteo endpoints are configured through environment variables:

```bash
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
```

The first saved city becomes the default. Option 8 toggles the temperature unit. Local data is stored in `weather.json` in the directory where the application runs.

## Verification

```bash
bun run typecheck
bun test
```

## Build the executable

```bash
bun run build
./weather
```

The executable also loads `.env` from its own directory, so it can be opened from Finder or launched from another working directory. If you move the binary elsewhere, keep a configured `.env` beside it or export the two endpoint variables in your shell.

### Menu example

```text
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Default city weather
  2. Weather for all cities (1)
  3. Search for and add a city
  4. Remove a city
  5. Set default city
  8. Settings (°C)
  9. Exit
════════════════════════════════════════
  Select an option: 5
```
