import { runCli } from "./src/cli";

try {
  await runCli();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Weather CLI could not start: ${message}`);
  process.exitCode = 1;
}
