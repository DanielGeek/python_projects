import Link from "next/link";
import { Avatar } from "@/components/avatar";
import type { FeedPost, PostType } from "@/lib/mock-feed";

type PostTypeStyle = {
  badgeLabel: string;
  badgeBackground: string;
  badgeColor: string;
  avatarBackground: string;
  avatarColor: string;
};

const POST_TYPE_STYLES: Record<PostType, PostTypeStyle> = {
  milestone: {
    badgeLabel: "MILESTONE",
    badgeBackground: "#CFEBD8",
    badgeColor: "#3E9B6C",
    avatarBackground: "#A9D9E8",
    avatarColor: "#1F7A93",
  },
  activity: {
    badgeLabel: "ACTIVITY",
    badgeBackground: "#C7E7F1",
    badgeColor: "#2E89A6",
    avatarBackground: "#A9D9E8",
    avatarColor: "#1F7A93",
  },
  announcement: {
    badgeLabel: "ANNOUNCEMENT",
    badgeBackground: "#CCD8F4",
    badgeColor: "#4E72C8",
    avatarBackground: "#CCD8F4",
    avatarColor: "#4E72C8",
  },
};

const MEGAPHONE_ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const typeStyle = POST_TYPE_STYLES[post.type];

  return (
    <article className="rounded-[20px] border border-line bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,.5)]">
      <header className="mb-[14px] flex items-center gap-3">
        <Avatar
          size={44}
          backgroundColor={typeStyle.avatarBackground}
          color={typeStyle.avatarColor}
          initial={post.avatarInitial ?? undefined}
        >
          {post.avatarInitial ? null : MEGAPHONE_ICON}
        </Avatar>
        <div className="flex-1">
          <div className="font-display text-[16.5px] font-semibold text-foreground">
            {post.authorName}
          </div>
          <div className="text-[12.5px] text-muted">
            {post.postedAt} · {post.postedBy}
          </div>
        </div>
        <div
          className="flex items-center gap-[7px] rounded-full px-3 py-[6px]"
          style={{ backgroundColor: typeStyle.badgeBackground }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: typeStyle.badgeColor }}
          />
          <span
            className="text-[12px] font-extrabold tracking-[0.5px]"
            style={{ color: typeStyle.badgeColor }}
          >
            {typeStyle.badgeLabel}
          </span>
        </div>
      </header>

      <div className="mb-[10px] text-[12.5px] text-muted">{post.audience}</div>
      <p className="m-0 text-[15.5px] leading-[1.55] text-[#4A4038]">
        {post.body}
      </p>

      {post.photoLabel && (
        <Link
          href="/photo"
          className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoLabel}</span>
        </Link>
      )}

      <footer className="mt-4 flex items-center gap-[18px] border-t border-[#F0E6D8] pt-[14px]">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-[#E0654A]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="#E0654A"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {post.reactions}
        </span>
        <Link
          href="/post-detail"
          className="flex items-center gap-[7px] text-[14px] font-bold text-muted-strong"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
          </svg>
          {post.comments}
        </Link>
        <span className="flex-1" />
        <Link
          href="/create-post"
          className="text-[14px] font-extrabold text-[#C5503A]"
        >
          Edit
        </Link>
      </footer>
    </article>
  );
}
