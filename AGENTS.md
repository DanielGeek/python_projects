# AGENTS.md

## Repository layout

One git repository contains 89 independent projects in numbered top-level directories (`01-...` to `89-...`). There is no root manifest, workspace configuration, shared package, or root build/test command.

- Run commands from the directory that owns the project being changed. Read its README, manifest, and lockfile first; entrypoints and scripts vary.
- New independent projects go in a new numbered top-level directory.
- `86-MLOps` is a curriculum of numbered submodules with a shared `requirements.txt` and `mypy.ini`, not a uv project. Individual modules may have additional tooling.
- `89-OpenCode-Projects` contains independent subprojects, not one application.
- The root `README.md` is a portfolio showcase, not operational documentation.

## Python projects

Projects with `pyproject.toml` and `uv.lock` use uv:

```bash
uv run python <entrypoint>.py  # creates the environment from uv.lock on first use
uv run pytest                  # when the project has pytest tests
uv add <package>               # updates pyproject.toml and uv.lock
```

- Use the README's actual entrypoint rather than assuming `main.py`.
- `requires-python` varies by project (`>=3.9` through `>=3.14`, sometimes with upper bounds); check it before changing dependencies or language features.
- Keep `pyproject.toml` and `uv.lock` changes together.
- Projects without uv configuration may use `requirements.txt` or another setup; do not convert them implicitly.

## JavaScript and TypeScript projects

Follow `package.json` scripts and the existing lockfile rather than applying the Python workflow.

- With `bun.lock`, use Bun instead of Node/npm: `bun install`, `bun <entrypoint>`, and `bun test` when tests exist.
- `89-OpenCode-Projects/02-weather` uses `bun index.ts` and `bun run typecheck` (which runs `bun check`).
- Other projects use npm or framework-specific commands; check their local instructions and scripts.

## Secrets

The root `.gitignore` does **not** globally ignore `.env`. Before creating an environment file, ensure the owning project's `.gitignore` excludes it; add that entry if needed. Provide a `.env.example` documenting required variables without real secrets.

## Verification and CI

Verify within each affected project by running its tests or the application itself. The root `.github/workflows` only contains Claude automation: `@claude` handling plus Tetris-scoped PR review and issue triage. It provides no general test, lint, or typecheck gate. Nested projects may have their own CI.

## Nested instructions

Read the nearest `AGENTS.md` and `CLAUDE.md` before editing; nested instructions take precedence for their directory. This includes projects under `87-ClaudeCode`, `88-spec-kit-examples`, and `89-OpenCode-Projects`.

The Next.js `BEGIN/END` blocks in some nested `AGENTS.md` files are generated and restored by `next dev`; do not delete or manually edit them.
