# Login Carousel Images

**State:** Approved  
**Date:** 2026-11-28  
**Depends on:** —

## Objective

Add an animated image carousel to the login screen's left panel showcasing the four main benefits of the Open DayCare system: daily communication, real-time tracking, routine control, and direct contact.

## Scope

### In scope
- Generate 4 photorealistic images using AI, each representing one core benefit:
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
  - `daily-communication.jpg`
  - `real-time-tracking.jpg`
  - `routine-control.jpg`
  - `direct-contact.jpg`

## Implementation Plan

### Step 1: Generate carousel images
Generate 4 photorealistic images using AI, one for each benefit:
1. **Daily communication:** Staff member using a tablet to share photos of children playing
2. **Real-time tracking:** Parent looking at phone showing child's activity feed
3. **Routine control:** Caregiver logging meal/nap information on a device
4. **Direct contact:** Staff and parent communicating via messaging app

Save images to `/public/images/carousel/`.

### Step 2: Create carousel component
Create `/components/auth/LoginCarousel.tsx`:
- Import the 4 images
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

- [x] Four photorealistic images exist in `/public/images/carousel/`
- [x] Each image clearly represents one of the four benefits
- [x] Four custom SVG illustrations complement the stock photos
- [x] Carousel will alternate between stock photos and SVG illustrations
- [x] The `LoginCarousel` component exists at `/components/auth/LoginCarousel.tsx`
- [x] The carousel displays in the left panel of the login screen
- [x] Images transition automatically every 5 seconds
- [x] Transitions use smooth fade effect
- [x] Navigation dots indicate the active image
- [x] Existing login elements remain visible and unchanged
- [x] The login form on the right panel is unaffected
- [x] Build completes without errors

## Decisions Taken and Discarded

**Decision:** 4 images (one per benefit)  
**Discarded:** 3 images (less comprehensive coverage), 5-6 images (more generation time, diminishing returns), 7+ images (excessive, slows down the carousel experience)

**Decision:** Photorealistic style  
**Discarded:** Illustration/drawing (less professional appearance for a business tool), mixed styles (inconsistent visual experience)

**Decision:** 5-second transition speed  
**Discarded:** 3 seconds (too fast, users may not absorb the message), 7 seconds (too slow, loses engagement)

**Decision:** Add to left panel (not replace)  
**Discarded:** Replace entire left panel (loses branding and messaging), background image (text readability issues, less control over composition)

**Decision:** Automatic rotation only (no user interaction)  
**Discarded:** Clickable/swipeable carousel (adds complexity, users on login page have a single goal: sign in)
