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
        {/* Close button, header, and form content will be added in next steps */}
      </div>
    </div>
  );
}
