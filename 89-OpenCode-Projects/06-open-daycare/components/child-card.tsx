import Link from "next/link";
import type { Child } from "@/lib/mock-children";
import { Avatar } from "./avatar";
import ChildTag from "./child-tag";

type ChildCardProps = {
  child: Child;
};

export default function ChildCard({ child }: ChildCardProps) {
  const hasTags = child.tags.length > 0;

  return (
    <Link
      href={`/children/${child.id}`}
      className="child-card group flex items-center gap-3.5 min-w-0 rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      <Avatar
        size={child.avatarSize as 48}
        backgroundColor={child.avatarColor}
        color={child.textColor}
        initial={child.initial}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[16px] font-semibold text-[#3F362E]">
          {child.name}
        </div>
        <div className="truncate text-[13px] text-[#A89A8B]">
          {child.subtitle}
        </div>
      </div>
      {hasTags ? (
        child.tags.map((tag) => <ChildTag key={tag.label} tag={tag} />)
      ) : (
        <svg
          className="flex-none"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CBB89F"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Link>
  );
}
