import type { City } from "../types/City";
import type { TemperatureUnit } from "../types/Weather";
import { environment } from "../utils/environment";

export type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

export async function requestJson(url: URL, fetcher: Fetcher): Promise<unknown> {
  let response: Response;

  try {
    response = await fetcher(url);
  } catch {
    throw new Error("Could not connect to Open-Meteo. Check your internet connection.");
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Open-Meteo returned an invalid response.");
  }
}

export function buildForecastUrl(city: City, unit: TemperatureUnit): URL {
  const url = new URL(environment.openMeteoForecastUrl);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("temperature_unit", unit);
  return url;
}
