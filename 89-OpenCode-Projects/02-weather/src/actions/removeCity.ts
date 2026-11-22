import { selectCity } from "../presentation/input";
import { printError, printSuccess } from "../presentation/output";
import { removeCity as removeCityFromState, saveCities } from "../storage/citiesStorage";
import type { AppState } from "../types/AppState";
import { formatCity } from "../utils/format";

export async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved.");
    return;
  }

  const city = selectCity(state, "remove");
  if (!city) {
    printError("Invalid city selection.");
    return;
  }

  removeCityFromState(state, city.id);
  await saveCities(state);
  printSuccess(`Removed ${formatCity(city)}.`);
}
