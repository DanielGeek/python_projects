import type { Metadata } from 'next';
import { podcast } from '@/data/podcast';

type PageMeta = {
  /** Page title; omit for the home page, which uses the default "Name — tagline". */
  title?: string;
  description: string;
  /** Route path with trailing slash, e.g. `/episodes/`. Resolved against `metadataBase`. */
  path: string;
};

/** Unique title/description, canonical URL and Open Graph/Twitter tags for one page. */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const fullTitle = title ? `${title} · ${podcast.name}` : `${podcast.name} — ${podcast.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: podcast.name,
      title: fullTitle,
      description,
      url: path,
    },
    twitter: { card: 'summary', title: fullTitle, description },
  };
}
