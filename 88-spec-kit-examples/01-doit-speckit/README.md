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

Other libraries: shadcn/ui for components, `date-fns` for date math, and `sortablejs` for drag-and-drop reordering.

## Features

Each feature lives in [`specs/`](specs) with its spec, plan, tasks, and a manual quickstart.

| Spec | Feature |
| --- | --- |
| [`001-goal-tracking-board`](specs/001-goal-tracking-board/spec.md) | Two-column board, add-goal modal, complete or delete goals, due-soon highlight, `localStorage` persistence |
| [`002-refine-color-palette`](specs/002-refine-color-palette/spec.md) | Refined color palette defined as Tailwind `@theme` tokens |
| [`003-goal-drag-reorder`](specs/003-goal-drag-reorder/spec.md) | Reorder current goals by dragging (mouse, touch) or with the keyboard; the order is saved on the device |

## Project Principles

Defined in [`.specify/memory/constitution.md`](.specify/memory/constitution.md) (v1.1.0):

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

## Starting Spec Kit in a Project

Follow these steps in order. They work for a brand-new folder and for a repository that already has code.

1. **Check the CLI and your tools.** Confirms that `git` and your coding agent are available, and shows the CLI version.

   ```bash
   specify check
   specify self check     # optional: is there a newer CLI release? (read-only)
   ```

2. **Prepare the repository.** For an existing project, commit or stash your changes first so the files Spec Kit
   adds (`.specify/`, `.claude/skills/`) show up as a clean diff. For a new project, create the folder (step 3 does it for you).

3. **Initialize Spec Kit.**

   ```bash
   # New project: creates the folder
   specify init my-project --integration claude --extension git

   # Existing project: run from the repository root
   cd path/to/your-existing-repo
   specify init --here --integration claude --extension git
   ```

   - `--here` (same as `.`) initializes in the current directory and keeps your existing files.
   - `--integration claude` installs the Spec Kit commands as Claude Code skills (`/speckit-*`).
   - `--extension git` installs the git extension so each feature gets its own branch.
   - Add `--force` to skip the confirmation prompt when the directory is not empty.

4. **Verify the extensions.** Without the git extension all work lands on `main`.

   ```bash
   specify extension list        # "No extensions installed." = missing
   specify extension add git     # install it if it is missing
   ```

5. **Verify the agent integration.** Shows what is installed, and lets you add or change agents later without re-initializing.

   ```bash
   specify integration status    # report the project's integration status, no files changed
   specify integration list      # available integrations and which are installed
   specify integration install <name>   # add another agent
   specify integration switch <name>    # replace the current agent
   ```

6. **Open the agent and start the workflow.** Run `/speckit-constitution` (step 1 of the workflow below). In an existing
   project, base the principles on what is already there, such as the versions in `package.json`.

7. **Keep the tools up to date (any time).**

   ```bash
   specify version               # CLI and system information, useful when reporting problems
   specify self upgrade          # upgrade the CLI to the latest release (or a pinned --tag)
   specify integration upgrade <name>   # reinstall an integration, handling file diffs
   ```

## Spec Kit Workflow

Reference flow for spec-driven development with Spec Kit. The main path runs left to right; the two
optional steps sit below the stage they refine.

```text
/constitution ──▶ /specify ──▶ /plan ──▶ /tasks ──▶ /implement
                      │            ▲         │            ▲
                      └─ /clarify ─┘         └─ /analyze ─┘
```

| Step | Command | Purpose |
| --- | --- | --- |
| 1 | `/speckit-constitution` | Define the project principles and constraints. |
| 2 | `/speckit-specify` | Describe the feature: what and why, not how. |
| 2b | `/speckit-clarify` (optional) | Resolve ambiguities in the spec before planning. Run it after `/speckit-specify` and before `/speckit-plan`. |
| 3 | `/speckit-plan` | Choose the technical approach and produce the design artifacts. |
| 4 | `/speckit-tasks` | Generate the dependency-ordered task list. |
| 4b | `/speckit-analyze` (optional) | Check spec, plan, and tasks for consistency. Run it after `/speckit-tasks` and before `/speckit-implement`. |
| 5 | `/speckit-implement` | Build the feature by executing the tasks. |

### Automatic feature branches (git extension)

`/speckit-specify` does not create branches by itself. A `before_specify` hook provided by the `git`
extension ("Git Branching Workflow") does, naming them `{number}-{slug}` (e.g. `002-my-feature`).
Without the extension, all work lands on `main`.

```bash
specify extension list        # check what is installed ("No extensions installed." = missing)
specify extension add git     # install it; registers the hooks in .specify/extensions.yml
```

Branch numbering and naming are configured in `.specify/extensions/git/git-config.yml`. Commit or
clean the working tree before running `/speckit-specify`: the branch is created from wherever you are.

## Superpowers Workflow

The [Superpowers](https://github.com/obra/superpowers) plugin (by Jesse Vincent) is an alternative to Spec Kit for
the same job: it takes a feature from idea to merged branch using skills for design, planning, execution and review.
Install it from the official marketplace:

```text
/plugin install superpowers@claude-plugins-official
```

Spec Kit and Superpowers overlap on specifying and planning. To compare them fairly, each feature uses **one** flow:

| Flow | Used for | Artifacts |
| --- | --- | --- |
| Spec Kit | `001`, `002`, `003` | [`specs/`](specs) (spec, plan, tasks, quickstart) |
| Superpowers | Edit and reopen goals | [`docs/superpowers/`](docs/superpowers) (design doc, then implementation plan) |

> **Constitution Principle V (no tests) wins over Superpowers.** Do **not** use
> `superpowers:test-driven-development`, and tell every plan and subagent not to add tests, TDD steps or test tasks.
> Verification is `npm run lint`, `npm run build` and a manual browser walkthrough.
> Subagents also need to be told to read `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next.js code.

### Feature: edit and reopen goals

Lets users edit a current goal's title and end date, and reopen a completed goal back to Current.
Design: [`docs/superpowers/specs/2026-11-09-edit-and-reopen-goals-design.md`](docs/superpowers/specs/2026-11-09-edit-and-reopen-goals-design.md).

Key decisions from the design:

- **Overdue goals:** a past end date is accepted only if it equals the goal's current end date. Any newly picked date must be today or later.
- **Reopen order:** a reopened goal goes to the **end** of the Current list. `completeGoal` never removes an id from the saved manual order, so `reopenGoal` must remove it, otherwise the goal would jump back to its old position.
- **Edit** lives in the action row revealed by ticking a current goal. **Reopen** is a button on each completed card.
- The add dialog is generalized into one dialog with add and edit modes. No new dependencies, and the goal shape and storage keys do not change.

Run these in order, one at a time, waiting for each to finish. Steps marked ✅ are done.

| # | Status | Command |
| --- | --- | --- |
| 1 | ✅ | `/superpowers:brainstorming` |
| 2 | ☐ | `/superpowers:using-git-worktrees` |
| 3 | ☐ | `/superpowers:writing-plans` |
| 4 | ☐ | `/superpowers:subagent-driven-development` |
| 5 | ☐ | `/superpowers:verification-before-completion` |
| 6 | ☐ | `/superpowers:requesting-code-review` |
| 7 | ☐ | `/superpowers:finishing-a-development-branch` |

**1. Design**

```text
/superpowers:brainstorming Feature for Doit (01-doit-speckit): let users edit a current goal's title and end date, and reopen a completed goal back to Current. Constraints: constitution Principle V forbids any automated tests (no TDD, no test tasks). Read AGENTS.md first. Reuse lib/goals.ts (validateGoalInput, TITLE_MAX_LENGTH), lib/goal-store.ts (save/getSnapshot pattern, add updateGoal and reopenGoal) and components/add-goal-dialog.tsx (generalize to add/edit mode). Open questions: allow keeping an overdue goal's past end date when editing? Where does a reopened goal go in the manual order? Write the design doc in English.
```

**2. Isolated branch**

```text
/superpowers:using-git-worktrees Create a worktree on a new branch 004-edit-reopen-goals for the edit & reopen goals feature.
```

**3. Implementation plan**

```text
/superpowers:writing-plans Write the implementation plan from the edit & reopen goals design doc. Do not include any test or TDD steps: constitution Principle V forbids tests. Verification per task is npm run lint and npm run build plus a manual browser check.
```

**4. Execution**

```text
/superpowers:subagent-driven-development Execute the edit & reopen goals plan. Tell every subagent: read AGENTS.md and node_modules/next/dist/docs/ before writing Next.js code, and never add tests (constitution Principle V).
```

**5. Verification**

```text
/superpowers:verification-before-completion Verify the edit & reopen goals feature: run npm run lint and npm run build, then check in the browser with the Playwright MCP the checklist in the design doc. No test files.
```

**6. Review**

```text
/superpowers:requesting-code-review Review the diff of branch 004-edit-reopen-goals against the design doc.
```

**7. Finish**

```text
/superpowers:finishing-a-development-branch
```

Manual checklist for step 5 (no test files):

- Editing the title and date updates the card and its "days left" label. An empty title or a newly picked past date shows the existing error messages.
- Editing an overdue goal without changing its date saves.
- Reopen moves a completed goal back to Current, clears "Completed …" and places it last (or by end date if there is no manual order).
- Changes survive a reload, and a second tab updates through the `storage` event.
- Keyboard only: Edit and Reopen are reachable, the dialog traps focus, and Esc closes it.

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

### `/speckit-plan` — 2026-11-08

```text
/speckit-plan Plant this using Tailwind @theme for theme colors, local storage for goals, and shadcn for UI components. Use date-fns for data formatting. No unit tests, integration tests, or end-to-end tests needed.
```

### `/speckit-tasks` — 2026-11-08

```text
/speckit-tasks
```

### `/speckit-analyze` — 2026-11-08

```text
/speckit-analyze
```

### `/speckit-implement` — 2026-11-08

```text
/speckit-implement
```

### `/speckit-specify` — 2026-11-08

```text
/speckit-specify Quiero que los colores de la aplicación luzcan mejor, algo mucho mejor que el actual.
```

### `/speckit-plan` — 2026-11-09

```text
/speckit-plan
```

### `/speckit-specify` — 2026-11-09

```text
/speckit-specify drag and drop - Let's make it so that users can reorder goals by dragging and dropping them above or below other goals in the list.
```

### `/speckit-plan` — 2026-11-09

```text
/speckit-plan Plant is using the sortable library for sorting list items and Tailwind for styling. No testing whatsoever.
```

<!-- SPECKIT-COMMANDS:END -->
