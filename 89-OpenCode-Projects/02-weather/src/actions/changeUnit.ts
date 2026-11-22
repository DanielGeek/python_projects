import { printSuccess } from "../presentation/output";
import { saveSettings, toggleUnit } from "../storage/settingsStorage";
import type { AppState } from "../types/AppState";
import { unitSymbol } from "../utils/format";

export async function changeUnit(state: AppState): Promise<void> {
  const unit = toggleUnit(state);
  await saveSettings(state);
  printSuccess(`Temperature unit set to ${unitSymbol(unit)}.`);
}
