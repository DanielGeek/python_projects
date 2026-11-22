import { printCities, printError } from "../presentation/output";
import type { AppState } from "../types/AppState";

export async function listSavedCities(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved. Add a city with option 3.");
    return;
  }

  printCities(state);
}
