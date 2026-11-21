import { findCity, getCurrentTemperature } from "./open-meteo";
import {
  addCity as addCityToState,
  getDefaultCity,
  loadState,
  removeCity as removeCityFromState,
  saveState,
  setDefaultCity,
  toggleUnit,
} from "./store";
import type { AppState, City, TemperatureUnit } from "./types";

const DIVIDER = "════════════════════════════════════════";

function unitSymbol(unit: TemperatureUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

function printMenu(state: AppState): void {
  console.log(`\n${DIVIDER}`);
  console.log("         WEATHER CLI");
  console.log(DIVIDER);
  console.log("  1. Default city weather");
  console.log(`  2. Weather for all cities (${state.cities.length})`);
  console.log("  3. Search for and add a city");
  console.log("  4. Remove a city");
  console.log("  5. Set default city");
  console.log(`  8. Settings (${unitSymbol(state.unit)})`);
  console.log("  9. Exit");
  console.log(DIVIDER);
}

function printCities(state: AppState): void {
  state.cities.forEach((city, index) => {
    const defaultMarker = city.id === state.defaultCityId ? " (default)" : "";
    console.log(`  ${index + 1}. ${formatCity(city)}${defaultMarker}`);
  });
}

function selectCity(state: AppState, action: string): City | null {
  printCities(state);
  const answer = prompt(`  City number to ${action}: `);
  if (answer === null) {
    return null;
  }

  const index = Number(answer.trim()) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= state.cities.length) {
    return null;
  }

  return state.cities[index] ?? null;
}

async function printCityWeather(city: City, state: AppState): Promise<void> {
  const temperature = await getCurrentTemperature(city, state.unit);
  console.log(`  ${formatCity(city)}: ${temperature.toFixed(1)} ${unitSymbol(state.unit)}`);
}

async function showDefaultWeather(state: AppState): Promise<void> {
  const city = getDefaultCity(state);
  if (!city) {
    console.log("  No default city is set. Add a city with option 3.");
    return;
  }

  await printCityWeather(city, state);
}

async function showAllWeather(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("  No cities saved. Add a city with option 3.");
    return;
  }

  for (const city of state.cities) {
    try {
      await printCityWeather(city, state);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`  ${formatCity(city)}: ${message}`);
    }
  }
}

async function searchAndAddCity(state: AppState): Promise<void> {
  const query = prompt("  City name: ")?.trim();
  if (!query) {
    console.log("  Enter a city name.");
    return;
  }

  const city = await findCity(query);
  if (!city) {
    console.log(`  No results found for "${query}".`);
    return;
  }

  if (!addCityToState(state, city)) {
    console.log(`  ${formatCity(city)} is already saved.`);
    return;
  }

  await saveState(state);
  const defaultMessage = state.defaultCityId === city.id ? " and set it as default" : "";
  console.log(`  Added ${formatCity(city)}${defaultMessage}.`);
}

async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("  No cities saved.");
    return;
  }

  const city = selectCity(state, "remove");
  if (!city) {
    console.log("  Invalid city selection.");
    return;
  }

  removeCityFromState(state, city.id);
  await saveState(state);
  console.log(`  Removed ${formatCity(city)}.`);
}

async function chooseDefaultCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    console.log("  No cities saved. Add a city with option 3.");
    return;
  }

  const city = selectCity(state, "set as default");
  if (!city) {
    console.log("  Invalid city selection.");
    return;
  }

  setDefaultCity(state, city.id);
  await saveState(state);
  console.log(`  Default city set to ${formatCity(city)}.`);
}

async function changeUnit(state: AppState): Promise<void> {
  const unit = toggleUnit(state);
  await saveState(state);
  console.log(`  Temperature unit set to ${unitSymbol(unit)}.`);
}

export async function runCli(): Promise<void> {
  const state = await loadState();

  while (true) {
    printMenu(state);
    const answer = prompt("  Select an option: ");
    if (answer === null) {
      console.log("\nGoodbye!");
      return;
    }

    const option = answer.trim();
    if (option === "9") {
      console.log("Goodbye!");
      return;
    }

    try {
      switch (option) {
        case "1":
          await showDefaultWeather(state);
          break;
        case "2":
          await showAllWeather(state);
          break;
        case "3":
          await searchAndAddCity(state);
          break;
        case "4":
          await removeCity(state);
          break;
        case "5":
          await chooseDefaultCity(state);
          break;
        case "8":
          await changeUnit(state);
          break;
        default:
          console.log("  Invalid option. Select 1, 2, 3, 4, 5, 8, or 9.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`  Error: ${message}`);
    }
  }
}
