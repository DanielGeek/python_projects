import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDuration,
  getFeatured,
  shortDescription,
  sortNewestFirst,
  toIsoDuration,
} from '@/lib/episodes';
import type { Episode } from '@/lib/types';

function episode(overrides: Partial<Episode>): Episode {
  return {
    number: 1,
    title: 'T',
    description: 'D',
    publishedAt: '2026-01-01',
    durationSeconds: 60,
    guests: [],
    topics: ['x'],
    featured: false,
    ...overrides,
  };
}

describe('sortNewestFirst', () => {
  it('orders by publishedAt descending without mutating the input', () => {
    const input = [
      episode({ number: 1, publishedAt: '2026-01-01' }),
      episode({ number: 3, publishedAt: '2026-03-01' }),
      episode({ number: 2, publishedAt: '2026-02-01' }),
    ];
    const sorted = sortNewestFirst(input);
    expect(sorted.map((e) => e.number)).toEqual([3, 2, 1]);
    expect(input.map((e) => e.number)).toEqual([1, 3, 2]);
  });
});

describe('getFeatured', () => {
  it('returns the single featured episode', () => {
    const featured = episode({ number: 2, featured: true });
    expect(getFeatured([episode({ number: 1 }), featured])).toBe(featured);
  });

  it('throws when none or several are featured', () => {
    expect(() => getFeatured([episode({})])).toThrow();
    expect(() => getFeatured([episode({ featured: true }), episode({ featured: true })])).toThrow();
  });
});

describe('formatDuration', () => {
  it('formats short and long durations', () => {
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(600)).toBe('10:00');
    expect(formatDuration(3725)).toBe('1:02:05');
  });
});

describe('toIsoDuration', () => {
  it('builds ISO 8601 durations', () => {
    expect(toIsoDuration(3725)).toBe('PT1H2M5S');
    expect(toIsoDuration(1980)).toBe('PT33M');
  });
});

describe('formatDate', () => {
  it('formats ISO dates independent of time zone', () => {
    expect(formatDate('2026-05-21')).toBe('May 21, 2026');
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });
});

describe('shortDescription', () => {
  it('returns short text unchanged', () => {
    expect(shortDescription('Hello world', 50)).toBe('Hello world');
  });

  it('truncates at a word boundary with an ellipsis', () => {
    const result = shortDescription('one two three four five', 14);
    expect(result).toBe('one two three…');
    expect(result.length).toBeLessThanOrEqual(15);
  });
});
