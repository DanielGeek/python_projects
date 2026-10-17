type Kind = "HEART" | "BROWSER" | "PLANT";

const HIGHLIGHTS: { kind: Kind; text: string; tone: "magenta" | "cyan" | "green" }[] = [
  { kind: "HEART", text: "MADE WITH ❤️ FOR PLAYERS", tone: "magenta" },
  { kind: "BROWSER", text: "HTML GAMES — RUN IN ANY BROWSER", tone: "cyan" },
  { kind: "PLANT", text: "A CONSTANTLY GROWING PROJECT", tone: "green" },
];

export function Highlights() {
  return (
    <div className="av-about-highlights">
      {HIGHLIGHTS.map((h, i) => (
        <div key={h.kind} className={`av-about-highlight av-about-highlight-${h.tone}`} style={{ transitionDelay: `${i * 80}ms` }}>
          <HighlightIcon kind={h.kind} />
          <div className="av-about-hl-text">{h.text}</div>
        </div>
      ))}
    </div>
  );
}

function HighlightIcon({ kind }: { kind: Kind }) {
  const C = "currentColor";
  if (kind === "HEART")
    return (
      <svg className="av-about-hl-icon" viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="2" y="3" width="4" height="2" />
          <rect x="10" y="3" width="4" height="2" />
          <rect x="1" y="4" width="2" height="4" />
          <rect x="13" y="4" width="2" height="4" />
          <rect x="2" y="8" width="2" height="2" />
          <rect x="12" y="8" width="2" height="2" />
          <rect x="3" y="9" width="10" height="2" />
          <rect x="4" y="11" width="8" height="2" />
          <rect x="5" y="12" width="6" height="2" />
          <rect x="6" y="13" width="4" height="1" />
          <rect x="7" y="14" width="2" height="1" />
        </g>
      </svg>
    );
  if (kind === "BROWSER")
    return (
      <svg className="av-about-hl-icon" viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="1" y="2" width="14" height="12" fill="none" stroke={C} strokeWidth="1.4" />
          <rect x="1" y="2" width="14" height="3" />
          <rect x="3" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="5" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="7" y="3" width="1" height="1" fill="#0a0a0f" />
          <rect x="3" y="7" width="4" height="1" />
          <rect x="3" y="9" width="6" height="1" />
          <rect x="3" y="11" width="3" height="1" />
        </g>
      </svg>
    );
  return (
    <svg className="av-about-hl-icon" viewBox="0 0 16 16" aria-hidden="true">
      <g fill={C}>
        <rect x="7" y="2" width="2" height="10" />
        <rect x="4" y="4" width="3" height="2" />
        <rect x="9" y="6" width="3" height="2" />
        <rect x="3" y="3" width="2" height="2" />
        <rect x="11" y="5" width="2" height="2" />
        <rect x="3" y="12" width="10" height="2" />
        <rect x="4" y="14" width="8" height="1" />
      </g>
    </svg>
  );
}
