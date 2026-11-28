# Login Carousel Images

**State:** Implemented  
**Date:** 2026-11-28  
**Depends on:** —

## Objective

Add an animated image carousel to the login screen's left panel showcasing the four main benefits of the Open DayCare system: daily communication, real-time tracking, routine control, and direct contact.

## Scope

### In scope
- Create 4 custom SVG illustrations, each representing one core benefit:
  1. Daily communication (staff sharing photos/updates)
  2. Real-time tracking (parents viewing their child's day)
  3. Routine control (meals, naps, activities management)
  4. Direct contact (messaging between staff and families)
- Create a React carousel component with automatic transitions every 5 seconds
- Add the carousel to the login screen's left panel, below the existing text
- Include navigation indicators (dots) showing the active image
- Smooth fade transitions between images

### Out of scope
- User interaction with the carousel (clicking, swiping)
- Video backgrounds or video files
- Changes to the login form or right panel
- Responsive adjustments beyond the current desktop-first design
- Animation of text or other UI elements

## Data Model

No new data structures. This feature only adds static assets and UI components.

- **Image assets:** 4 files stored in `/public/images/carousel/`
  - `daily-communication.svg`
  - `real-time-tracking.svg`
  - `routine-control.svg`
  - `direct-contact.svg`

## Implementation Plan

### Step 1: Create carousel SVG illustrations
Create 4 custom SVG illustrations, one for each benefit:
1. **Daily communication:** Tablet with photo sharing, child figures, warm colors
2. **Real-time tracking:** Phone with activity feed, live indicator, notifications
3. **Routine control:** Clipboard with schedule items, checkmarks, colorful icons
4. **Direct contact:** Chat bubbles between parent and staff figures

Save SVGs to `/public/images/carousel/`.

### Step 2: Create carousel component
Create `/components/auth/LoginCarousel.tsx`:
- Import the 4 SVG images
- Implement automatic rotation every 5 seconds using `useState` and `useEffect`
- Use CSS transitions for smooth fade effect between images
- Add navigation dots at the bottom indicating active image
- Component is purely presentational, no props needed

### Step 3: Integrate carousel into login page
Modify `/app/(auth)/login/page.tsx`:
- Import `LoginCarousel` component
- Add it to the left panel, positioned below the existing text content
- Ensure it fits within the available space (approximately 400-450px height)
- Maintain the orange gradient background, logo, and headline text

### Step 4: Verify and test
- Run the development server
- Verify the login page displays the carousel correctly
- Confirm images transition automatically every 5 seconds
- Check that navigation dots update with the active image
- Ensure smooth fade transitions
- Test that the existing login functionality still works

## Acceptance Criteria

- [x] Four custom SVG illustrations exist in `/public/images/carousel/`
- [x] Each SVG clearly represents one of the four benefits
- [x] The `LoginCarousel` component exists at `/components/auth/LoginCarousel.tsx`
- [x] The carousel displays in the left panel of the login screen
- [x] Images transition automatically every 5 seconds
- [x] Transitions use smooth fade effect
- [x] Navigation dots indicate the active image
- [x] Existing login elements remain visible and unchanged
- [x] The login form on the right panel is unaffected
- [x] Build completes without errors

## Decisions Taken and Discarded

**Decision:** 4 SVG illustrations (one per benefit)  
**Discarded:** 3 images (less comprehensive coverage), 5-6 images (more generation time, diminishing returns), 7+ images (excessive, slows down the carousel experience)

**Decision:** Custom SVG style with warm color palette  
**Discarded:** Photorealistic images (file size, loading time), illustration/drawing style (less professional appearance), mixed styles (inconsistent visual experience)

**Decision:** 5-second transition speed  
**Discarded:** 3 seconds (too fast, users may not absorb the message), 7 seconds (too slow, loses engagement)

**Decision:** Add to left panel (not replace)  
**Discarded:** Replace entire left panel (loses branding and messaging), background image (text readability issues, less control over composition)

**Decision:** Automatic rotation only (no user interaction)  
**Discarded:** Clickable/swipeable carousel (adds complexity, users on login page have a single goal: sign in)

**Decision:** SVG-only (no stock photos)  
**Discarded:** Mix of stock photos and SVG (inconsistent visual style, larger file sizes, dependency on external images), stock photos only (less control over branding, slower loading)
