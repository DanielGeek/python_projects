import { readFileSync } from 'node:fs';
import AjvModule from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { episodes } from '@/data/episodes';

// ajv ships CommonJS; unwrap the default export under native ESM interop.
type Ctor = new (opts: object) => {
  compile: (schema: object) => ((data: unknown) => boolean) & { errors?: unknown };
};
const Ajv2020 = ((AjvModule as unknown as { default?: Ctor }).default ?? AjvModule) as unknown as Ctor;
const addFormats = ((addFormatsModule as unknown as { default?: (ajv: unknown) => void }).default ??
  addFormatsModule) as unknown as (ajv: unknown) => void;

const schema = JSON.parse(
  readFileSync(
    new URL('../../specs/001-podcast-website/contracts/episode.schema.json', import.meta.url),
    'utf8',
  ),
) as object;

describe('episode data', () => {
  it('conforms to contracts/episode.schema.json', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const ok = validate(episodes);
    expect(validate.errors ?? null, JSON.stringify(validate.errors)).toBeNull();
    expect(ok).toBe(true);
  });

  it('has exactly 20 episodes numbered 1–20 with no duplicates', () => {
    expect(episodes).toHaveLength(20);
    const numbers = episodes.map((e) => e.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('has exactly one featured episode', () => {
    expect(episodes.filter((e) => e.featured)).toHaveLength(1);
  });

  it('has unique, valid publish dates', () => {
    const dates = episodes.map((e) => e.publishedAt);
    expect(new Set(dates).size).toBe(dates.length);
    for (const date of dates) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${date}T00:00:00Z`))).toBe(false);
    }
  });

  it('has positive integer durations and at least one topic each', () => {
    for (const e of episodes) {
      expect(Number.isInteger(e.durationSeconds) && e.durationSeconds > 0).toBe(true);
      expect(e.topics.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('includes edge-case episodes (very long title, solo episodes)', () => {
    expect(Math.max(...episodes.map((e) => e.title.length))).toBeGreaterThan(80);
    expect(episodes.filter((e) => e.guests.length === 0).length).toBeGreaterThanOrEqual(2);
  });
});
