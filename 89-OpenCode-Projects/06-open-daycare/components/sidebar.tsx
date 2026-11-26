import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Nav } from "@/components/nav";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className = "flex" }: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 h-screen w-[248px] flex-none flex-col border-r border-line bg-surface px-4 py-6 ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-[11px] px-2 pb-[22px] pt-1"
      >
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>
        <div>
          <div className="font-display text-[17px] font-semibold leading-none text-foreground">
            OpenDayCare
          </div>
          <div className="mt-[2px] text-[11.5px] text-muted">
            Sunshine Room
          </div>
        </div>
      </Link>

      <Link
        href="/create-post"
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,.75)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        New post
      </Link>

      <Nav />

      <div className="mt-[10px] border-t border-line pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-[6px]">
          <Avatar size={38} backgroundColor="#F2937A" color="#FFFFFF" initial="C" />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-foreground">
              Carol Gimenez
            </div>
            <div className="text-[12px] text-muted">Teacher · Sunshine</div>
          </div>
          <Link
            href="/login"
            title="Sign out"
            aria-label="Sign out"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-background text-muted-strong"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
