import { environment } from "./config";
import {
  isFiniteNumber,
  parseCity,
  parseDailyForecast,
  type City,
  type CurrentWeather,
  type DailyForecast,
  type TemperatureUnit,
} from "./types";

export type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

async function requestJson(url: URL, fetcher: Fetcher): Promise<unknown> {
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

export async function findCity(
  query: string,
  fetcher: Fetcher = fetch,
): Promise<City | null> {
  const url = new URL(environment.openMeteoGeocodingUrl);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const payload = asRecord(await requestJson(url, fetcher));
  const results = payload?.results;

  if (!Array.isArray(results)) {
    throw new Error("Open-Meteo returned an invalid city search response.");
  }

  if (results.length === 0) {
    return null;
  }

  const city = parseCity(results[0]);
  if (!city) {
    throw new Error("Open-Meteo returned invalid city coordinates.");
  }

  return city;
}

function buildForecastUrl(city: City, unit: TemperatureUnit): URL {
  const url = new URL(environment.openMeteoForecastUrl);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("temperature_unit", unit);
  return url;
}

export async function getCurrentWeather(
  city: City,
  unit: TemperatureUnit,
  fetcher: Fetcher = fetch,
): Promise<CurrentWeather> {
  const url = buildForecastUrl(city, unit);
  url.searchParams.set("current", "temperature_2m,weather_code");

  const payload = asRecord(await requestJson(url, fetcher));
  const current = asRecord(payload?.current);
  const temperature = current?.temperature_2m;
  const weatherCode = current?.weather_code;

  if (!isFiniteNumber(temperature) || !isFiniteNumber(weatherCode)) {
    throw new Error("Open-Meteo returned an invalid weather response.");
  }

  return { temperature, weatherCode };
}

export async function getDailyForecast(
  city: City,
  unit: TemperatureUnit,
  fetcher: Fetcher = fetch,
): Promise<DailyForecast[]> {
  const url = buildForecastUrl(city, unit);
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const payload = asRecord(await requestJson(url, fetcher));
  const forecast = parseDailyForecast(payload?.daily);

  if (!forecast) {
    throw new Error("Open-Meteo returned an invalid forecast response.");
  }

  return forecast;
}
