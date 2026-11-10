import { expect, test } from '@playwright/test';
import { episodes } from '../../src/data/episodes';

// Expected values are computed independently of src/lib/facts.ts (SC-008).
const totalSeconds = episodes.reduce((sum, e) => sum + e.durationSeconds, 0);
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.round((totalSeconds % 3600) / 60);
const guests = new Set(episodes.flatMap((e) => e.guests));
const topicCounts = new Map<string, number>();
for (const e of episodes) for (const t of e.topics) topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
const expectedTopics = [...topicCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 5)
  .map(([topic]) => topic);

test.describe('Facts (US4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/facts/');
  });

  test('shows statistics that match the episode data', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Facts');
    await expect(page.locator('[data-fact="episode-count"] dd').first()).toHaveText(String(episodes.length));
    await expect(page.locator('[data-fact="total-runtime"] dd').first()).toHaveText(`${hours} hr ${minutes} min`);
    await expect(page.locator('[data-fact="guest-count"] dd').first()).toHaveText(String(guests.size));
  });

  test('lists the top topics in frequency order', async ({ page }) => {
    const topics = await page.locator('[data-fact="top-topics"] li [data-topic]').allTextContents();
    expect(topics).toEqual(expectedTopics);
  });

  test('shows at least three fun facts', async ({ page }) => {
    await expect(page.locator('[data-fun-fact]')).not.toHaveCount(0);
    expect(await page.locator('[data-fun-fact]').count()).toBeGreaterThanOrEqual(3);
  });

  test('marks Facts as the current page', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main' }).locator('[aria-current="page"]'),
    ).toHaveText('Facts');
  });
});
