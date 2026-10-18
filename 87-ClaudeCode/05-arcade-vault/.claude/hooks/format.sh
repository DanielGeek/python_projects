#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): format the touched file with Prettier, then ESLint --fix.
# Project scope only. Reads the hook JSON payload from stdin.

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$PWD}"

[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

# Only files inside this project.
case "$file" in
  "$root"/*) ;;
  *) exit 0 ;;
esac

# Skip ignored and generated folders.
rel="${file#"$root"/}"
case "$rel" in
  node_modules/*|.next/*|out/*|build/*|public/games/*|references/*|.claude/*|package-lock.json|next-env.d.ts) exit 0 ;;
esac

cd "$root" || exit 0

npx --no-install prettier --write --ignore-unknown "$rel" >/dev/null 2>&1

case "$rel" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    if ! out=$(npx --no-install eslint --fix "$rel" 2>&1); then
      printf 'ESLint errors in %s:\n%s\n' "$rel" "$out" >&2
      exit 2
    fi
    ;;
esac

exit 0
