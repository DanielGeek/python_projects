# Doit (01-doit-speckit)

An example project built with **spec-driven development** using [GitHub Spec Kit](https://github.com/github/spec-kit)
and Claude Code. The goal is twofold: build the app, and keep a reusable record of the exact
Spec Kit commands used so the workflow can be repeated in new projects.

## Stack

| Tool | Version |
| --- | --- |
| Next.js | 16.4.5 |
| React / React DOM | 19.3.0 |
| Tailwind CSS | ^4 |
| TypeScript | ^5 |

`package.json` is the source of truth for versions. Next.js 16 has breaking changes, so read the guides in
`node_modules/next/dist/docs/` before writing framework code.

## Project Principles

Defined in [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.0.0):

1. **Clean code** — small, single-purpose, strictly typed, lint-clean.
2. **Simple UX** — one primary action per screen, plain language, keyboard accessible.
3. **Responsive design** — mobile-first with Tailwind, no horizontal scroll.
4. **Minimal dependencies** — prefer built-ins; justify every new package.
5. **No testing** — no unit, integration, or end-to-end tests. This supersedes any other guidance.

## Getting Started

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Spec Kit Workflow

Typical order of commands:

1. `/speckit-constitution` — define project principles
2. `/speckit-specify` — describe a feature
3. `/speckit-clarify` — resolve ambiguities (optional)
4. `/speckit-plan` — create the technical plan
5. `/speckit-tasks` — generate the task list
6. `/speckit-analyze` — check consistency across artifacts (optional)
7. `/speckit-implement` — build it

## Commands

Every `/speckit-*` command run in Claude Code is recorded here automatically by the hook in
[`.claude/hooks/log-speckit-command.py`](.claude/hooks/log-speckit-command.py) (registered in
[`.claude/settings.json`](.claude/settings.json)). Copy these examples into future projects.
Identical commands are recorded only once. Do not remove the markers below.

<!-- SPECKIT-COMMANDS:START -->

### `/speckit-constitution` — 2026-11-08

```text
/speckit-constitution Declare the principle for clean code, simple UX, responsive design, and minimal dependencies. Absolutely no testing: no unit tests, no integration tests, no end-to-end tests. This must supersede any other guidance. The project must use the Next.js, React, and Tailwind versions as per the package.json file. '/Users/thepunisher/Documents/GitHub/python_projects/88-spec-kit-examples/01-doit-speckit/package.json'
```

### `/speckit-specify` — 2026-11-08

```text
/speckit-specify Initial page setup
This application should be a goal tracking web app called Doit. There should be two columns:
- A left one where current goals are shown, along with how many days left the user has to achieve the goal.
- A right one where completed goals are.
Each goal can be checked using a checkbox and then either moved to the completed goals or permanently deleted. To add new goals, a user can click on a button to open a new goal form in a modal. Title and end date fields. Goals reaching their end date within 3 days are highlighted. Lex uses a modern light theme with soft pastel colors.
```

### `/speckit-clarify` — 2026-11-08

```text
/speckit-clarify
```

<!-- SPECKIT-COMMANDS:END -->
