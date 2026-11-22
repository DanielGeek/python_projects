import { findCity } from "../api/geocoding";
import { askQuestion } from "../presentation/input";
import { printError, printSuccess } from "../presentation/output";
import { addCity, saveCities } from "../storage/citiesStorage";
import type { AppState } from "../types/AppState";
import { formatCity } from "../utils/format";

export async function searchAndAddCity(state: AppState): Promise<void> {
  const query = askQuestion("City name:");
  if (!query) {
    printError("Enter a city name.");
    return;
  }

  const city = await findCity(query);
  if (!city) {
    printError(`No results found for "${query}".`);
    return;
  }

  if (!addCity(state, city)) {
    printError(`${formatCity(city)} is already saved.`);
    return;
  }

  await saveCities(state);
  const defaultMessage =
    state.defaultCityId === city.id ? " and set it as default" : "";
  printSuccess(`Added ${formatCity(city)}${defaultMessage}.`);
}
