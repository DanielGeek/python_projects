"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";
import { mockFeedPosts } from "@/lib/mock-feed";
import CreatePostModal from "@/components/create-post-modal";

export default function StaffHomeContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
        <div className="mb-6">
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
            DAYCARE · SUNSHINE ROOM
          </div>
          <h1 className="font-display text-[30px] font-semibold text-foreground">
            Hey, Carol
          </h1>
          <p className="mt-[5px] text-[14.5px] text-muted-strong">
            12 children · Tuesday, Jun 17
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mb-6 flex w-full cursor-pointer items-center gap-[14px] rounded-[18px] border border-line bg-surface px-[18px] py-[14px] text-left shadow-[0_4px_14px_-10px_rgba(120,90,60,.4)]"
        >
          <Avatar size={40} backgroundColor="#F2937A" color="#FFFFFF" initial="C" />
          <span className="flex-1 text-[15px] text-muted">Share a moment…</span>
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#FBE3D8] text-[#E0654A]">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
        </button>

        <div className="mb-[14px] flex items-center gap-[14px]">
          <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
            POSTED TODAY
          </span>
          <span className="h-px flex-1 bg-[#E7DAC8]" />
        </div>

        <div className="flex flex-col gap-4">
          {mockFeedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
