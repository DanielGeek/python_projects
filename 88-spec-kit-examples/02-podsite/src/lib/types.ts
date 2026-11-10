export type FollowLink = {
  label: string;
  href: string;
};

export type Podcast = {
  name: string;
  tagline: string;
  description: string;
  premise: string;
  followLinks: FollowLink[];
};

export type Host = {
  id: string;
  name: string;
  bio: string;
  photo?: string;
};

export type Episode = {
  /** Integer 1–20, unique. */
  number: number;
  title: string;
  description: string;
  /** Valid, unique `YYYY-MM-DD` date. */
  publishedAt: string;
  /** Positive integer. */
  durationSeconds: number;
  /** May be empty (solo episodes). */
  guests: string[];
  /** At least one tag. */
  topics: string[];
  /** Exactly one episode in the data set is featured. */
  featured: boolean;
};
