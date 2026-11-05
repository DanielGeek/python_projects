# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 with Tailwind CSS v4 (via `@tailwindcss/vite`). Static output. Source layout is fixed by the README: `src/{pages, components, layouts, styles, scripts, types, utils, config}`; static assets live in `public/`.

## Users

Home coffee enthusiasts: people who brew at home (V60, espresso, French press), mostly shop from their phone, and want fresh coffee on a recurring basis. Spanish-speaking.

## Product Purpose

An online shop that sells specialty coffee (whole bean, ground, capsule) and subscriptions. Success is a visitor adding a bag to the cart or starting a subscription from the landing page, then coming back for the next bag.

## Positioning

Direct origin and traceability: the coffee is bought straight from named farms, and each bag tells the buyer who grew it and at what altitude. Freshness (roast-to-order) and a flexible subscription are supporting benefits, not the main claim.

## Operating Context

Purchase flow: choose coffee, weight (250 g, 500 g, 1 kg) and grind (bean, ground, capsule), add to a side cart, free shipping above a subtotal threshold, then checkout. Subscription: choose coffee, frequency, quantity, with the saving visible. Brewing guides (espresso, V60, French press) support both SEO and purchase decisions.

## Capabilities and Constraints

- Implemented: Home landing page (hero, benefits strip, featured coffees with weight/grind selectors, subscription steps, origin story, reviews, brewing guide, newsletter, footer), side cart with free-shipping progress, "added to cart" notice, mobile menu, newsletter validation.
- Cart lives in memory only (no persistence, no checkout, no backend yet).
- Not built yet (planned in `plan-landing-coffee.md`): catalog with filters, product page, subscription page, checkout, order confirmation, about/origin, brewing guide, account, contact/FAQ, legal pages. Links to them currently show a "coming soon" notice.
- Copy language is Spanish; code, docs and specs are English.
- Currency shown in USD with a decimal comma (e.g. `$18,00`).

## Brand Commitments

Brand name in the current design is "Nogal Café" (wordmark "Nogal."). The palette and typefaces in `plan-landing-coffee.md` (warm black, walnut, caramel, foam, charcoal; serif headings, neutral sans body) are the existing project decisions; their visual treatment is owned by the design flow, not this file.

## Evidence on Hand

- One real photo: `public/images/coffee.jpg` (black cup with tulip latte art on a wooden table).
- All business figures in the current design are placeholders and must not be presented as facts: farms count, roast-to-door time, roast days, rating and review count, reviews and reviewer names, prices, shipping threshold, the 40% above fair-trade premium, the subscription discount, altitudes and SCA scores.
- There are no real testimonials, customers, certifications or press yet; do not fabricate more.

## Product Principles

1. Traceability is the proof: every coffee shows its farm, country and altitude before price.
2. Honest numbers: never show a statistic, review or guarantee the business cannot back up.
3. Phone first: most coffee purchases happen on a phone, so buying must be effortless there.
4. Fresh and recurring: make the second bag as easy to get as the first.
5. Keep the shop's structure predictable so new pages (catalog, product, checkout) extend it rather than reinvent it.

## Accessibility & Inclusion

No product-specific standard established. Baseline carried by the current build: semantic landmarks, keyboard-focusable controls with visible focus, labelled form fields, and `aria-pressed` state on option buttons.
