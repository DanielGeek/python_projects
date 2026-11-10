import { StatCard } from '@/components/StatCard';
import { episodes } from '@/data/episodes';
import { podcast } from '@/data/podcast';
import { formatDuration, formatDurationLong } from '@/lib/episodes';
import { computeFacts } from '@/lib/facts';
import { pageMetadata } from '@/lib/metadata';
import styles from './facts.module.css';

export const metadata = pageMetadata({
  title: 'Facts',
  description: `${podcast.name} by the numbers: episodes, hours of conversation, guests, favorite topics and a few fun facts.`,
  path: '/facts/',
});

// Hand-written trivia. None of it is derived from the episode data, so it cannot drift from it.
const FUN_FACTS = [
  'Every episode ends with the same question: “What did you almost say?”',
  'The theme music was recorded in a stairwell because it had the best reverb in the building.',
  'Rhea keeps a jar of unused episode titles. “Salt, Smoke, and the Internet” spent two years in it.',
  'Cass has walked every episode’s guest city at night before recording. Mostly in the wrong shoes.',
];

export default function FactsPage() {
  const facts = computeFacts(episodes);

  return (
    <div className="container page">
      <header className={styles.header}>
        <p className="eyebrow">By the numbers</p>
        <h1 className={styles.title}>Facts</h1>
        <p className="lede">
          Everything here is calculated from the episode list, so the numbers always add up.
        </p>
      </header>

      <dl className={styles.grid}>
        <StatCard id="episode-count" label="Episodes" value={String(facts.episodeCount)} />
        <StatCard
          id="total-runtime"
          label="Total listening time"
          value={formatDurationLong(facts.totalRuntimeSeconds)}
          note={`${formatDuration(facts.totalRuntimeSeconds)} of conversation`}
        />
        <StatCard id="guest-count" label="Different guests" value={String(facts.distinctGuestCount)} />
        <StatCard
          id="longest-episode"
          label="Longest episode"
          value={formatDurationLong(facts.longestEpisode.durationSeconds)}
          note={`#${facts.longestEpisode.number} ${facts.longestEpisode.title}`}
        />
        <StatCard
          id="shortest-episode"
          label="Shortest episode"
          value={formatDurationLong(facts.shortestEpisode.durationSeconds)}
          note={`#${facts.shortestEpisode.number} ${facts.shortestEpisode.title}`}
        />
      </dl>

      <section className={styles.section} aria-labelledby="topics-title">
        <h2 id="topics-title">What we talk about most</h2>
        <ol className={styles.topics} data-fact="top-topics">
          {facts.topTopics.map(({ topic, count }) => (
            <li key={topic} className={styles.topic}>
              <span className={styles.topicName} data-topic>
                {topic}
              </span>
              <span className={styles.topicCount}>
                {count} {count === 1 ? 'episode' : 'episodes'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="fun-title">
        <h2 id="fun-title">Fun facts</h2>
        <ul className={styles.fun}>
          {FUN_FACTS.map((fact) => (
            <li key={fact} className={styles.funItem} data-fun-fact>
              {fact}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
