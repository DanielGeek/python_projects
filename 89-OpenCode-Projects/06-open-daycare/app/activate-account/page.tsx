"use client";

import { useState } from "react";
import Link from "next/link";

const mockInvitation = {
  childName: "Matthew",
  roomName: "Sunshine Room",
  initial: "M",
  avatarColor: "#A9D9E8",
  textColor: "#1F7A93",
  invitationCode: "7K4P9",
  email: "lucy.fernandez@gmail.com",
};

export default function ActivateAccountPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF4EC] p-5 md:p-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br from-[#F8C3A8] to-[#F2937A] flex items-center justify-center mb-[22px] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-[var(--font-fredoka)] font-semibold text-[32px] leading-[1.15] mb-2 text-[#3F362E]">
          Welcome to OpenDayCare
        </h1>

        {/* Subtitle */}
        <p className="mb-[26px] text-[#94887B] text-[15.5px] leading-[1.55]">
          You've been invited to follow your child's day. Create a password to
          activate the account.
        </p>

        {/* Invitation card */}
        <div className="flex items-center gap-3.5 bg-white border-[1.5px] border-[#EADFD0] rounded-2xl py-3.5 px-4 mb-[22px]">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-[var(--font-fredoka)] font-semibold text-[19px]"
            style={{
              backgroundColor: mockInvitation.avatarColor,
              color: mockInvitation.textColor,
            }}
          >
            {mockInvitation.initial}
          </div>
          <div>
            <div className="text-[13px] text-[#94887B]">
              You've been invited to follow
            </div>
            <div className="font-[var(--font-fredoka)] font-semibold text-[17px] text-[#3F362E]">
              {mockInvitation.childName} · {mockInvitation.roomName}
            </div>
          </div>
        </div>

        {/* Invitation code field */}
        <div className="text-xs font-bold tracking-[0.7px] text-[#94887B] mb-2">
          INVITATION CODE
        </div>
        <input
          type="text"
          value={mockInvitation.invitationCode}
          readOnly
          className="w-full py-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[18px] tracking-[3px] font-bold text-[#3F362E] mb-[18px] font-[var(--font-fredoka)]"
        />

        {/* Email field */}
        <div className="text-xs font-bold tracking-[0.7px] text-[#94887B] mb-2">
          EMAIL
        </div>
        <input
          type="email"
          value={mockInvitation.email}
          readOnly
          className="w-full py-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
        />

        {/* Create password field */}
        <div className="text-xs font-bold tracking-[0.7px] text-[#94887B] mb-2">
          CREATE PASSWORD
        </div>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full py-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
        />

        {/* Authorization checkbox */}
        <label className="flex items-start gap-3 bg-[#FBF1D6] rounded-[14px] py-3.5 px-4 mb-6 cursor-pointer">
          <button
            type="button"
            onClick={() => setIsAuthorized(!isAuthorized)}
            className="flex-none w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-colors"
            style={{
              backgroundColor: isAuthorized ? "#5FB97E" : "transparent",
              border: isAuthorized ? "none" : "1.5px solid #EADFD0",
            }}
            aria-checked={isAuthorized}
            role="checkbox"
          >
            {isAuthorized && (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <span className="text-sm text-[#8A7234] leading-[1.45]">
            I authorize the daycare to take and share photos of my child within
            the app.
          </span>
        </label>

        {/* Activate button */}
        <Link
          href="/login"
          className={`block text-center w-full py-[15px] rounded-[15px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] transition-opacity ${
            !isAuthorized ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
          }`}
          aria-disabled={!isAuthorized}
        >
          Activate my account
        </Link>

        {/* Sign in link */}
        <p className="text-center mt-[22px] mb-0 text-[#94887B] text-[14.5px]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C5503A] font-extrabold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
