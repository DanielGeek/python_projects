import type { AppState } from "../types/AppState";
import type { City } from "../types/City";
import { cyan } from "../utils/colors";
import { printCities } from "./output";

export function askQuestion(question: string): string | null {
  const answer = prompt(cyan(`  ${question}`));
  return answer === null ? null : answer.trim();
}

export function selectCity(state: AppState, action: string): City | null {
  printCities(state);
  const answer = askQuestion(`City number to ${action}:`);
  if (answer === null) {
    return null;
  }

  const index = Number(answer) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= state.cities.length) {
    return null;
  }

  return state.cities[index] ?? null;
}
