/** Public origin of the deployed site; set `NEXT_PUBLIC_SITE_URL` at build time. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/+$/, '');

/** The four content pages, used by the sitemap. */
export const PAGE_PATHS = ['/', '/episodes/', '/about/', '/facts/'] as const;
