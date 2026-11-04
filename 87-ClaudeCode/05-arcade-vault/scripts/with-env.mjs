#!/usr/bin/env node
// `npm run dev`, `npm run build` and `npm start` run through this file: it loads an env file into process.env
// (when the file exists) and then runs `next <command>`. `dev` loads .env.development; `build` and `start`
// load .env.prod. A variable that is already set, for example by Vercel or by your shell, wins over the
// file, and Next fills the rest from its own .env files.
//
// It is a script and not `node --env-file-if-exists=...` in package.json because Next starts its build workers
// with the flags of this process in NODE_OPTIONS, and Node refuses `--env-file*` there. Child processes inherit
// process.env, so they see these variables.
//
// Usage: node scripts/with-env.mjs dev|build|start [next args]. `ENV_FILE` overrides the file name (tests).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-env.mjs dev|build|start [next args]");
  process.exit(2);
}

const DEFAULT_ENV_FILES = { dev: ".env.development" };
const envFile = process.env.ENV_FILE ?? DEFAULT_ENV_FILES[command] ?? ".env.prod";
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
  console.log(`[with-env] loaded ${envFile}`);
} else {
  console.log(`[with-env] ${envFile} not found, using the environment as it is`);
}

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, command, ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
