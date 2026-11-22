import { asRecord, buildForecastUrl, requestJson, type Fetcher } from "./client";
import type { City } from "../types/City";
import {
  parseDailyForecast,
  type CurrentWeather,
  type DailyForecast,
  type TemperatureUnit,
} from "../types/Weather";
import { isFiniteNumber } from "../types/validation";

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
