import { formatDate, formatDurationLong, shortDescription, toIsoDuration } from '@/lib/episodes';
import type { Episode } from '@/lib/types';
import { CoverArt } from './CoverArt';
import styles from './EpisodeCard.module.css';

type Props = {
  episode: Episode;
};

export function EpisodeCard({ episode }: Props) {
  return (
    <article className={styles.card} data-testid="episode-card">
      <div className={styles.art}>
        <CoverArt episode={episode} />
      </div>
      <div className={styles.body}>
        <p className={styles.number}>#{episode.number}</p>
        <h2 className={styles.title}>{episode.title}</h2>
        <p className={styles.description}>{shortDescription(episode.description, 190)}</p>
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
