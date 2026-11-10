import type { Episode } from '@/lib/types';

/**
 * Mocked episode catalog (no real feed).
 * Invariants (enforced by tests/unit/episodes.data.test.ts):
 * - exactly 20 episodes, numbers 1–20 unique
 * - exactly one featured episode (the most recent, #20)
 * - publishedAt valid and unique, durationSeconds a positive integer
 * - at least one topic per episode; guests may be empty (solo episodes)
 */
export const episodes: Episode[] = [
  {
    number: 1,
    title: 'The Last Payphone in Lisbon',
    description:
      'Inês Carvalho has spent six years recording the city one street corner at a time. We follow her to the final working payphone in Alfama and ask who still picks it up.',
    publishedAt: '2026-01-08',
    durationSeconds: 2412,
    guests: ['Inês Carvalho'],
    topics: ['cities', 'sound'],
    featured: false,
  },
  {
    number: 2,
    title: 'Why Every Elevator Sounds the Same',
    description:
      'Sound designer Mara Oyelaran explains the quiet engineering behind the chime, the hum and the soft whoosh of doors, and why silence is the one thing nobody can ship.',
    publishedAt: '2026-01-15',
    durationSeconds: 1980,
    guests: ['Mara Oyelaran'],
    topics: ['sound', 'design'],
    featured: false,
  },
  {
    number: 3,
    title: 'Bread Is a Clock',
    description:
      'Baker Tomás Reyes keeps time with a sourdough starter older than his marriage. A slow talk about patience, temperature and learning to read dough instead of recipes.',
    publishedAt: '2026-01-22',
    durationSeconds: 2655,
    guests: ['Tomás Reyes'],
    topics: ['food', 'craft'],
    featured: false,
  },
  {
    number: 4,
    title: 'Mapping the Quiet',
    description:
      'Jun Watanabe and Priya Nair measured decibels in forty cities to build a map of where silence still lives. Spoiler: it is rarely where you would expect.',
    publishedAt: '2026-01-29',
    durationSeconds: 3120,
    guests: ['Jun Watanabe', 'Priya Nair'],
    topics: ['cities', 'sound'],
    featured: false,
  },
  {
    number: 5,
    title: 'A Brief History of the Spreadsheet Cell',
    description:
      'Delia Brandt traces how a humble grid of boxes quietly ran the world economy, and why every accountant secretly dreams in formulas.',
    publishedAt: '2026-02-05',
    durationSeconds: 2290,
    guests: ['Delia Brandt'],
    topics: ['code', 'memory'],
    featured: false,
  },
  {
    number: 6,
    title: 'Night Trains and Other Slow Futures',
    description:
      'Rail historian Anselm Voss argues the future of travel is slower, darker and far more comfortable. We book a berth and talk about arriving rested.',
    publishedAt: '2026-02-12',
    durationSeconds: 2740,
    guests: ['Anselm Voss'],
    topics: ['cities', 'craft'],
    featured: false,
  },
  {
    number: 7,
    title: 'Solo: Notes on Boredom',
    description:
      'Rhea and Cass go without a guest and talk about the lost art of being bored, and what happened to their best ideas when their phones started filling every gap.',
    publishedAt: '2026-02-19',
    durationSeconds: 1385,
    guests: [],
    topics: ['memory'],
    featured: false,
  },
  {
    number: 8,
    title: 'The Color Nobody Can Name',
    description:
      'Paint chemist Hana Okafor spent a decade chasing a shade that every person sees differently. We argue about teal, memory and what a color really is.',
    publishedAt: '2026-02-26',
    durationSeconds: 2105,
    guests: ['Hana Okafor'],
    topics: ['design', 'craft'],
    featured: false,
  },
  {
    number: 9,
    title: 'Tide Tables for Beginners',
    description:
      'Captain R. Lindqvist teaches us to read the sea before it reads us: tides, currents and the surprisingly poetic language of the shipping forecast.',
    publishedAt: '2026-03-05',
    durationSeconds: 2830,
    guests: ['Captain R. Lindqvist'],
    topics: ['ocean', 'craft'],
    featured: false,
  },
  {
    number: 10,
    title: 'Teaching a Synth to Forget',
    description:
      'Musician and programmer Noor Haddad builds instruments that lose a little of every note they play. Imperfect memory, it turns out, sounds beautiful.',
    publishedAt: '2026-03-12',
    durationSeconds: 3340,
    guests: ['Noor Haddad'],
    topics: ['music', 'code'],
    featured: false,
  },
  {
    number: 11,
    title:
      'How a Tiny Library in a Dying Mill Town Accidentally Rebuilt Its Entire Economy One Overdue Book at a Time',
    description:
      'When the last factory closed, librarian Wren Castellanos stopped fining people for late books and started trading them for favors instead. Within three years the library was the town’s bank, hiring hall, repair shop, seed exchange, concert venue and unofficial town square, and nobody had planned any of it. We talk about trust as infrastructure, why small rules produce big communities, what happens when a good idea outgrows the person who started it, and the one overdue copy of a cookbook that still has not come back.',
    publishedAt: '2026-03-19',
    durationSeconds: 4015,
    guests: ['Wren Castellanos'],
    topics: ['cities', 'memory'],
    featured: false,
  },
  {
    number: 12,
    title: 'Salt, Smoke, and the Internet',
    description:
      'Tomás Reyes returns to explain why food blogs, forum arguments and a viral brisket recipe have more in common with medieval preservation than you think.',
    publishedAt: '2026-03-26',
    durationSeconds: 2460,
    guests: ['Tomás Reyes'],
    topics: ['food', 'code'],
    featured: false,
  },
  {
    number: 13,
    title: 'Solo: Ten Rules for Saying Nothing',
    description:
      'No guest this week, just Rhea and Cass making a list of everything they have learned about silence, white space and leaving the best sentence unsaid.',
    publishedAt: '2026-04-02',
    durationSeconds: 1620,
    guests: [],
    topics: ['design', 'memory'],
    featured: false,
  },
  {
    number: 14,
    title: 'Anatomy of a Perfect Pause',
    description:
      'Mara Oyelaran is back to dissect the half-second before the chorus, the breath before the punchline and why a well-placed gap is the loudest sound in music.',
    publishedAt: '2026-04-09',
    durationSeconds: 2575,
    guests: ['Mara Oyelaran'],
    topics: ['sound', 'music'],
    featured: false,
  },
  {
    number: 15,
    title: 'Satellites for the Rest of Us',
    description:
      'Dr. Imani Brooks builds shoebox-sized satellites with high-school students. We talk launch windows, tiny budgets and the joy of watching your code orbit.',
    publishedAt: '2026-04-16',
    durationSeconds: 3190,
    guests: ['Dr. Imani Brooks'],
    topics: ['space', 'code'],
    featured: false,
  },
  {
    number: 16,
    title: 'The Cartographer Who Hated Borders',
    description:
      'Jun Watanabe explains why he redraws maps without any national lines, and what shows up on the page once the arguments are taken away.',
    publishedAt: '2026-04-23',
    durationSeconds: 2360,
    guests: ['Jun Watanabe'],
    topics: ['cities', 'design'],
    featured: false,
  },
  {
    number: 17,
    title: 'Every Instrument Is a Compromise',
    description:
      'Noor Haddad and luthier Felix Aaltonen compare notes on wood, wire and the small betrayals every instrument asks of its player. Bring headphones.',
    publishedAt: '2026-04-30',
    durationSeconds: 3665,
    guests: ['Noor Haddad', 'Felix Aaltonen'],
    topics: ['music', 'craft'],
    featured: false,
  },
  {
    number: 18,
    title: 'What the Ocean Remembers',
    description:
      'Captain Lindqvist returns with a shoebox of logbooks, some of them two centuries old, and we read what sailors chose to write down and what they left out.',
    publishedAt: '2026-05-07',
    durationSeconds: 2925,
    guests: ['Captain R. Lindqvist'],
    topics: ['ocean', 'memory'],
    featured: false,
  },
  {
    number: 19,
    title: 'Small Fires',
    description:
      'Hana Okafor on the tiny acts of making that keep people going: a mended cup, a hand-lettered sign, a color mixed just right. Craft as a quiet form of hope.',
    publishedAt: '2026-05-14',
    durationSeconds: 2210,
    guests: ['Hana Okafor'],
    topics: ['craft', 'design'],
    featured: false,
  },
  {
    number: 20,
    title: 'Afterglow: The One Where We Stay Late',
    description:
      'For the season finale, Inês, Wren and Delia join Rhea and Cass after hours. The recorder stays on, the coffee goes cold, and the best stories of the year finally come out.',
    publishedAt: '2026-05-21',
    durationSeconds: 4380,
    guests: ['Inês Carvalho', 'Wren Castellanos', 'Delia Brandt'],
    topics: ['memory', 'sound', 'cities'],
    featured: true,
  },
];
