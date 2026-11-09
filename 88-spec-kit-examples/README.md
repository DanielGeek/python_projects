# 88 - Spec Kit Examples

Examples of spec-driven development with [GitHub Spec Kit](https://github.com/github/spec-kit) and Claude Code.
Each project keeps its specs next to the code and records the exact `/speckit-*` commands used, so the workflow
can be repeated in new projects.

| #   | Project                                  | Type                  | Stack                                                        |
| --- | ---------------------------------------- | --------------------- | ------------------------------------------------------------ |
| 01  | [doit-speckit](./01-doit-speckit)        | Goal-tracking web app | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, SortableJS  |

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
