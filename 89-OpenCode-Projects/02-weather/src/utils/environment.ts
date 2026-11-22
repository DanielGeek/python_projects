import { dirname, join } from "node:path";

async function loadExecutableEnvironment(): Promise<void> {
  const envPath = join(dirname(process.execPath), ".env");
  if (await Bun.file(envPath).exists()) {
    process.loadEnvFile(envPath);
  }
}

await loadExecutableEnvironment();

function requireEnvironmentVariable(name: string): string {
  const value = Bun.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Add it to your .env file.`);
  }

  return value;
}

export const environment = {
  openMeteoGeocodingUrl: requireEnvironmentVariable("OPEN_METEO_GEOCODING_URL"),
  openMeteoForecastUrl: requireEnvironmentVariable("OPEN_METEO_FORECAST_URL"),
} as const;
