# Research: Goal Tracking Board

All Technical Context items are resolved; no `NEEDS CLARIFICATION` remains. Sources: shadcn/ui and
date-fns documentation (via Context7) and the Next.js 16 docs bundled in `node_modules/next/dist/docs/`.

## 1. Theme colors with Tailwind `@theme`

- **Decision**: Define the pastel palette as design tokens in a `@theme` block in `app/globals.css`
  (for example `--color-mint-100`, `--color-lavender-200`, `--color-peach-200`, `--color-rose-200`,
  `--color-sky-100`, `--color-ink`). Map shadcn/ui semantic variables (`--background`, `--card`, `--primary`,
  `--accent`, `--destructive`, `--border`, `--ring`) to those tokens, and expose them with `@theme inline` as
  shadcn/ui expects (`--color-primary: var(--primary)`).
- **Rationale**: `@theme` generates Tailwind utilities (`bg-mint-100`) directly from tokens, so colors live in
  one place. This is the Tailwind v4 way and needs no config file.
- **Alternatives considered**: `tailwind.config.ts` (not used in Tailwind v4 by default); hard-coded hex values in
  components (violates clean code and makes theming hard).
- **Notes**: Light theme only. Remove the `prefers-color-scheme: dark` block from the create-next-app boilerplate.
  Pastel backgrounds need dark enough text (`--color-ink`) to stay readable (FR-014).

## 2. shadcn/ui with Next.js 16, React 19 and Tailwind v4

- **Decision**: Initialize with the shadcn CLI (`components.json`, `lib/utils.ts`), then add only
  `button`, `input`, `label`, `checkbox`, `dialog` and `alert-dialog`.
- **Rationale**: The current shadcn/ui targets Tailwind v4 (`@import "tw-animate-css"`, `@theme inline`, OKLCH
  tokens) and React 19. Components are copied into the repo, so only what is used is kept. `Dialog` covers the new
  goal modal (FR-004, FR-011); `AlertDialog` covers the delete confirmation (FR-009).
- **Alternatives considered**: Native `<dialog>` element (fewer dependencies, but the user asked for shadcn/ui);
  Headless UI or Material UI (not requested, heavier).
- **Guardrail**: After running the CLI, `package.json` MUST still show `next` 16.4.5, `react` and `react-dom`
  19.3.0 and `tailwindcss` ^4. If the CLI changes any of them, revert those lines.

## 3. Persistence in `localStorage`

- **Decision**: One key, `doit:goals:v1`, holding a JSON array of goals. A small store module reads, validates
  and writes it, and notifies subscribers. React reads it through `useSyncExternalStore` with a server snapshot of
  an empty list.
- **Rationale**: `localStorage` is not available during server rendering, so reading it in a component body causes
  hydration mismatches (see Next.js "Preventing flash before hydration" guide). `useSyncExternalStore` handles the
  server/client difference and cross-tab updates (`storage` event) without `useEffect` + `setState`.
- **Alternatives considered**: `useEffect` + `useState` (causes a flash and trips the React Hooks lint rule against
  setting state in effects); a state library (extra dependency, violates Principle IV); IndexedDB (overkill).
- **Error handling**: Missing, corrupt or non-array data is treated as an empty list. A failed write (quota or
  private mode) keeps the in-memory state and does not crash the page.
- **Brief empty flash**: the server renders the empty board and the client replaces it with saved goals right after
  hydration. The columns render a neutral state until the first client snapshot, so saved goals never flicker as "empty".

## 4. Date handling with `date-fns`

- **Decision**: Store `endDate` and `completedAt` as local calendar dates in `yyyy-MM-dd`. Use `parseISO`,
  `startOfDay`, `differenceInCalendarDays` and `format`.
  - Days left = `differenceInCalendarDays(parseISO(endDate), startOfDay(today))`.
  - Highlighted when days left <= 3 (includes today and overdue).
  - Native date input value = `format(date, "yyyy-MM-dd")`.
  - Display: `format(date, "MMM d, yyyy")`.
- **Rationale**: Calendar-day math is DST-safe (documented behavior of `differenceInCalendarDays`) and matches the
  spec's "calendar days" assumption. A date-only string avoids time zone drift.
- **Alternatives considered**: Native `Date` subtraction (breaks around DST); storing full ISO timestamps (adds
  time zone ambiguity for a date-only feature).
- **Midnight rollover**: "today" is read when rendering and refreshed when the tab regains focus
  (`visibilitychange`), so the day count stays correct without a timer.

## 5. Selection and delete flow

- **Decision**: Checking a goal's checkbox only marks it as selected in component state (not persisted); a
  selected card shows the two actions. "Delete permanently" opens an `AlertDialog`; confirming removes the goal.
  Unchecking clears the selection.
- **Rationale**: Matches FR-007 to FR-009 and the spec acceptance scenarios exactly, with no extra storage state.

## 6. Ordering and layout

- **Decision**: Current goals sorted by `endDate` ascending, ties by `createdAt` ascending (FR-016). Completed
  goals sorted by `completedAt` descending (most recent first; the spec is silent, this is the natural default).
  Layout is a single column below the `md` breakpoint and two columns from `md` up.
- **Rationale**: Mobile-first responsive design per Principle III; no horizontal scroll.

## 7. Verification without tests

- **Decision**: Quality gates are `npm run lint`, `npm run build`, and the manual walkthrough in
  [quickstart.md](quickstart.md).
- **Rationale**: Constitution Principle V forbids unit, integration and end-to-end tests.
