type ColorName = "cyan" | "yellow" | "green" | "red";

const COLOR_CODES: Record<ColorName, string> = {
  cyan: "36",
  yellow: "33",
  green: "32",
  red: "31",
};

function isColorSupported(): boolean {
  return process.stdout.isTTY === true && !Bun.env.NO_COLOR;
}

export function colorize(
  text: string,
  color: ColorName,
  enabled = isColorSupported(),
): string {
  if (!enabled) {
    return text;
  }

  return `\u001b[${COLOR_CODES[color]}m${text}\u001b[0m`;
}

export const cyan = (text: string): string => colorize(text, "cyan");
export const yellow = (text: string): string => colorize(text, "yellow");
export const green = (text: string): string => colorize(text, "green");
export const red = (text: string): string => colorize(text, "red");
