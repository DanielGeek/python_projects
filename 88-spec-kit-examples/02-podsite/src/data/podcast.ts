import type { Podcast } from '@/lib/types';

export const podcast: Podcast = {
  name: 'Afterglow',
  tagline: 'Long conversations that start when the meeting ends.',
  description:
    'Afterglow is a weekly podcast of unhurried talks with makers, mappers, musicians and misfits about the strange, small ideas that quietly shape how we live.',
  premise:
    'Every great conversation seems to happen in the five minutes after the official one is over: the recorder is off, the coffee is cold, and somebody finally says the interesting thing. Afterglow lives in those five minutes. Each week Rhea and Cass sit down with one person who builds, studies or obsesses over something unusual, and keep talking until the good stuff surfaces. No scripts, no sponsors reading you a checklist, just curious people and plenty of room to wander.',
  followLinks: [
    { label: 'Apple Podcasts', href: 'https://example.com/follow/apple' },
    { label: 'Spotify', href: 'https://example.com/follow/spotify' },
    { label: 'RSS', href: 'https://example.com/follow/rss' },
  ],
};
