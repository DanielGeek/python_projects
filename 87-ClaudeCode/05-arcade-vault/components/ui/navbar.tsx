"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/session";
import { Button, ButtonLink, NeonLogo } from "./basics";

const LINKS = [
  { href: "/", label: "Biblioteca", match: (p: string) => p === "/" || p.startsWith("/juegos") },
  { href: "/salon-de-la-fama", label: "Salón de la Fama", match: (p: string) => p.startsWith("/salon-de-la-fama") },
];

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
          Salir
        </Button>
      </>
    ) : (
      <ButtonLink href="/acceso" variant="outline" size="sm">
        Iniciar Sesión
      </ButtonLink>
    );

  return (
    <div className="av-nav-wrap">
      <nav className="av-nav" aria-label="Principal">
        <Link href="/" aria-label="Arcade Vault, ir a la biblioteca">
          <NeonLogo size="sm" flicker={false} />
        </Link>
        <div className="av-nav-links">{links}</div>
        <div className="av-nav-right">{auth}</div>
        <button type="button" className="av-burger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(true)}>
          <span />
        </button>
      </nav>
      {open && (
        <>
          <div className="av-drawer-scrim" onClick={() => setOpen(false)} />
          <div className="av-drawer" role="dialog" aria-modal aria-label="Menú">
            <Button variant="ghost" size="sm" className="av-drawer-close" onClick={() => setOpen(false)}>
              Cerrar ✕
            </Button>
            {links}
            <div className="av-drawer-auth">{auth}</div>
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
      <nav className="av-nav" aria-label="Principal">
        <NeonLogo size="sm" flicker={false} />
      </nav>
    </div>
  );
}
