import { expect, test } from '@playwright/test';
import { hosts } from '../../src/data/hosts';
import { podcast } from '../../src/data/podcast';

test.describe('About (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about/');
  });

  test('shows the premise', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
    await expect(page.getByRole('main').getByText(podcast.premise)).toBeVisible();
  });

  test('introduces each host with a name and a bio', async ({ page }) => {
    const main = page.getByRole('main');
    expect(hosts.length).toBeGreaterThanOrEqual(1);
    for (const host of hosts) {
      await expect(main.getByRole('heading', { level: 3, name: host.name })).toBeVisible();
      await expect(main.getByText(host.bio)).toBeVisible();
    }
  });

  test('offers at least one way to follow the show', async ({ page }) => {
    const links = page.getByRole('main').getByRole('list', { name: 'Follow the show' }).getByRole('link');
    expect(await links.count()).toBeGreaterThanOrEqual(1);
    for (const link of podcast.followLinks) {
      await expect(links.filter({ hasText: link.label })).toHaveAttribute('href', link.href);
    }
  });

  test('marks About as the current page', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main' }).locator('[aria-current="page"]'),
    ).toHaveText('About');
  });
});
