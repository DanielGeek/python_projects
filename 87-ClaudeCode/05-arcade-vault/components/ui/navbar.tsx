"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/session";
import { Button, ButtonLink, NeonLogo } from "./basics";

const LINKS = [
  { href: "/", label: "Library", match: (p: string) => p === "/" || p.startsWith("/game") },
  { href: "/hall-of-fame", label: "Hall of Fame", match: (p: string) => p.startsWith("/hall-of-fame") },
];

function Credits() {
  return (
    <span className="av-credits">
      <span className="av-coin" aria-hidden />
      CREDITS · 03
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const session = useSession();
  const [open, setOpen] = useState(false);

  // Close the mobile panel whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const links = LINKS.map((l) => (
    <Link key={l.href} href={l.href} className="av-nav-link" aria-current={l.match(pathname) ? "page" : undefined}>
      {l.label}
    </Link>
  ));

  const auth =
    session && !session.guest ? (
      <>
        <span className="av-avatar" aria-hidden>
          {session.name.slice(0, 2)}
        </span>
        <span className="av-avatar-name">{session.name}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign out
        </Button>
      </>
    ) : (
      <ButtonLink href="/login" variant="outline" size="sm">
        Sign In
      </ButtonLink>
    );

  return (
    <div className="av-nav-wrap">
      <nav className="av-nav" aria-label="Main">
        <Link href="/" aria-label="Arcade Vault, go to the library">
          <NeonLogo size="sm" flicker={false} />
        </Link>
        <div className="av-nav-links">{links}</div>
        <div className="av-nav-right">
          <Credits />
          {auth}
        </div>
        <button type="button" className="av-burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <span />
        </button>
      </nav>
      {open && (
        <>
          <div className="av-drawer-scrim" onClick={() => setOpen(false)} />
          <div className="av-drawer" role="dialog" aria-modal aria-label="Menu">
            <Button variant="ghost" size="sm" className="av-drawer-close" onClick={() => setOpen(false)}>
              Close ✕
            </Button>
            {links}
            <div className="av-drawer-auth">{auth}</div>
            <Credits />
          </div>
        </>
      )}
    </div>
  );
}

/** Static stand-in rendered while the navbar resolves the current path. */
export function NavbarFallback() {
  return (
    <div className="av-nav-wrap">
      <nav className="av-nav" aria-label="Main">
        <NeonLogo size="sm" flicker={false} />
      </nav>
    </div>
  );
}
