import { formatDate, formatDurationLong, toIsoDuration } from '@/lib/episodes';
import type { Episode } from '@/lib/types';
import { CoverArt } from './CoverArt';
import styles from './FeaturedEpisode.module.css';

type Props = {
  episode: Episode;
};

export function FeaturedEpisode({ episode }: Props) {
  return (
    <article className={styles.card} data-testid="featured-episode" aria-labelledby="featured-title">
      <div className={styles.art}>
        <CoverArt episode={episode} />
      </div>
      <div className={styles.body}>
        <p className="eyebrow">Featured episode · #{episode.number}</p>
        <h2 id="featured-title" className={styles.title}>
          {episode.title}
        </h2>
        <p className={styles.description}>{episode.description}</p>
        <p className={styles.meta}>
          <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <time dateTime={toIsoDuration(episode.durationSeconds)}>
            {formatDurationLong(episode.durationSeconds)}
          </time>
        </p>
        {episode.guests.length > 0 && (
          <p className={styles.guests}>With {episode.guests.join(', ')}</p>
        )}
      </div>
    </article>
  );
}
