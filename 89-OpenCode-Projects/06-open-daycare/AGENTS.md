<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Project

Open DayCare — a communication platform for a daycare: staff share each child's day (feed, posts, photos, notices, daily summaries) with their family. Early stage: the App Router scaffold is still mostly the default template.

- Stack: Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4 through `@tailwindcss/turbopack`, npm.
- Commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`. No test framework yet.
- `references/screens/*.dc.html` are the design source of truth (login, feed, children, family account, notices, etc.); `references/screenshots/` holds PNG previews. Build UI against these files instead of inventing flows or styles.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`; per-user data must be cached privately (`'use cache: private'`), never shared.
- Route protection (Next 16): optimistic cookie checks in `proxy.ts` plus real session verification in a DAL; never rely on layout-level auth checks.

## MCPs
- Playwright screenshots or any other relation with Playwight must be inside the .playwright-mcp folder. This is to avoid any confusion with the Playwright test runner.
- Context7: use this MCP to retrieve the updated documentation of the framework. Prefer it over web search for library docs.

## Skills

Spec-driven workflow. Two commands, run in order: define first, implement later.

- `/spec <feature>` — guided spec designer. Asks clarifying questions (scope, data, persistence, risks) before writing anything; never writes code. Saves the result as `specs/NN-slug.md` in `Draft` state and seeds `specs/.spec-config.yml` on first run. Use it when starting a large feature, before writing code. The user is the one who marks the spec as `Approved` after re-reading it.
- `/spec-impl <NN-slug>` — implements an approved spec. Refuses to run unless the spec's state means "Approved" (any language). Creates/switches to the `spec-NN-slug` branch, then implements step by step, pausing after each step for diff review. Out-of-scope requests go into the next spec, not the current branch.

Workflow config lives in `specs/.spec-config.yml`: `AutoCreateBranch` (default `true`, branch per spec) and `AutoCommitSteps` (default `false`, the user commits; `true` commits each step as `spec-NN-step-MM`).
