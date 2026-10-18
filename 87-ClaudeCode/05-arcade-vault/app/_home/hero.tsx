"use client";

import { ButtonLink } from "@/components/ui/basics";
import { useSession } from "@/lib/session";
import { Marquee } from "./marquee";
import { Silhouettes } from "./silhouettes";

const BRICK_ROWS = ["m", "m", "y", "g", "c"] as const;

/** Self-playing Brick Buster attract screen, drawn and animated with CSS only. */
function Cabinet() {
  return (
    <div className="av-home-cab" aria-hidden="true">
      <div className="av-home-cab-sign av-pixel">BRICK BUSTER</div>
      <div className="av-home-cab-bezel">
        <div className="av-home-cab-screen">
          <div className="av-home-hud av-pixel">
            <span>1UP</span>
            <span className="av-home-score" />
            <span>HI 099999</span>
          </div>
          <div className="av-home-bricks">
            {BRICK_ROWS.flatMap((tone, r) =>
              Array.from({ length: 8 }, (_, c) => {
                const i = r * 8 + c;
                return (
                  <i
                    key={i}
                    className={`av-home-brick av-home-brick-${tone}`}
                    style={{ "--i": i } as React.CSSProperties}
                  />
                );
              }),
            )}
          </div>
          <div className="av-home-field">
            <i className="av-home-ball" />
            <i className="av-home-paddle" />
          </div>
        </div>
      </div>
      <div className="av-home-cab-deck">
        <span className="av-home-stick" />
        <span className="av-home-btn av-home-btn-c" />
        <span className="av-home-btn av-home-btn-y" />
        <span className="av-home-slot av-pixel">
          <em>INSERT</em>
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  const session = useSession();
  const signedIn = !!session && !session.guest;
  return (
    <>
      <section className="av-home-hero">
        <Silhouettes />
        <div className="av-home-hero-inner">
          <div className="av-home-copy">
            <div className="av-home-eyebrow av-pixel av-neon-yellow">
              ▸ INSERT A COIN<span className="av-home-eyebrow-caret">_</span>
            </div>
            <h1 className="av-home-title">
              <span className="av-home-line-1">THE CLASSIC</span>
              <span className="av-home-line-2">ARCADE IS</span>
              <span className="av-home-line-3">
                <span className="av-home-back">BACK</span>
              </span>
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
          </div>
          <Cabinet />
        </div>
      </section>
      <Marquee />
    </>
  );
}
