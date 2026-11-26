"use client";

import { useEffect, useState, type ReactNode } from "react";

const DRAWER_ID = "mobile-nav-drawer";

type MobileHeaderProps = {
  children: ReactNode;
};

export function MobileHeader({ children }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={DRAWER_ID}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-muted-strong"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display text-[17px] font-semibold text-foreground">
            OpenDayCare
          </span>
        </div>
      </header>

      <div className="fixed inset-0 z-50 lg:hidden" hidden={!isOpen}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-foreground/40"
        />
        <div id={DRAWER_ID}>{children}</div>
      </div>
    </>
  );
}
