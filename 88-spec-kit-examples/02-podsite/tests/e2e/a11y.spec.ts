import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PATHS = ['/', '/episodes/', '/about/', '/facts/', '/does-not-exist/'];

test.describe('Accessibility (SC-006, FR-011)', () => {
  for (const path of PATHS) {
    test(`no serious or critical axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(
        blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`),
        'blocking axe violations',
      ).toEqual([]);
    });

    test(`every link is reachable by keyboard with a visible focus ring on ${path}`, async ({ page }) => {
      await page.goto(path);
      const hrefs = new Set(await page.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href'))));
      const total = await page.locator('a[href]').count();

      const reached = new Set<string | null>();
      for (let i = 0; i < total; i += 1) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el) return null;
          const style = getComputedStyle(el);
          return {
            href: el.getAttribute('href'),
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth),
          };
        });
        expect(info, `focus after Tab #${i + 1}`).not.toBeNull();
        expect(info!.outlineStyle).not.toBe('none');
        expect(info!.outlineWidth).toBeGreaterThanOrEqual(2);
        reached.add(info!.href);
      }
      expect([...hrefs].filter((h) => !reached.has(h))).toEqual([]);
    });
  }

  test('the skip link is the first focusable element and jumps to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('every page has exactly one h1 and a lang attribute', async ({ page }) => {
    for (const path of PATHS) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    }
  });
});
