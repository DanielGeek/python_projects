---
description: Create an isolated git worktree in .trees/ and carry out the given task inside it
argument-hint: <task instructions>
allowed-tools: Bash(git worktree:*), Bash(git branch:*), Bash(git status:*), Bash(git rev-parse:*), Bash(git check-ignore:*)
---

# /worktree

Run the task below in its own git worktree, isolated from the main working tree.

## Task

$ARGUMENTS

If the task above is empty, ask the user what to do and stop.

## Steps

1. **Pick the name.** Derive a short kebab-case name (2–4 lowercase ASCII words, no spaces) from the task, for example `pause-menu` or `fix-ghost-piece`. Run `git worktree list` and `git branch --list <name>`. If the name is already taken, append `-2`, `-3`, and so on.
2. **Check the main tree.** Run `git status --short`. A worktree starts from the current commit, so uncommitted changes in the main tree will NOT be in it. If there are any, tell the user in one line, then continue.
3. **Create the worktree.** From the current directory, run exactly:
   `git worktree add .trees/<name>`
   Git creates a new branch `<name>` from the current HEAD. If the command fails, show the error and stop.
4. **Find the work directory.** The worktree is a checkout of the whole repository. Run `git rev-parse --show-prefix` in the original directory. The directory to work in is `.trees/<name>/<prefix>` (just `.trees/<name>` when the prefix is empty). Resolve it to an absolute path and use that path from now on.
5. **Work only inside the worktree.** Carry out the task there:
   - Read, edit and create files only under the worktree's absolute path. Never edit the main working tree or another branch.
   - Run shell commands with `cd <worktree path> && ...` or `git -C <worktree path> ...`.
   - Read the project's `CLAUDE.md` inside the worktree for conventions.
   - If you start a dev server, pick a port that is free and stop the server when you are done.
   - Do not commit, push, merge, open PRs or delete anything unless the task asks for it.
6. **Report.** End with a short summary:
   - name, branch and absolute path of the worktree;
   - what changed and how you checked it;
   - how to review and finish:
     `git merge <name>` (from the main branch), then
     `git worktree remove .trees/<name> && git branch -d <name>`.

## Notes

- If `git check-ignore -q .trees` fails, `.trees/` shows up as untracked in the main tree. Tell the user once and suggest adding `.trees/` to `.gitignore`. Do not edit `.gitignore` yourself.
- Several `/worktree` runs can work in parallel because each one has its own directory and branch.
