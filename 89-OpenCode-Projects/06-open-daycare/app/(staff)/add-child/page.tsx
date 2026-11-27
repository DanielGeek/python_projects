"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const ROOMS = ["Sunshine", "Rainbow", "Stars"];

export default function AddChildPage() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("Sunshine");
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const roomDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
        setIsRoomDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          {/* Date of Birth and Room row */}
          <div className="flex gap-[14px] mb-[18px]">
            {/* Date of Birth */}
            <div className="flex-1">
              <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-2">
                DATE OF BIRTH
              </div>
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full py-[13px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
              />
            </div>

            {/* Room dropdown */}
            <div className="flex-1 relative" ref={roomDropdownRef}>
              <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-2">
                ROOM
              </div>
              <button
                type="button"
                onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                className="w-full flex items-center gap-2 py-[13px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] font-bold text-[#3F362E] focus:outline-none"
              >
                <span>{selectedRoom}</span>
                <span className="flex-1" />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B0A290"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isRoomDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-[1.5px] border-[#EADFD0] rounded-[14px] shadow-[0_10px_20px_-8px_rgba(63,54,46,0.2)] z-10">
                  {ROOMS.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => {
                        setSelectedRoom(room);
                        setIsRoomDropdownOpen(false);
                      }}
                      className="w-full text-left py-3 px-4 text-[15px] text-[#3F362E] hover:bg-[#FBF4EC] first:rounded-t-[14px] last:rounded-b-[14px] focus:outline-none"
                    >
                      {room}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
