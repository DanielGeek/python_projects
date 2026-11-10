import { expect, test } from '@playwright/test';

const PATHS = ['/', '/episodes/', '/about/', '/facts/', '/does-not-exist/'];

test.describe('Responsive layout (SC-005, FR-010)', () => {
  for (const width of [320, 390, 768, 1280]) {
    for (const path of PATHS) {
      test(`no horizontal scroll at ${width}px on ${path}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        const overflow = await page.evaluate(() => {
          const el = document.documentElement;
          return { scroll: el.scrollWidth, client: el.clientWidth };
        });
        expect(overflow.scroll, `scrollWidth ${overflow.scroll} > clientWidth ${overflow.client}`).toBeLessThanOrEqual(
          overflow.client,
        );
      });
    }
  }

  test('touch targets in the main navigation are at least 44px tall', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link');
    const count = await links.count();
    for (let i = 0; i < count; i += 1) {
      const box = await links.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(43.5);
    }
  });
});
