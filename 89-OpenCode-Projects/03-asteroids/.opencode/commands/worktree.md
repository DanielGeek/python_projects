---
description: Create a git worktree from a short task description
---

Request: $ARGUMENTS

Create a git worktree for the request above.

- Derive the worktree name from the request. It may be one word or a
  phrase with spaces; condense it into a short, lowercase, kebab-case
  name in English (e.g. "fix ship collision" -> fix-ship-collision).
- If the request is empty, ask the user what the worktree is for
  before continuing.
- Run exactly this shell command from the current working directory,
  replacing <name> with the derived name:

  git worktree add .worktrees/<name>

- Do not change directories, do not cd into the worktree, do not
  create or modify files, and do not run anything else.
