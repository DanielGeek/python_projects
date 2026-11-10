import { expect, test } from '@playwright/test';
import { episodes } from '../../src/data/episodes';

test.describe('Episodes (US2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/episodes/');
  });

  test('lists exactly 20 episodes, newest first', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Episodes');

    const cards = page.getByTestId('episode-card');
    await expect(cards).toHaveCount(20);

    const dates = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.querySelector('time[datetime^="20"]')?.getAttribute('datetime') ?? ''),
    );
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(dates).size).toBe(20);
  });

  test('every entry shows number, title, description, date, duration and cover art', async ({ page }) => {
    const cards = page.getByTestId('episode-card');
    for (const episode of episodes) {
      const card = cards.filter({
        has: page.getByRole('heading', { level: 2, name: episode.title, exact: true }),
      });
      await expect(card, `episode ${episode.number}`).toHaveCount(1);
      await expect(card).toContainText(`#${episode.number}`);
      await expect(card.locator('p').nth(1)).not.toBeEmpty();
      await expect(card.locator(`time[datetime="${episode.publishedAt}"]`)).toBeVisible();
      await expect(card.locator('time[datetime^="PT"]')).toBeVisible();
      await expect(card.getByRole('img', { name: new RegExp(`episode ${episode.number}:`, 'i') })).toBeVisible();
    }
  });

  test('a very long title does not overflow its card', async ({ page }) => {
    const longest = [...episodes].sort((a, b) => b.title.length - a.title.length)[0];
    const card = page.getByTestId('episode-card').filter({ hasText: longest.title });
    const box = await card.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    const overflow = await card.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('publishes PodcastEpisode structured data for all episodes', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    const items = data['@graph'] as Array<{ '@type': string; episodeNumber: number }>;
    expect(items).toHaveLength(20);
    expect(items.every((item) => item['@type'] === 'PodcastEpisode')).toBe(true);
  });

  test('marks Episodes as the current page', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main' }).locator('[aria-current="page"]'),
    ).toHaveText('Episodes');
  });

  test('the home call to action reaches this page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /all 20 episodes/i }).click();
    await expect(page).toHaveURL(/\/episodes\/$/);
  });
});
