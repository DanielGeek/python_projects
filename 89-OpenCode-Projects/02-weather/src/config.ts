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
