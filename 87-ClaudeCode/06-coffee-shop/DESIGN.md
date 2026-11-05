---
name: Nogal Café
description: A warm, dark, craft-roastery storefront where caramel is the only light and every coffee leads with its origin.
colors:
  toaster-black: "#141210"
  toasted-walnut: "#5C3414"
  caramel-cream: "#D4AC66"
  caramel-cream-hover: "#E2BF80"
  milk-foam: "#F2EEE6"
  workshop-charcoal: "#2E2C29"
  error-clay: "#E58A6E"
  error-clay-text: "#F0A58E"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(42px, 6vw, 80px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(30px, 4vw, 44px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.12
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.18em"
rounded:
  chip: "10px"
  panel: "14px"
  card: "18px"
  feature: "24px"
  pill: "999px"
spacing:
  gutter: "24px"
  grid-gap: "20px"
  card-padding: "20px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.caramel-cream}"
    textColor: "{colors.toaster-black}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.caramel-cream-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.milk-foam}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "48px"
  product-card:
    backgroundColor: "{colors.workshop-charcoal}"
    textColor: "{colors.milk-foam}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  option-pill:
    backgroundColor: "transparent"
    textColor: "{colors.milk-foam}"
    rounded: "{rounded.chip}"
    padding: "9px 12px"
  option-pill-selected:
    backgroundColor: "{colors.milk-foam}"
    textColor: "{colors.toaster-black}"
  newsletter-input:
    backgroundColor: "{colors.toaster-black}"
    textColor: "{colors.milk-foam}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 22px"
---

# Design System: Nogal Café

## Overview

**Creative North Star: "El tostador de nogal"**

The system is a small roastery at dusk: a near-black room, walnut wood on the walls and shelves, and caramel as the single warm light. Everything is built from a warm black rather than pure black, with milk-foam type on top. It should feel artisanal and warm, premium but close, never the cold luxury of a fashion brand nor the flat look of a coffee chain.

Density is generous. Sections breathe on a 96px vertical rhythm, headings are set large in a serif with character, and the interface stays quiet so the product and its origin carry the page. Shapes are rounded and tactile: pills for actions, wide-cornered cards that lift slightly on hover. Dark layers stack tonally (black, charcoal, walnut) instead of relying on shadows.

The one light-surface moment is the subscription section, a foam-coloured band that interrupts the dark and signals "a different kind of decision here".

**Key Characteristics:**
- Warm black ground; walnut for emphasis sections; foam for the single light band.
- Caramel reserved for things the visitor can press, plus a few data accents (prices, ratings).
- Serif headings with an italic caramel emphasis word; neutral sans for everything functional.
- Rounded, tactile components; depth by tonal layering, shadow only on physical objects and floating layers.

## Colors

A roastery palette: one near-black, one wood brown, one caramel, one off-white, one workshop grey. The five are the whole system.

### Primary
- **Caramel Cream** (#D4AC66): the only accent. Primary buttons, prices, the roast-level bar, ratings, the free-shipping progress fill, the italic emphasis word in the hero, focus outlines.
- **Caramel Cream Hover** (#E2BF80): the lighter state of Caramel Cream on primary buttons.

### Secondary
- **Toasted Walnut** (#5C3414): the wood. Origin section background, footer, newsletter panel gradient, "Nuevo" bag colour, avatar discs, and the shelf strip under each product bag.

### Neutral
- **Toaster Black** (#141210): the page ground and the text colour on caramel and foam surfaces. Warm, never #000.
- **Workshop Charcoal** (#2E2C29): raised surfaces on the black: product cards, review cards, the benefits band, hover fill for icon buttons, empty progress track.
- **Milk Foam** (#F2EEE6): primary text on dark, the single light section background, and the fill of selected option pills and toasts. Secondary text is Milk Foam at 70%, 50% and 10% opacity for body, hints and hairlines.

### Feedback
- **Error Clay** (#E58A6E) and **Error Clay Text** (#F0A58E): invalid newsletter field border and its message. Success reuses Caramel Cream.

### Named Rules
**The One Light Rule.** Caramel is the only accent. If it is not pressable, a price, a rating or a roast level, it should not be caramel. Its rarity is what makes the call to action readable.

**The Warm Black Rule.** The ground is #141210, never #000, and every grey is a warm one. Cold neutrals break the roastery.

## Typography

**Display Font:** Newsreader (with Georgia, serif)
**Body Font:** Instrument Sans (with system-ui, sans-serif)

**Character:** A high-contrast serif with italics gives headlines warmth and authority; Instrument Sans keeps everything functional quiet and legible. The serif speaks about the coffee, the sans handles buying it.

### Hierarchy
- **Display** (600, clamp(42px, 6vw, 80px), 1.12): hero headline only, with one italic Newsreader 500 word in Caramel Cream.
- **Headline** (600, clamp(30px, 4vw, 44px), 1.12, max 18ch): section titles.
- **Title** (600, 21px to 24px, 1.12): product names, step titles, method names, drawer title.
- **Body** (400, 16px, 1.6): running copy; lead paragraphs in the hero and origin sections go to 17px to 18px at 70% to 80% foam. Keep lines at or under 46ch to 54ch.
- **Price** (Newsreader 600, 22px, Caramel Cream): numbers that matter, such as price and totals.

### Named Rules
**The Serif Speaks Rule.** Newsreader carries meaning (headings, prices, quotes, big numbers). Instrument Sans carries function (buttons, fields, metadata). Never set a button label in the serif.

## Layout

A single 1200px container with 24px side gutters (16px under 560px). Sections sit on a 96px vertical rhythm (72px under 860px). Grids use a 20px gap: four columns for products, three for steps, reviews and methods, collapsing to two at 1080px and one at 560px to 860px.

The hero is a full-height split (text and photograph) that stacks under 860px with the photograph first and the copy pulled up over its fade. The origin section is a full-bleed half-and-half. The header is sticky at 72px.

Section heads pair a headline with an optional side element (link, paragraph or rating), aligned to the baseline and wrapping on narrow screens.

Mobile is the primary channel: tap targets are 44px or larger, the menu becomes a full-screen serif list, and the cart is a drawer that fills the screen width.

## Elevation & Depth

Tonal layering first. At rest everything is flat: Toaster Black ground, Workshop Charcoal cards, Toasted Walnut sections. Depth is conveyed by which layer a surface sits on, not by shadow.

Shadow is reserved for two things: physical objects (the coffee bag, which casts a long diagonal shadow) and floating layers (the cart drawer, the toast).

### Shadow Vocabulary
- **Bag** (`box-shadow: 18px 22px 30px rgba(0,0,0,.45), inset -10px 0 18px rgba(0,0,0,.25), inset 6px 0 10px rgba(255,255,255,.04)`): the product bag on its shelf.
- **Toast** (`box-shadow: 0 18px 40px rgba(0,0,0,.4)`): the "added to cart" notice.
- **Hero tag halo** (`box-shadow: 0 0 0 5px rgba(212,172,102,.2)`): the caramel dot beside "Hoy en la taza".

### Named Rules
**The Flat-At-Rest Rule.** Cards and panels never carry a shadow in their resting state. Hover lifts them 3px and turns the border caramel at 35% instead.

## Shapes

Rounded and tactile. Actions and inputs are full pills (999px). Cards use a wide 18px corner, small panels 14px, option chips 10px, and the newsletter feature panel 24px. Hairline borders are Milk Foam at 10% to 12% opacity, turning Caramel Cream at 35% on hover. Silhouettes are soft rectangles and circles; the only angular element is the bag with its folded top.

## Components

### Buttons
- **Shape:** full pill (999px), 48px minimum height, 26px horizontal padding, 15px Instrument Sans 600.
- **Primary:** Caramel Cream fill with Toaster Black text; hover lightens to Caramel Cream Hover; pressed moves down 1px.
- **Secondary:** transparent with a 1.5px Milk Foam 50% outline; hover brightens the outline to full foam and adds a 6% foam wash.
- **Text:** no box; Milk Foam text underlined in caramel with a 5px offset; hover turns the text caramel.
- **Focus:** 2px Caramel Cream outline at 3px offset on every interactive element.

### Product Card
- **Corner Style:** 18px. **Background:** Workshop Charcoal over a warm "photo" area (brown radial gradient, a walnut shelf strip and the coffee bag).
- **Content order:** badge, name with origin line, price in serif caramel, tasting-note chips, roast-level bar, weight and grind option pills, full-width primary button.
- **Hover:** lifts 3px, border turns Caramel Cream at 35%, the bag tilts 2 degrees.

### Option Pills
- **Style:** 10px radius, 1px foam hairline, 13px Instrument Sans 500, foam at 70%.
- **Selected:** Milk Foam fill with Toaster Black text (`aria-pressed="true"`). Selection state is never colour-only: the fill inverts.

### Inputs / Fields
- **Style:** full-pill, 52px high, 1.5px Milk Foam 25% stroke, Toaster Black at 35% fill, 22px padding.
- **Focus:** stroke turns Caramel Cream. **Error:** Error Clay stroke with Error Clay Text message. **Success:** Caramel Cream stroke and message.

### Navigation
- **Style:** transparent links in foam at 70%, 15px, turning full foam on hover, over a sticky Toaster Black bar at 90% opacity with a 12px backdrop blur and a hairline bottom border.
- **Mobile:** burger opens a full-screen Toaster Black sheet of 30px serif links separated by hairlines, ending in a primary button.

### Cart Drawer
Right-side panel (up to 420px) on Toaster Black with a hairline left edge, a free-shipping progress bar (6px, caramel fill on a charcoal track), line items with quantity steppers, and a totals block ending in the primary button. It slides in over a 55% black overlay.

### Toast
Milk Foam surface, 14px radius, Toasted Walnut check disc, Toaster Black text, and a dark pill action ("Ver carrito"). Slides up from the bottom edge.

## Do's and Don'ts

### Do:
- **Do** keep Caramel Cream (#D4AC66) for pressable things, prices, ratings and roast levels only.
- **Do** lead every coffee with its origin line (country and altitude) before its price.
- **Do** use Toaster Black (#141210) and warm greys; keep Milk Foam as text and as the one light section.
- **Do** make actions full pills and cards 18px, and lift cards 3px with a caramel border on hover.
- **Do** keep tap targets at 44px or larger and show a 2px caramel focus outline on everything interactive.
- **Do** set headings in Newsreader and all functional text in Instrument Sans.

### Don't:
- **Don't** use pure black, cold greys or a second accent colour next to caramel.
- **Don't** give resting cards or panels a shadow; shadow belongs to the bag, the drawer and the toast.
- **Don't** drift into cold luxury or chain-café flatness: no thin hairline-only minimalism, no stock gradients, no glossy effects.
- **Don't** set buttons, fields or metadata in the serif.
- **Don't** present placeholder numbers (ratings, review counts, farm counts, premiums) as real facts in new surfaces.
