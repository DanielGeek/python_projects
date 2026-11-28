"use client";

import { mockChildren } from "@/lib/mock-children";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-5 md:p-10 overflow-y-auto">
      <div
        className="relative my-10 w-full max-w-[580px] rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B] transition-colors hover:bg-[#EADFD0]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
        {/* Header */}
        <div className="flex items-center justify-between px-[26px] py-5 border-b border-[#ECE0D0]">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer bg-transparent border-none text-[#94887B] font-bold text-[15px]"
          >
            Cancel
          </button>
          <span className="font-[var(--font-fredoka)] font-semibold text-[18px] text-[#3F362E]">
            New post
          </span>
          <button
            type="button"
            className="cursor-pointer bg-transparent border-none text-[#D9583C] font-extrabold text-[15px]"
          >
            Publish
          </button>
        </div>

        {/* Form content will be added in next steps */}
      </div>
    </div>
  );
}
