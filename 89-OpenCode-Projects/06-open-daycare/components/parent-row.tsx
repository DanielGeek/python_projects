import type { LinkedParent } from "@/lib/mock-children";
import { Avatar } from "./avatar";

type ParentRowProps = {
  parent: LinkedParent;
};

export default function ParentRow({ parent }: ParentRowProps) {
  const isActive = parent.status === "active";
  const badgeBg = isActive ? "#CFEBD8" : "#F7E7A6";
  const badgeColor = isActive ? "#3E9B6C" : "#9A7B1E";
  const badgeLabel = isActive ? "ACTIVE" : "PENDING";

  return (
    <div className="flex items-center gap-3">
      <Avatar
        size={40}
        backgroundColor={parent.avatarColor}
        color={parent.textColor}
        initial={parent.initial}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-extrabold text-[#3F362E]">
          {parent.name}
        </div>
        <div className="text-[12.5px] text-[#A89A8B]">
          {parent.relation} · {parent.statusText}
        </div>
      </div>
      <span
        className="flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold"
        style={{ background: badgeBg, color: badgeColor }}
      >
        {badgeLabel}
      </span>
    </div>
  );
}
