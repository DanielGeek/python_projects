# Research: Refined Color Palette

All open questions were resolved during `/speckit-specify` (direction: refined pastel; scope: light theme only).
This file records the design decisions and the measured contrast that back them.

## Decision 1: Name colors by role, not by hue scale

- **Decision**: Replace the `mint`, `lavender`, `peach`, `rose`, and `sky` four-step scales with role tokens
  (`cream`, `surface`, `line`, `control`, `ink`, `ink-soft`, `brand`, `brand-strong`, `urgent`, `done`, `danger`).
- **Rationale**: FR-001 and FR-009 require every color to belong to a defined role. Today components pick
  hues directly (`bg-sky-50`, `border-mint-200`), which is how one-off colors creep in. Role names also make a
  future palette change a one-file edit.
- **Alternatives considered**: Keep the hue scales and only change values (rejected: leaves hue-named classes
  in components and does not enforce FR-009); use only shadcn semantic variables (rejected: it has no
  "urgent" or "done" role).

## Decision 2: Reference palette (starting values from the spec)

| Role | Value | Where it appears |
|------|-------|------------------|
| cream | `#FAF8F5` | page background; neutral goal cards |
| surface | `#FFFFFF` | columns, dialogs |
| line | `#E6E0D6` | decorative borders, subtle fills (skeleton, hover) |
| control | `#7C7690` | checkbox outline, input borders, outline-button border |
| ink | `#1F1B2E` | body text |
| ink-soft | `#5B566B` | secondary text |
| brand (accent) | `#6D4AFF` / hover `#5B3AE6` | primary button, checked checkbox, focus ring |
| urgent | `#FFE8D6` / foreground `#B4410C` | due-soon card surface; its border, icon and label |
| done | `#E3F5EC` / foreground `#1F7A4D` | completed card surface and accent text |
| danger | `#B01D36` / soft `#FBE4E8` | error text, destructive button |

The shadcn name `accent` already means "subtle hover fill" in the generated components, so the spec's
"accent" role is the token `brand` to avoid a clash.

## Decision 3: Measured contrast (WCAG 2.x relative luminance)

Required: text at least 4.5:1 (FR-006), control boundaries and focus indicators at least 3:1 (FR-007).

| Pair | Ratio | Needs | Result |
|------|-------|-------|--------|
| ink on cream / on surface | 15.79 / 16.74 | 4.5 | pass |
| ink on urgent | 14.16 | 4.5 | pass |
| ink-soft on cream / surface / urgent / done | 6.63 / 7.03 / 5.95 / 6.20 | 4.5 | pass |
| white on brand / on brand-strong | 5.15 / 6.58 | 4.5 | pass |
| urgent-foreground on urgent | 4.80 | 4.5 | pass |
| done-foreground on done | 4.69 | 4.5 | pass |
| danger on surface / on cream / on danger-soft | 5.91 / 5.58 / 5.65 | 4.5 | pass |
| control on surface / cream / urgent / done | 4.33 / 4.08 / 3.66 / 3.82 | 3 | pass |
| brand (focus ring) on surface / cream / urgent / done | 5.15 / 4.86 / 4.36 / 4.55 | 3 | pass |

`line` (`#E6E0D6` on cream, 1.24:1) is used only for decorative separation, never for a control boundary.

## Decision 4: Fix two shadcn defaults that would break the contrast rules

- **Translucent focus halo**: the generated components use `focus-visible:ring-ring/50`. A 50% accent ring
  blends toward the background and can fall under 3:1 (FR-007). **Decision**: use a full-strength 2 px ring
  with a 2 px offset (`focus-visible:ring-2 ring-ring ring-offset-2`) in `button.tsx`, `checkbox.tsx`, and
  `input.tsx`. The offset also keeps the ring visible on the filled primary button, where a same-color border
  would disappear.
- **Translucent hover/tint**: the default button hover is `bg-primary/80`, and the destructive variant is
  `bg-destructive/10`. At 80% the white label on the accent drops below 4.5:1, and alpha tints are colors
  outside the defined roles (FR-009). **Decision**: hover uses `brand-strong`; the destructive variant uses the
  `danger-soft` role.
- **Alternatives considered**: global `:focus-visible` outline in the base layer (rejected: the components
  set `outline-none`, which wins over base styles); leaving shadcn defaults (rejected: fails FR-007/FR-009).

## Decision 5: Keep light theme enforced

- **Decision**: add `color-scheme: light` on the root and keep the inert `@custom-variant dark` from feature 001.
- **Rationale**: FR-010. Without `color-scheme`, native pieces (date picker popup, scrollbars) can render dark
  under an OS dark preference even though the CSS palette is light.
- **Alternatives considered**: remove the `dark:` utilities from the generated components (rejected: edits
  many shadcn lines for no visible effect).

## Decision 6: Status treatment

- **Decision**: due-soon = `urgent` surface, 2 px `urgent-foreground` border, alarm icon, and the label text
  ("Due today", "N days left", "N days overdue"). Completed = `done` surface with `line` border. Normal =
  `cream` card with `line` border, sitting inside a white column so it reads as inset.
- **Rationale**: FR-004 and FR-005. Normal goals stay low-key so due-soon cards dominate; the thick border,
  icon, and text mean status never depends on hue alone (also covers color-blind users).
- **Alternatives considered**: tinting whole columns (rejected: spec asks for white columns, and tinted
  columns compete with status colors).
