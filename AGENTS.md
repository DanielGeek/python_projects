# AGENTS.md

## Repository layout

Single git repo of ~90 independent, self-contained projects in numbered top-level
directories (`01-...` to `89-...`). No shared code, no workspace config, no root-level
build/test tooling.

- `cd` into the specific project directory before running anything.
- Each project owns its dependencies (`pyproject.toml` + `uv.lock`) and its own README with setup/run instructions.
- New projects go in a new numbered top-level directory.
- `86-MLOps` is a nested curriculum of numbered submodules with its own `requirements.txt` and `mypy.ini` (not uv-based).

## Python projects

`uv` is the standard package manager (66 projects):

```
uv run python main.py    # run a script; creates the venv from uv.lock on first use
uv run pytest            # run tests, when the project has them
uv add <package>         # add a dependency (updates pyproject.toml + uv.lock)
```

- `requires-python` varies per project (`>=3.12` is most common, newer ones use `>=3.14`); check the project's `pyproject.toml` before changing it.
- Commit both `pyproject.toml` and `uv.lock`.

## Secrets and environment variables

`.env` is NOT ignored globally. The root `.gitignore` lists only a few specific paths; each
project ignores `.env` via its own local `.gitignore`.

When a project uses env vars:

1. Add `.env` to `<project>/.gitignore` before creating the file.
2. Commit a `.env.example` documenting the required variables.

## CI

GitHub Actions contains only Claude workflows (triggered by `@claude` mentions in
issues/PRs/reviews). There are no test, lint, or typecheck gates. Verify locally:
run the project's tests or the script itself before committing.

## Nested instruction files

Some subprojects have their own `AGENTS.md` (e.g. `87-ClaudeCode/*`,
`88-spec-kit-examples/*`). Some blocks are tool-generated and self-restoring (e.g. the
Next.js `BEGIN/END` blocks managed by `next dev`) — do not delete or edit them. A nested
`AGENTS.md` takes precedence for its directory.

## READMEs

The root `README.md` is a portfolio showcase, not operational docs. Treat each project's own
`README.md` as the source of truth for running it.
