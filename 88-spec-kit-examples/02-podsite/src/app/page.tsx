import Link from 'next/link';
import { FeaturedEpisode } from '@/components/FeaturedEpisode';
import { JsonLd } from '@/components/JsonLd';
import { episodes } from '@/data/episodes';
import { hosts } from '@/data/hosts';
import { podcast } from '@/data/podcast';
import { getFeatured } from '@/lib/episodes';
import { pageMetadata } from '@/lib/metadata';
import { siteUrl } from '@/lib/site';
import styles from './page.module.css';

export const metadata = pageMetadata({
  description: podcast.description,
  path: '/',
});

const BARS = Array.from({ length: 32 }, (_, i) => i);

export default function HomePage() {
  const featured = getFeatured(episodes);

  return (
    <div className="container page">
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className="eyebrow">A weekly podcast</p>
        <h1 id="hero-title" className={styles.title}>
          {podcast.name}
        </h1>
        <p className="lede">{podcast.tagline}</p>
        <div className={styles.actions}>
          <Link href="/episodes/" className="btn">
            Browse all {episodes.length} episodes
          </Link>
          <Link href="/about/" className={styles.secondary}>
            About the show
          </Link>
        </div>
      </section>

      <div className={styles.bars} aria-hidden="true">
        {BARS.map((i) => (
          <span
            key={i}
            style={{ ['--i' as string]: i, ['--h' as string]: `${18 + ((i * 37) % 82)}%` }}
          />
        ))}
      </div>

      <FeaturedEpisode episode={featured} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'PodcastSeries',
          name: podcast.name,
          description: podcast.description,
          url: siteUrl,
          inLanguage: 'en',
          author: hosts.map((host) => ({ '@type': 'Person', name: host.name })),
        }}
      />
    </div>
  );
}
