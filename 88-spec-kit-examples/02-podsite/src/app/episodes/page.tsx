import { EpisodeCard } from '@/components/EpisodeCard';
import { JsonLd } from '@/components/JsonLd';
import { episodes } from '@/data/episodes';
import { podcast } from '@/data/podcast';
import { sortNewestFirst, toIsoDuration } from '@/lib/episodes';
import { pageMetadata } from '@/lib/metadata';
import styles from './episodes.module.css';

export const metadata = pageMetadata({
  title: 'Episodes',
  description: `All ${episodes.length} episodes of ${podcast.name}, newest first: long, unhurried conversations with makers, mappers and musicians.`,
  path: '/episodes/',
});

export default function EpisodesPage() {
  const sorted = sortNewestFirst(episodes);

  return (
    <div className="container page">
      <header className={styles.header}>
        <p className="eyebrow">All episodes</p>
        <h1 className={styles.title}>Episodes</h1>
        <p className="lede">
          {sorted.length} conversations, newest first. Start anywhere: every episode stands on its own.
        </p>
      </header>

      <ol className={styles.list} aria-label="Episodes, newest first">
        {sorted.map((episode) => (
          <li key={episode.number}>
            <EpisodeCard episode={episode} />
          </li>
        ))}
      </ol>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': sorted.map((episode) => ({
            '@type': 'PodcastEpisode',
            name: episode.title,
            description: episode.description,
            episodeNumber: episode.number,
            datePublished: episode.publishedAt,
            duration: toIsoDuration(episode.durationSeconds),
            partOfSeries: { '@type': 'PodcastSeries', name: podcast.name },
          })),
        }}
      />
    </div>
  );
}
