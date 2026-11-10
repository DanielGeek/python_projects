# 88 - Spec Kit Examples

Examples of spec-driven development with [GitHub Spec Kit](https://github.com/github/spec-kit) and Claude Code.
Each project keeps its specs next to the code and records the exact `/speckit-*` commands used, so the workflow
can be repeated in new projects.

| #   | Project                                  | Type                  | Stack                                                        |
| --- | ---------------------------------------- | --------------------- | ------------------------------------------------------------ |
| 01  | [doit-speckit](./01-doit-speckit)        | Goal-tracking web app | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, SortableJS  |
| 02  | [podsite](./02-podsite)                  | Static podcast website | Next.js 16 (static export), React 19, TypeScript, plain CSS, Vitest, Playwright + axe |

## 01 - Doit

A goal-tracking board with a column of current goals (with days left) and a column of completed goals. It was built
one feature at a time, each with its own spec, plan, task list and manual quickstart under
[`specs/`](./01-doit-speckit/specs):

| Spec | Feature | What it adds |
| --- | --- | --- |
| `001-goal-tracking-board` | Goal tracking board | Two columns, add-goal modal, complete or delete, due-soon highlight, `localStorage` persistence |
| `002-refine-color-palette` | Refined color palette | Color roles defined as Tailwind `@theme` tokens, contrast-checked |
| `003-goal-drag-reorder` | Drag-and-drop reordering | Reorder current goals with mouse, touch or keyboard using SortableJS; the order is saved on the device |

See the [project README](./01-doit-speckit/README.md) for the stack, the project principles, how to run it, how to add
Spec Kit to an existing project, and the full command log.

## 02 - Podsite

A sleek, mobile-first website for a fictional podcast, **Afterglow**: a landing page with one featured episode, an
episodes page, an about page and a facts page, all fed by 20 mocked episodes (no real feed). It is built as a fully
static site: Next.js with `output: 'export'`, no server and no database. Its single feature lives under
[`specs/`](./02-podsite/specs):

| Spec | Feature | What it adds |
| --- | --- | --- |
| `001-podcast-website` | Podcast website | Four pages, 20 mocked episodes, generated SVG cover art, facts computed from the episode data, custom 404, JSON-LD, sitemap and robots |

The constitution keeps it small: static-first (deployable as plain files to any static host), simplicity (a framework
has to be justified in the plan) and an accessibility and SEO baseline. It is checked by 21 Vitest unit tests and 75
Playwright tests, including axe accessibility audits, run against the exported site. Lighthouse scores 100 on
performance, accessibility, best practices and SEO for all four pages.

Run it:

```bash
cd 02-podsite
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
npm run test         # unit tests
npm run test:e2e     # end-to-end tests against ./out (after a build)
```

Spec Kit commands used, in order:

| Step | Command | Input |
| --- | --- | --- |
| Constitution | `/speckit-constitution` | Bare-minimum principles for a static web app |
| Specify | `/speckit-specify` | A modern, sleek podcast website with landing, episodes, about and facts pages and 20 mocked episodes |
| Plan | `/speckit-plan` | Next.js with static site configuration, no database, mock data embedded, responsive and mobile ready |
| Tasks | `/speckit-tasks` | "break this down into tasks" (46 tasks in 7 phases) |
| Implement | `/speckit-implement` | No extra input |
