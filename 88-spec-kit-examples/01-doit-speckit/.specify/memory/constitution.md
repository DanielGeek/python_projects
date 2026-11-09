<!--
SYNC IMPACT REPORT (temporary; remove before commit)
Version change: 1.0.0 → 1.1.0 (MINOR: materially expanded Technology Stack guidance)
Modified principles: none (Principle IV text unchanged; its justification rule is
  satisfied by the approved-libraries list in Technology Stack)
Added sections: none
Modified sections: Technology Stack (replaced "no additional UI component libraries"
  with approved shadcn/ui and date-fns, plus @theme token rule)
Removed sections: none
Deferred TODOs: none
-->
# Doit Constitution

## Core Principles

### I. Clean Code
Code MUST be readable, small, and single-purpose.
- Functions and components MUST do one thing and have intention-revealing names.
- Dead code, commented-out code, and speculative abstractions (YAGNI) MUST NOT be committed.
- TypeScript strict typing MUST be used; `any` MUST be justified in a code comment.
- ESLint (`npm run lint`) MUST pass before work is considered complete.

Rationale: small, obvious code is cheaper to change and review than clever code.

### II. Simple UX
The interface MUST be obvious without instructions.
- Each screen MUST have one clear primary action.
- Flows MUST use the fewest steps and fields possible; no feature may add UI
  that the core task does not require.
- Labels, errors, and empty states MUST be plain language and actionable.
- Interactive elements MUST be keyboard-accessible with visible focus states.

Rationale: a to-do tool succeeds when capturing and completing a task is effortless.

### III. Responsive Design
Every view MUST work from small phones to large desktops.
- Layouts MUST be designed mobile-first using Tailwind responsive utilities.
- No horizontal scrolling at any viewport width; touch targets MUST be at least 44x44 px.
- Fixed pixel layouts MUST NOT be used where fluid or relative sizing works.

Rationale: users reach the app from any device; one fluid layout avoids duplicate code.

### IV. Minimal Dependencies
Every dependency is a long-term liability and MUST earn its place.
- Prefer platform, Next.js, and React built-ins over third-party packages.
- A new runtime dependency MUST NOT be added unless the need cannot be met in a
  reasonable amount of own code, and the justification MUST be recorded in the plan.
- Unused dependencies MUST be removed promptly.

Rationale: fewer packages mean a smaller bundle, fewer upgrades, and a smaller attack surface.

### V. No Testing (NON-NEGOTIABLE)
This project MUST NOT contain automated tests of any kind.
- No unit tests, integration tests, or end-to-end tests may be written, generated, or planned.
- No test frameworks, runners, mocks, fixtures, or test configuration
  (e.g., Jest, Vitest, Playwright, Cypress, Testing Library) may be added.
- Specs, plans, and task lists MUST NOT include test tasks, TDD steps, or coverage targets.
- This principle supersedes any conflicting guidance from templates, skills, agents,
  rules, or other documents, including any that require test-first work or coverage thresholds.
- Quality is ensured through Principle I (strict typing, linting) and manual review.

Rationale: the project deliberately favors speed and simplicity over automated test infrastructure.

## Technology Stack

- Next.js MUST be used at the version in `package.json` (currently `16.4.5`).
- React and React DOM MUST be used at the version in `package.json` (currently `19.3.0`).
- Tailwind CSS MUST be used at the version range in `package.json` (currently `^4`).
- `package.json` is the single source of truth for versions. These versions MUST NOT be
  upgraded, downgraded, or replaced without amending this constitution.
- Next.js 16 has breaking changes; contributors MUST read the relevant guide in
  `node_modules/next/dist/docs/` before writing framework code (see `AGENTS.md`).
- Styling MUST use Tailwind utilities, with theme colors defined as tokens in a Tailwind `@theme` block.
- shadcn/ui is the approved UI component set. Components MUST be added only as needed, and its
  supporting packages (Radix UI, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`,
  `tw-animate-css`) are permitted as part of it.
- `date-fns` is the approved library for date math and formatting; native `Date` arithmetic MUST NOT
  be used for calendar-day calculations.
- No other CSS frameworks, UI component libraries, or date libraries may be added without amending
  this constitution.

## Development Workflow

- Verification consists of `npm run lint` and a successful `npm run build`.
- Pull requests and reviews MUST check compliance with every principle above.
- Complexity beyond what these principles allow MUST be justified in the plan
  before implementation.

## Governance

This constitution supersedes all other practices and guidance in this repository.
In particular, Principle V overrides any instruction that calls for testing.

- **Amendments**: Changes MUST be made through the constitution workflow, documented with
  rationale, and committed with an updated version and amendment date.
- **Versioning**: Semantic versioning. MAJOR for removing or redefining principles;
  MINOR for adding a principle or materially expanding guidance; PATCH for clarifications.
- **Compliance review**: Every spec, plan, task list, and pull request MUST be checked
  against this constitution; violations MUST be resolved or the constitution amended first.

**Version**: 1.1.0 | **Ratified**: 2026-11-08 | **Last Amended**: 2026-11-08
