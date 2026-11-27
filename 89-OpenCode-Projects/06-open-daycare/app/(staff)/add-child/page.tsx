"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddChildPage() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("Sunshine");

  return (
    <div className="min-h-screen flex items-start justify-center p-10 md:p-10">
      <div className="w-full max-w-[520px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-3xl shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-[26px] py-5 border-b border-[#ECE0D0]">
          <Link href="/children" className="text-[#94887B] font-bold text-[15px]">
            Cancel
          </Link>
          <span className="font-[var(--font-fredoka)] font-semibold text-lg text-[#3F362E]">
            Add child
          </span>
          <Link href="/children" className="text-[#D9583C] font-extrabold text-[15px]">
            Save
          </Link>
        </div>

        {/* Form fields */}
        <div className="p-6 md:p-[24px_26px]">
          {/* Full Name field */}
          <div className="mb-[18px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-2">
              FULL NAME
            </div>
            <input
              type="text"
              placeholder="E.g. Martina Lopez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full py-[13px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
