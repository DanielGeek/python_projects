"use client";

import Link from "next/link";
import { useState } from "react";
import { ChildProfile } from "@/lib/mock-children";
import { Avatar } from "@/components/avatar";
import HealthNote from "@/components/health-note";
import InfoCard from "@/components/info-card";
import ParentRow from "@/components/parent-row";
import LinkParentModal from "@/components/link-parent-modal";

type ChildProfileContentProps = {
  profile: ChildProfile;
};

export default function ChildProfileContent({
  profile,
}: ChildProfileContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const infoRows = [
    { label: "Date of birth", value: profile.dob },
    { label: "Room", value: profile.room },
    { label: "Enrolled", value: profile.enrolled },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
        <Link
          href="/children"
          className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Children
        </Link>

        <div className="flex flex-wrap gap-[26px]">
          {/* Left column */}
          <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
            {/* Header */}
            <div className="flex items-center gap-[18px]">
              <Avatar
                size={profile.avatarSize as 84}
                backgroundColor={profile.avatarColor}
                color={profile.textColor}
                initial={profile.initial}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-[28px] font-semibold text-foreground">
                  {profile.name}
                </h1>
                <p className="mt-[3px] text-[15px] text-[#94887B]">
                  {profile.subtitle}
                </p>
              </div>
              <Link
                href="/add-child"
                className="flex-none rounded-xl border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]"
              >
                Edit
              </Link>
            </div>

            {/* Health note */}
            <HealthNote note={profile.healthNote} />

            {/* Info card */}
            <InfoCard rows={infoRows} />
          </div>

          {/* Right column */}
          <div className="flex w-[300px] flex-none flex-col gap-3.5">
            {/* Daily summary button */}
            <Link
              href="/daily-summary"
              className="flex items-center justify-center gap-[9px] rounded-[14px] bg-[#3F362E] py-[13px] font-extrabold text-[15px] text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
              Daily summary
            </Link>

            {/* Linked parents card */}
            <div
              className="rounded-2xl border p-[18px]"
              style={{ background: "#FFFDF9", borderColor: "#ECE0D0" }}
            >
              <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
                LINKED PARENTS
              </div>
              <div className="flex flex-col gap-[14px]">
                {profile.parents.map((parent) => (
                  <ParentRow key={parent.name} parent={parent} />
                ))}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-3 pt-2 bg-transparent border-none cursor-pointer p-0"
                >
                  <span
                    className="flex flex-none items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      border: "1.5px dashed #D8CBBA",
                      color: "#B0A290",
                    }}
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
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-extrabold text-[#C5503A]">
                    Link another parent
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LinkParentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        childName={profile.name}
      />
    </>
  );
}
