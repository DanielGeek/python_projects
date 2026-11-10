import { expect, test } from '@playwright/test';
import { podcast } from '../../src/data/podcast';
import { episodes } from '../../src/data/episodes';

const featured = episodes.find((e) => e.featured)!;

test.describe('Home (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the podcast name, tagline and exactly one featured episode', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(podcast.name);
    await expect(page.getByText(podcast.tagline).first()).toBeVisible();

    const card = page.getByTestId('featured-episode');
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('heading', { level: 2 })).toHaveText(featured.title);
    await expect(card).toContainText(featured.description);
    await expect(card).toContainText(`#${featured.number}`);
    await expect(card.locator('time[datetime="' + featured.publishedAt + '"]')).toBeVisible();
    await expect(card.locator('time[datetime^="PT"]')).toBeVisible();
    await expect(card.getByRole('img', { name: new RegExp(`episode ${featured.number}`, 'i') })).toBeVisible();
  });

  test('the call to action leads to the episodes page', async ({ page }) => {
    const cta = page.getByRole('link', { name: /all 20 episodes/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/episodes/');
  });

  test('main navigation lists the four pages and marks Home as current', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const [label, href] of [
      ['Home', '/'],
      ['Episodes', '/episodes/'],
      ['About', '/about/'],
      ['Facts', '/facts/'],
    ]) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
    }
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Home');
  });

  test('publishes PodcastSeries structured data', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    expect(data['@type']).toBe('PodcastSeries');
    expect(data.name).toBe(podcast.name);
  });

  for (const viewport of [
    { name: 'phone', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 720 },
  ]) {
    test(`name and featured episode are visible without scrolling on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
      await expect(page.getByTestId('featured-episode').getByRole('heading', { level: 2 })).toBeInViewport();
    });
  }
});
