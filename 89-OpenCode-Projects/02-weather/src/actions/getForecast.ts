import { getDailyForecast } from "../api/weather";
import { printForecast } from "../presentation/output";
import type { AppState } from "../types/AppState";
import type { City } from "../types/City";
import { runForEachCity } from "./forEachCity";

export async function showCityForecast(
  city: City,
  state: AppState,
): Promise<void> {
  const forecast = await getDailyForecast(city, state.unit);
  printForecast(city, forecast, state.unit);
}

export async function showAllCitiesForecast(state: AppState): Promise<void> {
  await runForEachCity(state, showCityForecast);
}
