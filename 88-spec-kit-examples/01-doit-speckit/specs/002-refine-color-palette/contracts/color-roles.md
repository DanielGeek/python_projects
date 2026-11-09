# Contract: Color Roles

The app has no API. The interface between the design and the components is the set of color tokens
declared in `app/globals.css`. Components MUST use these tokens (through Tailwind utilities such as
`bg-urgent`, `text-ink-soft`, `border-control`) and MUST NOT use hex values, opacity-derived tints of a
role, or any other hue class.

## Palette tokens (Tailwind `@theme`)

| Token | Value | Role | Allowed use |
|-------|-------|------|-------------|
| `--color-cream` | `#FAF8F5` | page background | page; neutral goal cards |
| `--color-surface` | `#FFFFFF` | surface | columns, dialogs |
| `--color-line` | `#E6E0D6` | border (decorative), subtle fill | card and column borders, skeleton, hover fill. Never a control boundary |
| `--color-control` | `#7C7690` | control boundary | checkbox outline, input borders, outline-button border |
| `--color-ink` | `#1F1B2E` | primary text | all body text |
| `--color-ink-soft` | `#5B566B` | secondary text | counts, dates, empty states |
| `--color-brand` | `#6D4AFF` | accent | primary button, checked checkbox, focus ring |
| `--color-brand-strong` | `#5B3AE6` | accent (hover) | primary button hover |
| `--color-urgent` | `#FFE8D6` | due-soon surface | due-soon card |
| `--color-urgent-foreground` | `#B4410C` | due-soon text and border | due-soon border, icon, label |
| `--color-done` | `#E3F5EC` | completed surface | completed card |
| `--color-done-foreground` | `#1F7A4D` | completed text | reserved for completed accents |
| `--color-danger` | `#B01D36` | destructive | error text, destructive button text |
| `--color-danger-soft` | `#FBE4E8` | destructive surface | destructive button fill |

## shadcn/ui semantic mapping (`:root`)

| shadcn variable | Maps to |
|-----------------|---------|
| `--background` | `cream` |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--accent-foreground`, `--secondary-foreground` | `ink` |
| `--card` | `cream` (cards sit inset inside white columns) |
| `--popover` | `surface` |
| `--primary` | `brand` (hover: `brand-strong`) |
| `--primary-foreground` | `#FFFFFF` (white on `brand`, 5.15:1) |
| `--secondary`, `--muted`, `--accent` | `line` |
| `--muted-foreground` | `ink-soft` |
| `--destructive` | `danger` |
| `--border` | `line` |
| `--input` | `control` |
| `--ring` | `brand` |

## Rules (verified in the quickstart)

1. Every text and background pair is at least 4.5:1; every control boundary and focus indicator is at least 3:1 (see [research.md](../research.md) for the measured values).
2. `brand` is the only accent and is never decorative.
3. Focus ring: 2 px, full strength, 2 px offset. No translucent rings.
4. No hex literals and no `sky`, `mint`, `lavender`, `peach`, or `rose` classes remain in `components/` or `app/`; the only hex values live in the theme block of `app/globals.css`.
5. The page declares `color-scheme: light`.
