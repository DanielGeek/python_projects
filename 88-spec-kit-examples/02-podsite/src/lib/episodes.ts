import type { Episode } from './types';

/** Returns a copy sorted by publish date, newest first. */
export function sortNewestFirst(episodes: readonly Episode[]): Episode[] {
  return [...episodes].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Returns the single featured episode; throws if the data is inconsistent. */
export function getFeatured(episodes: readonly Episode[]): Episode {
  const featured = episodes.filter((episode) => episode.featured);
  if (featured.length !== 1) {
    throw new Error(`Expected exactly 1 featured episode, found ${featured.length}`);
  }
  return featured[0];
}

/** `H:MM:SS` when one hour or longer, otherwise `M:SS`. */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/** Spoken-style duration for assistive tech and structured data, e.g. "1 hr 2 min". */
export function formatDurationLong(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${minutes} min`;
}

/** ISO 8601 duration for JSON-LD, e.g. `PT1H2M5S`. */
export function toIsoDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds ? `${seconds}S` : ''}`;
}

/** `YYYY-MM-DD` -> "Nov 9, 2026", independent of the build machine's time zone. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Truncates at a word boundary and appends an ellipsis when the text is too long. */
export function shortDescription(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  const base = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, '');
  return `${base}…`;
}
