"use client";

import { useState, useEffect, useRef } from "react";

const INVITATION_CODE = "7K4P9";
const RELATIONSHIPS = ["Mom", "Dad", "Guardian"] as const;
type Relationship = (typeof RELATIONSHIPS)[number];

// Validates email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

type LinkParentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
};

export default function LinkParentModal({
  isOpen,
  onClose,
  childName,
}: LinkParentModalProps) {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("Mom");
  const [emailError, setEmailError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isSendEnabled =
    parentName.trim().length > 0 &&
    email.trim().length > 0 &&
    isValidEmail(email);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim().length > 0 && !isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSend = () => {
    if (!isSendEnabled) return;
    setParentName("");
    setEmail("");
    setRelationship("Mom");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-5 md:p-10 overflow-y-auto">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Link parent"
        className="relative my-10 w-full max-w-[480px] rounded-3xl border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
      >
        {/* Header with close button */}
        <div className="flex items-start justify-between px-[26px] pt-5 pb-4 border-b border-[#ECE0D0]">
          <div>
            <div className="font-[var(--font-fredoka)] font-semibold text-[18px] text-[#3F362E]">
              Link parent
            </div>
            <div className="text-[13px] text-[#A89A8B]">to {childName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B] transition-colors hover:bg-[#EADFD0]"
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
        </div>

        {/* Form content */}
        <div className="px-[26px] py-[22px]">
          {/* Info banner */}
          <div className="flex gap-[11px] rounded-[14px] bg-[#E3ECFB] py-[13px] px-4 mb-5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-none mt-px"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              We&apos;ll email them a code to activate their account.
              They&apos;ll only see {childName}&apos;s feed.
            </span>
          </div>

          {/* Parent's Name */}
          <div className="mb-[18px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-2">
              PARENT&apos;S NAME
            </div>
            <input
              type="text"
              placeholder="E.g. Diego Fernandez"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full py-[13px] px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-[18px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-2">
              EMAIL
            </div>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full py-[13px] px-4 rounded-[14px] border-[1.5px] bg-white text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] focus:outline-none ${
                emailError
                  ? "border-[#E74C3C]"
                  : "border-[#EADFD0]"
              }`}
            />
            {emailError && (
              <div className="mt-2 text-[12px] text-[#E74C3C]">
                {emailError}
              </div>
            )}
          </div>

          {/* Relationship */}
          <div className="mb-[20px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#94887B] mb-[10px]">
              RELATIONSHIP
            </div>
            <div className="flex gap-[9px]">
              {RELATIONSHIPS.map((rel) => {
                const isActive = relationship === rel;
                return (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationship(rel)}
                    className={`flex-1 cursor-pointer py-[11px] rounded-full border-[1.5px] font-extrabold text-[14px] transition-colors ${
                      isActive
                        ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                        : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                    }`}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Invitation code */}
          <div className="rounded-2xl border border-dashed border-[#E6D08A] bg-[#FBF1D6] py-[18px] px-4 text-center mb-[20px]">
            <div className="text-xs font-extrabold tracking-[0.7px] text-[#A88526] mb-2">
              INVITATION CODE
            </div>
            <div className="font-[var(--font-fredoka)] font-semibold text-[34px] tracking-[7px] text-[#8A7234]">
              {INVITATION_CODE}
            </div>
            <div className="text-[13px] text-[#A88526] mt-[6px]">
              Expires in 7 days
            </div>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!isSendEnabled}
            className={`flex items-center justify-center gap-[9px] w-full cursor-pointer py-[14px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-[15.5px] shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] transition-opacity ${
              !isSendEnabled
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
          >
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
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Send invitation
          </button>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}
