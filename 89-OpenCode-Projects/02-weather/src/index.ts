import { runMenu } from "./presentation/menu";
import { red } from "./utils/colors";

try {
  await runMenu();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(red(`Weather CLI could not start: ${message}`));
  process.exitCode = 1;
}
