# Game with themes

Memory of the `skin-designer` agent (`.claude/agents/skin-designer.md`). Goal: a game that gets skins has `classic` (default), `retro` and `neon`, a light/dark toggle, and looks good in both themes.

This file only tracks the games the user asked the agent to skin. A game with no row here was not requested; it does not mean it is missing skins.

| Game | Classic | Retro | Neon | Light/Dark toggle | Dark checked | Light checked | Last run | Notes |
| ---- | ------- | ----- | ---- | ----------------- | ------------ | ------------- | -------- | ----- |
| asteroids | yes | yes | yes | yes | yes | yes | 2026-10-21 | `SKINS` + `glow()` helper in `game.js`, CSS vars in a `<style>` block (no style.css). Retro: amber phosphor (dark) / LCD green (light), 2.5px miter strokes, square bullets, canvas scanlines, Courier. Neon: dark play area in both themes, glow 12, cyan rocks, green ship, yellow shots, magenta power-up, cyan frame glow. Toolbar is `position: fixed` bottom-left with its own background (canvas size untouched; it overlaps the canvas corner). Closest contrast: classic light flame 4.98:1 (min 3:1 for pieces). |
