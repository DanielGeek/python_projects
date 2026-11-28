"use client";

import { useState } from "react";
import { mockChildren } from "@/lib/mock-children";

const POST_TYPES: { id: PostType; label: string; bg: string; text: string }[] = [
  { id: "meal",         label: "Meal",        bg: "#9A7B1E",  text: "#fff" },
  { id: "nap",          label: "Nap",         bg: "#E7DCF6",  text: "#7B5FC0" },
  { id: "activity",     label: "Activity",    bg: "#2E89A6",  text: "#fff" },
  { id: "milestone",    label: "Milestone",   bg: "#CFEBD8",  text: "#3E9B6C" },
  { id: "mood",         label: "Mood",        bg: "#F9D2DE",  text: "#C56486" },
  { id: "photo",        label: "Photo",       bg: "#FBD8CC",  text: "#D9684A" },
  { id: "announcement", label: "Announcement",bg: "#CCD8F4",  text: "#4E72C8" },
];

type PostType = "meal" | "nap" | "activity" | "milestone" | "mood" | "photo" | "announcement";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isEntireRoom, setIsEntireRoom] = useState(true);
  const [selectedType, setSelectedType] = useState<PostType>("activity");
  const [description, setDescription] = useState("");

  const handleChildClick = (childId: string) => {
    setIsEntireRoom(false);
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleEntireRoomClick = () => {
    setIsEntireRoom(true);
    setSelectedChildren([]);
  };

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

        {/* Form content */}
        <div className="px-[26px] py-[22px]">
          {/* TO selector */}
          <div className="mb-[22px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]">
              TO
            </div>
            <div className="flex flex-wrap gap-[9px]">
              {mockChildren.map((child) => {
                const isSelected = selectedChildren.includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => handleChildClick(child.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-[14px] py-[6px] pl-[6px] font-bold text-[14px] transition-colors ${
                      isSelected
                        ? "border-[#3F362E] bg-[#3F362E] text-white"
                        : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    <span
                      className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-[var(--font-fredoka)] text-[13px] font-semibold"
                      style={{
                        backgroundColor: child.avatarColor,
                        color: child.textColor,
                      }}
                    >
                      {child.initial}
                    </span>
                    {child.name.split(" ")[0]}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleEntireRoomClick}
                className={`cursor-pointer rounded-full border-[1.5px] px-4 py-[6px] font-bold text-[14px] transition-colors ${
                  isEntireRoom
                    ? "border-[#3F362E] bg-[#3F362E] text-white"
                    : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                }`}
              >
                Entire room
              </button>
            </div>
          </div>

          {/* TYPE selector */}
          <div className="mb-[22px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]">
              TYPE
            </div>
            <div className="flex flex-wrap gap-[9px]">
              {POST_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className="cursor-pointer rounded-full border-none px-4 py-2 font-extrabold text-[13.5px] transition-opacity"
                    style={{
                      backgroundColor: isSelected ? type.bg : "#FFFDF9",
                      color: isSelected ? type.text : "#6E6359",
                      border: isSelected ? "none" : "1.5px solid #ECE0D0",
                    }}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description field */}
          <div className="mb-[22px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]">
              DESCRIPTION
            </div>
            <textarea
              placeholder="Share how today went…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[120px] resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
            />
          </div>

          {/* Photos section */}
          <div>
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]">
              PHOTOS
            </div>
            <div className="flex gap-3">
              {/* Existing photo placeholder */}
              <div className="flex h-24 w-24 items-center justify-center rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1] text-[#CBB89F]">
                <svg
                  width="26"
                  height="26"
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
              </div>
              {/* Add photo placeholder */}
              <div className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C5503A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-[12px]">Add</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
