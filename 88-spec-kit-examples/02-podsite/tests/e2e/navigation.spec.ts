import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/episodes/', label: 'Episodes' },
  { path: '/about/', label: 'About' },
  { path: '/facts/', label: 'Facts' },
];

test.describe('Navigation (SC-001, FR-002)', () => {
  for (const from of PAGES) {
    for (const to of PAGES) {
      test(`${from.label} -> ${to.label} in one click`, async ({ page }) => {
        await page.goto(from.path);
        const nav = page.getByRole('navigation', { name: 'Main' });
        await expect(nav.locator('[aria-current="page"]')).toHaveText(from.label);

        await nav.getByRole('link', { name: to.label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${to.path === '/' ? '/$' : to.path + '$'}`));
        await expect(nav.locator('[aria-current="page"]')).toHaveText(to.label);
      });
    }
  }

  test('every page has a footer with follow links', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.getByRole('contentinfo').getByRole('list', { name: 'Follow the show' })).toBeVisible();
    }
  });

  test('an unknown path serves a friendly 404 with a way back home (FR-014)', async ({ page }) => {
    const response = await page.goto('/does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await page.getByRole('link', { name: /back to the home page/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('featured-episode')).toBeVisible();
  });
});
