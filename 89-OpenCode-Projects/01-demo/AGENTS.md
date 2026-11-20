# AGENTS.md

Static demo website for exploring OpenCode. No build step, no dependencies, no tests.

- Preview: open `index.html` directly in a browser (no dev server needed; requires internet for the Tailwind CDN).
- Tailwind CSS v4 loads via the browser CDN (`@tailwindcss/browser`) — no local build; styles are utility classes in the HTML (e.g. `bg-[#aec6cf]` on `<body>`).
