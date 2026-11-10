import { describe, expect, it } from 'vitest';
import { episodes } from '@/data/episodes';
import { computeFacts } from '@/lib/facts';
import type { Episode } from '@/lib/types';

function episode(overrides: Partial<Episode>): Episode {
  return {
    number: 1,
    title: 'T',
    description: 'D',
    publishedAt: '2026-01-01',
    durationSeconds: 100,
    guests: [],
    topics: ['a'],
    featured: false,
    ...overrides,
  };
}

describe('computeFacts (mock data)', () => {
  const facts = computeFacts(episodes);

  it('counts episodes', () => {
    expect(facts.episodeCount).toBe(20);
  });

  it('sums the runtime of all episodes', () => {
    const expected = episodes.reduce((sum, e) => sum + e.durationSeconds, 0);
    expect(facts.totalRuntimeSeconds).toBe(expected);
  });

  it('counts distinct guests across all episodes', () => {
    const all = episodes.flatMap((e) => e.guests);
    expect(facts.distinctGuestCount).toBe(new Set(all).size);
    expect(facts.distinctGuestCount).toBeLessThan(all.length); // some guests return
  });

  it('ranks the top 5 topics by frequency, ties by name', () => {
    expect(facts.topTopics).toHaveLength(5);
    for (let i = 1; i < facts.topTopics.length; i += 1) {
      const prev = facts.topTopics[i - 1];
      const cur = facts.topTopics[i];
      expect(prev.count > cur.count || (prev.count === cur.count && prev.topic < cur.topic)).toBe(true);
    }
  });

  it('finds the longest and shortest episodes', () => {
    const durations = episodes.map((e) => e.durationSeconds);
    expect(facts.longestEpisode.durationSeconds).toBe(Math.max(...durations));
    expect(facts.shortestEpisode.durationSeconds).toBe(Math.min(...durations));
  });
});

describe('computeFacts (small inputs)', () => {
  it('handles ties and repeated guests deterministically', () => {
    const facts = computeFacts([
      episode({ number: 1, guests: ['Ann'], topics: ['b', 'a'], durationSeconds: 60 }),
      episode({ number: 2, guests: ['Ann', 'Bo'], topics: ['b', 'c'], durationSeconds: 120 }),
    ]);
    expect(facts.distinctGuestCount).toBe(2);
    expect(facts.topTopics).toEqual([
      { topic: 'b', count: 2 },
      { topic: 'a', count: 1 },
      { topic: 'c', count: 1 },
    ]);
    expect(facts.totalRuntimeSeconds).toBe(180);
    expect(facts.longestEpisode.number).toBe(2);
    expect(facts.shortestEpisode.number).toBe(1);
  });

  it('throws for an empty list', () => {
    expect(() => computeFacts([])).toThrow();
  });
});
