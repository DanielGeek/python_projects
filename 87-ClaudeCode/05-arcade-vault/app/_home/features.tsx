import { GAMES } from "@/lib/games";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

type Kind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

const FEATURES: {
  kind: Kind;
  title: string;
  desc: string;
  tone: "cyan" | "yellow" | "magenta" | "green";
}[] = [
  {
    kind: "GAMEPAD",
    title: "CLASSIC GAMES",
    desc: "Arkanoid, Tetris, Snake and many more. The best arcades of all time in one place.",
    tone: "cyan",
  },
  {
    kind: "FREE",
    title: "100% FREE",
    desc: "No subscriptions, no hidden fees. Every game is available for free.",
    tone: "yellow",
  },
  {
    kind: "TROPHY",
    title: "LEADERBOARDS",
    desc: "Compete with players from around the world. Climb the ranking and prove who is the best.",
    tone: "magenta",
  },
  {
    kind: "ROCKET",
    title: "ALWAYS GROWING",
    desc: "We add new games all the time. Come back often, there is always something new to play.",
    tone: "green",
  },
];

const READOUTS: { k: string; v: string; tone: "cyan" | "yellow" | "magenta" | "green" }[] = [
  { k: "GAMES", v: String(GAMES.length).padStart(2, "0"), tone: "cyan" },
  { k: "PRICE", v: "$0.00", tone: "yellow" },
  { k: "RANKING", v: "GLOBAL", tone: "magenta" },
  { k: "NEW GAMES", v: "SOON", tone: "green" },
];

export function Features() {
  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="STAGE 01" tone="magenta" title="WHY ARCADE VAULT?" />
      <div className="av-home-feat-wrap">
        <ol className="av-home-features">
          {FEATURES.map((f, i) => (
            <li key={f.kind} className={`av-home-feature av-home-feature-${f.tone}`}>
              <span className="av-home-feature-num av-pixel" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="av-home-feature-btn" aria-hidden="true">
                <FeatureIcon kind={f.kind} />
              </span>
              <div className="av-home-feature-body">
                <h3 className="av-home-feature-title av-pixel">{f.title}</h3>
                <p className="av-home-feature-desc">{f.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="av-home-feat-aside" aria-label="Vault at a glance">
          <div className="av-home-feat-aside-h av-pixel">VAULT STATUS</div>
          {READOUTS.map((r) => (
            <div key={r.k} className={`av-home-readout av-home-readout-${r.tone}`}>
              <span className="av-home-readout-k">{r.k}</span>
              <span className="av-home-readout-v av-pixel">{r.v}</span>
            </div>
          ))}
          <div className="av-home-feat-aside-f av-pixel">PRESS START</div>
        </aside>
      </div>
    </Reveal>
  );
}

/** Pixel-style 16x16 SVG icons drawn from rects; the color comes from the parent card. */
function FeatureIcon({ kind }: { kind: Kind }) {
  const C = "currentColor";
  const icon = "av-home-feature-icon";
  switch (kind) {
    case "GAMEPAD":
      return (
        <svg className={icon} viewBox="0 0 16 16" aria-hidden>
          <g fill={C}>
            <rect x="2" y="6" width="12" height="6" />
            <rect x="0" y="8" width="2" height="4" />
            <rect x="14" y="8" width="2" height="4" />
            <rect x="3" y="8" width="2" height="2" />
            <rect x="2" y="9" width="4" height="0.5" />
            <rect x="11" y="7" width="1.5" height="1.5" />
            <rect x="11" y="10" width="1.5" height="1.5" />
          </g>
        </svg>
      );
    case "FREE":
      return (
        <svg className={icon} viewBox="0 0 16 16" aria-hidden>
          <g fill={C}>
            <rect x="3" y="3" width="10" height="10" fill="none" stroke={C} strokeWidth="1.5" />
            <rect x="5" y="6" width="1.5" height="4" />
            <rect x="5" y="6" width="4" height="1.5" />
            <rect x="5" y="8" width="3" height="1" />
            <rect x="10" y="6" width="1.5" height="4" />
          </g>
        </svg>
      );
    case "TROPHY":
      return (
        <svg className={icon} viewBox="0 0 16 16" aria-hidden>
          <g fill={C}>
            <rect x="3" y="2" width="10" height="2" />
            <rect x="3" y="2" width="2" height="6" />
            <rect x="11" y="2" width="2" height="6" />
            <rect x="5" y="8" width="6" height="2" />
            <rect x="7" y="10" width="2" height="3" />
            <rect x="5" y="13" width="6" height="1.5" />
            <rect x="1" y="3" width="2" height="3" />
            <rect x="13" y="3" width="2" height="3" />
          </g>
        </svg>
      );
    case "ROCKET":
      return (
        <svg className={icon} viewBox="0 0 16 16" aria-hidden>
          <g fill={C}>
            <rect x="7" y="1" width="2" height="2" />
            <rect x="6" y="3" width="4" height="2" />
            <rect x="5" y="5" width="6" height="6" />
            <rect x="4" y="11" width="2" height="2" />
            <rect x="10" y="11" width="2" height="2" />
            <rect x="7" y="6" width="2" height="2" fill="#0a0a0f" />
            <rect x="6" y="13" width="1" height="2" />
            <rect x="9" y="13" width="1" height="2" />
          </g>
        </svg>
      );
  }
}
