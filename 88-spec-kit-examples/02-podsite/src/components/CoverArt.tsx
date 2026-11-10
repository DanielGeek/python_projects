import type { Episode } from '@/lib/types';
import styles from './CoverArt.module.css';

type Palette = readonly [string, string, string];

// One palette per topic; the first topic of an episode picks the colors.
const PALETTES: Record<string, Palette> = {
  cities: ['#3b2cff', '#ff5c8a', '#ffb02e'],
  sound: ['#00b89c', '#3b2cff', '#f5f2ea'],
  design: ['#ff5c8a', '#ffb02e', '#2a1f4d'],
  code: ['#5be37d', '#00a3a3', '#0a0910'],
  food: ['#ff8a3d', '#ffd166', '#7a1f3d'],
  space: ['#6c4bff', '#14121d', '#9fe8ff'],
  music: ['#ff3d7f', '#7a1fff', '#ffd166'],
  craft: ['#ffb02e', '#c2410c', '#2a1f4d'],
  ocean: ['#0ea5e9', '#1e3a8a', '#a5f3fc'],
  memory: ['#c084fc', '#f472b6', '#fde68a'],
};
const FALLBACK: Palette = ['#6c4bff', '#ff5c8a', '#ffb02e'];

/** Small deterministic PRNG so every episode always renders the same art. */
function seeded(seed: number) {
  let state = (seed * 9301 + 49297) % 233280;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

type Props = {
  episode: Pick<Episode, 'number' | 'title' | 'topics'>;
};

/** Generated cover art: unique per episode, no image files, always available. */
export function CoverArt({ episode }: Props) {
  const { number, title, topics } = episode;
  const [c1, c2, c3] = PALETTES[topics[0]] ?? FALLBACK;
  const rand = seeded(number);

  const glowX = (30 + rand() * 140).toFixed(1);
  const glowY = (30 + rand() * 140).toFixed(1);
  const glowR = (70 + rand() * 50).toFixed(1);
  const ringX = (40 + rand() * 120).toFixed(1);
  const ringY = (40 + rand() * 120).toFixed(1);
  const rings = [26, 46, 66].map((r, i) => (r + rand() * 8 + i * 2).toFixed(1));
  const wave = [rand(), rand(), rand(), rand()].map((v) => (70 + v * 90).toFixed(1));
  const angle = Math.floor(rand() * 360);

  const gradientId = `cover-g-${number}`;
  const glowId = `cover-r-${number}`;

  return (
    <svg
      className={styles.art}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Cover art for episode ${number}: ${title}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} gradientTransform={`rotate(${angle} .5 .5)`}>
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor={c3} stopOpacity="0.95" />
          <stop offset="1" stopColor={c3} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <circle cx={glowX} cy={glowY} r={glowR} fill={`url(#${glowId})`} />
      {rings.map((r) => (
        <circle
          key={r}
          cx={ringX}
          cy={ringY}
          r={r}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
      ))}
      <path
        d={`M0 ${wave[0]} Q 50 ${wave[1]} 100 ${wave[2]} T 200 ${wave[3]}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="14" y="186" className={styles.number} aria-hidden="true">
        {String(number).padStart(2, '0')}
      </text>
    </svg>
  );
}
