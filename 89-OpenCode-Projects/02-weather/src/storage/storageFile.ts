import { red } from "../utils/colors";

export async function readStorageFile<T>(
  path: string,
  parse: (value: unknown) => T | null,
  fallback: T,
): Promise<T> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return fallback;
  }

  try {
    const parsed = parse(await file.json());
    if (!parsed) {
      throw new Error("Invalid saved data");
    }
    return parsed;
  } catch {
    console.warn(
      red(`Saved data in ${path} is invalid or unreadable. Starting with empty data.`),
    );
    return fallback;
  }
}

export async function writeStorageFile(
  path: string,
  value: unknown,
): Promise<void> {
  await Bun.write(path, `${JSON.stringify(value, null, 2)}\n`);
}
