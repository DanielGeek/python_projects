"use client";

import { ButtonLink } from "@/components/ui/basics";
import { useSession } from "@/lib/session";
import { Silhouettes } from "./silhouettes";

export function Hero() {
  const session = useSession();
  const signedIn = !!session && !session.guest;
  return (
    <section className="av-home-hero">
      <Silhouettes />
      <div className="av-home-hero-inner">
        <div className="av-home-eyebrow av-pixel av-neon-yellow">
          ▸ INSERT A COIN<span className="av-home-eyebrow-caret">_</span>
        </div>
        <h1 className="av-home-title">
          <span className="av-home-line-1">THE CLASSIC</span>
          <span className="av-home-line-2">ARCADE IS</span>
          <span className="av-home-line-3">BACK</span>
        </h1>
        <p className="av-home-sub">
          Play the best classics right in your browser.
          <br />
          No downloads. No cost. Just fun.
        </p>
        <div className="av-home-ctas">
          <ButtonLink href="/library" variant="outline" size="xl" pulse>
            ▶ EXPLORE GAMES
          </ButtonLink>
          {!signedIn && (
            <ButtonLink href="/login" variant="outline" size="xl" tone="magenta">
              ✦ CREATE ACCOUNT
            </ButtonLink>
          )}
        </div>
        <div className="av-home-scroll" aria-hidden="true">
          <span>SCROLL</span>
          <span className="av-home-arrow">▼</span>
        </div>
      </div>
    </section>
  );
}
