import { expect, test } from '@playwright/test';

const PATHS = ['/', '/episodes/', '/about/', '/facts/'];

test.describe('SEO baseline (FR-012, constitution III)', () => {
  test('every page has a unique title and description plus Open Graph tags and a canonical URL', async ({ page }) => {
    const titles: string[] = [];
    const descriptions: string[] = [];

    for (const path of PATHS) {
      await page.goto(path);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(title.length, `title on ${path}`).toBeGreaterThan(0);
      expect(description?.length ?? 0, `description on ${path}`).toBeGreaterThan(20);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/.+/);
      titles.push(title);
      descriptions.push(description!);
    }

    expect(new Set(titles).size).toBe(PATHS.length);
    expect(new Set(descriptions).size).toBe(PATHS.length);
  });

  test('structured data is valid JSON-LD on Home and Episodes', async ({ page }) => {
    for (const path of ['/', '/episodes/']) {
      await page.goto(path);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(blocks.length, `JSON-LD blocks on ${path}`).toBeGreaterThanOrEqual(1);
      for (const block of blocks) {
        const parsed = JSON.parse(block);
        expect(parsed['@context']).toBe('https://schema.org');
      }
    }
  });

  test('serves sitemap.xml listing the four pages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect((xml.match(/<loc>/g) ?? []).length).toBe(4);
    for (const path of PATHS) {
      expect(xml).toContain(`${path}</loc>`);
    }
  });

  test('serves robots.txt that allows crawling and references the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toMatch(/User-Agent: \*/i);
    expect(text).toMatch(/Allow: \//i);
    expect(text).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/i);
  });
});
