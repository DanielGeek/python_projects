#!/usr/bin/env python3
"""UserPromptSubmit hook: record every /speckit-* command in README.md.

Entries are inserted just before the COMMANDS:END marker in the
"Commands" section of the README so they can be reused in other projects.
Identical command + arguments are recorded only once.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

END_MARKER = "<!-- SPECKIT-COMMANDS:END -->"
COMMAND_RE = re.compile(r"^\s*/(speckit[-.\w]*)(?:[ \t]+(.*))?$", re.DOTALL)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    match = COMMAND_RE.match(payload.get("prompt", ""))
    if not match:
        return 0

    command = match.group(1)
    args = (match.group(2) or "").strip()
    line = f"/{command} {args}".rstrip()

    readme = Path(payload.get("cwd") or ".") / "README.md"
    if not readme.is_file():
        return 0
    text = readme.read_text(encoding="utf-8")
    if END_MARKER not in text:
        return 0

    fence = "````" if "```" in line else "```"
    entry_block = f"{fence}text\n{line}\n{fence}"
    if entry_block in text:
        return 0

    entry = f"### `/{command}` — {date.today().isoformat()}\n\n{entry_block}\n\n"
    readme.write_text(text.replace(END_MARKER, entry + END_MARKER, 1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
