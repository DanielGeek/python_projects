export type PostType = "milestone" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  type: PostType;
  authorName: string;
  avatarInitial: string | null;
  postedAt: string;
  postedBy: string;
  audience: string;
  body: string;
  photoLabel?: string;
  reactions: number;
  comments: number;
};

export const mockFeedPosts: FeedPost[] = [
  {
    id: "matthew-potty-milestone",
    type: "milestone",
    authorName: "Matthew",
    avatarInitial: "M",
    postedAt: "14:20",
    postedBy: "posted by you",
    audience: "To: Matthew's family",
    body: "He used the potty on his own for the first time! He was so excited to tell everyone. A big step.",
    reactions: 3,
    comments: 1,
  },
  {
    id: "matthew-tempera-painting",
    type: "activity",
    authorName: "Matthew",
    avatarInitial: "M",
    postedAt: "09:40",
    postedBy: "posted by you",
    audience: "To: Matthew's family",
    body: "We painted with tempera paints this morning. Matthew picked blue for everything and got really focused mixing colors.",
    photoLabel: "Photo · painting with tempera",
    reactions: 5,
    comments: 2,
  },
  {
    id: "friday-park-announcement",
    type: "announcement",
    authorName: "General announcement",
    avatarInitial: null,
    postedAt: "07:50",
    postedBy: "posted by you",
    audience: "To: entire room",
    body: "On Friday we're going to the park in the morning. Please remember to send a hat and a water bottle.",
    reactions: 8,
    comments: 0,
  },
];
