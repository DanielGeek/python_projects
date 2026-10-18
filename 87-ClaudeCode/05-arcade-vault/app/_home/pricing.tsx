"use client";

import { ButtonLink } from "@/components/ui/basics";
import { useSession } from "@/lib/session";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

const PERKS = [
  "Access to every game",
  "Global ranking and hall of fame",
  "No ads between games",
  "Save your scores",
  "New games every month",
  "Works in any browser",
];

const FAQ = [
  {
    q: "IS IT REALLY FREE?",
    a: 'Yes. Arcade Vault is a non-profit project made out of love for the classics. There is no hidden "premium" version.',
  },
  {
    q: "DO I NEED AN ACCOUNT?",
    a: "No. You can play as a guest. If you want to save your score and appear in the ranking, sign up in 10 seconds.",
  },
  {
    q: "HOW DO YOU SURVIVE WITHOUT CHARGING?",
    a: "It is a community project. If you like it, share it. That is the only coin we accept.",
  },
];

export function Pricing() {
  const session = useSession();
  const signedIn = !!session && !session.guest;
  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="STAGE 04" tone="green" title="PRICING" />
      <div className="av-home-pricing">
        <div className="av-home-price-wrap">
          <div className="av-home-price">
            <div className="av-home-price-label av-pixel">SINGLE PLAN</div>
            <div className="av-home-price-name av-pixel">VAULT PLAYER</div>
            <div className="av-home-price-amount">
              <span className="av-home-price-n">$0</span>
              <span className="av-home-price-u">/ FOREVER</span>
            </div>
            <div className="av-home-price-tag">NO TRICKS · NO FINE PRINT</div>
            <ul className="av-home-price-list">
              {PERKS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {signedIn ? (
              <ButtonLink href="/library" variant="outline" size="xl" pulse block>
                PLAY NOW →
              </ButtonLink>
            ) : (
              <ButtonLink href="/login" variant="outline" size="xl" pulse block>
                START FREE →
              </ButtonLink>
            )}
            <div className="av-home-price-foot">We never ask for a card. We never will.</div>
            <div className="av-home-price-stamp av-pixel" aria-hidden>
              FREE
              <br />
              PLAY
            </div>
          </div>
        </div>

        <div className="av-home-faq">
          {FAQ.map((f) => (
            <div key={f.q} className="av-home-faq-item">
              <div className="av-home-faq-q av-pixel">
                <span aria-hidden="true">Q{String(FAQ.indexOf(f) + 1)}▸</span> {f.q}
              </div>
              <div className="av-home-faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
