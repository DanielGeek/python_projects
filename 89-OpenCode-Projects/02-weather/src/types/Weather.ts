import { isFiniteNumber } from "./validation";

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  maxTemperature: number;
  minTemperature: number;
}

export function parseDailyForecast(value: unknown): DailyForecast[] | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const daily = value as Record<string, unknown>;
  const time = daily.time;
  const maxTemperatures = daily.temperature_2m_max;
  const minTemperatures = daily.temperature_2m_min;

  if (
    !Array.isArray(time) ||
    !Array.isArray(maxTemperatures) ||
    !Array.isArray(minTemperatures) ||
    time.length === 0 ||
    time.length !== maxTemperatures.length ||
    time.length !== minTemperatures.length
  ) {
    return null;
  }

  const forecast: DailyForecast[] = [];
  for (let index = 0; index < time.length; index += 1) {
    const date = time[index];
    const maxTemperature = maxTemperatures[index];
    const minTemperature = minTemperatures[index];

    if (
      typeof date !== "string" ||
      !date.trim() ||
      !isFiniteNumber(maxTemperature) ||
      !isFiniteNumber(minTemperature)
    ) {
      return null;
    }

    forecast.push({ date, maxTemperature, minTemperature });
  }

  return forecast;
}
