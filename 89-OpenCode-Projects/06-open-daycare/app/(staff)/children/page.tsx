"use client";

import { useState } from "react";
import Link from "next/link";
import { mockChildren } from "@/lib/mock-children";
import ChildCard from "@/components/child-card";
import SearchBar from "@/components/search-bar";

export default function ChildrenPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChildren = mockChildren.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
      <div className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
            MANAGEMENT
          </div>
          <h1 className="font-display text-[30px] font-semibold text-foreground">
            Children
          </h1>
        </div>
        <Link
          href="/add-child"
          className="flex flex-none items-center gap-2 rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] px-[18px] py-3 font-extrabold text-[14.5px] text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
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
          Add child
        </Link>
      </div>

      <div className="mb-[22px]">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-foreground">
          SUNSHINE ROOM
        </span>
        <span className="text-[13px] text-muted-strong">
          {filteredChildren.length} children
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {filteredChildren.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-[15px] text-muted-strong">
          No children found
        </div>
      )}
    </div>
  );
}
