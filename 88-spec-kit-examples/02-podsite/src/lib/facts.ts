import type { Episode } from './types';

export type TopicCount = {
  topic: string;
  count: number;
};

export type Facts = {
  episodeCount: number;
  totalRuntimeSeconds: number;
  distinctGuestCount: number;
  /** Top 5 topics by frequency; ties broken alphabetically. */
  topTopics: TopicCount[];
  longestEpisode: Episode;
  shortestEpisode: Episode;
};

/** Pure function: every statistic on the Facts page is derived from the episode data. */
export function computeFacts(episodes: readonly Episode[]): Facts {
  if (episodes.length === 0) {
    throw new Error('computeFacts requires at least one episode');
  }

  const guests = new Set<string>();
  const topicCounts = new Map<string, number>();
  let totalRuntimeSeconds = 0;

  for (const episode of episodes) {
    totalRuntimeSeconds += episode.durationSeconds;
    for (const guest of episode.guests) guests.add(guest);
    for (const topic of episode.topics) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }
  }

  const topTopics = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
    .slice(0, 5);

  const byDuration = [...episodes].sort((a, b) => a.durationSeconds - b.durationSeconds);

  return {
    episodeCount: episodes.length,
    totalRuntimeSeconds,
    distinctGuestCount: guests.size,
    topTopics,
    longestEpisode: byDuration[byDuration.length - 1],
    shortestEpisode: byDuration[0],
  };
}
