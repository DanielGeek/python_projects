import { getCurrentWeather } from "../api/weather";
import { printError, printWeather } from "../presentation/output";
import { getDefaultCity } from "../storage/citiesStorage";
import type { AppState } from "../types/AppState";
import type { City } from "../types/City";
import { runForEachCity } from "./forEachCity";

export async function showCityWeather(
  city: City,
  state: AppState,
): Promise<void> {
  const weather = await getCurrentWeather(city, state.unit);
  printWeather(city, weather, state.unit);
}

export async function showDefaultCityWeather(state: AppState): Promise<void> {
  const city = getDefaultCity(state);
  if (!city) {
    printError("No default city is set. Add a city with option 3.");
    return;
  }

  await showCityWeather(city, state);
}

export async function showAllCitiesWeather(state: AppState): Promise<void> {
  await runForEachCity(state, showCityWeather);
}
