import Link from "next/link";
import { CoverArt } from "@/components/ui/game";
import { GAMES } from "@/lib/games";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

export function GamesRail() {
  const shown = GAMES.slice(0, 5);
  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="STAGE 02" tone="cyan" title="GAMES AVAILABLE NOW" />
      <div className="av-home-mosaic">
        {shown.map((g, i) => (
          <Link
            key={g.id}
            href={`/game/${g.id}`}
            className={`av-home-tile av-home-tile-${g.accent}${i === 0 ? " av-home-tile-big" : ""}`}
          >
            <CoverArt id={g.id} />
            <span className="av-home-tile-no av-pixel" aria-hidden="true">
              P{i + 1}
            </span>
            <span className={`av-home-tile-state av-pixel${g.src ? " av-home-tile-state-on" : ""}`}>
              {g.src ? "PLAYABLE" : "SOON"}
            </span>
            <span className="av-home-tile-meta">
              <span className="av-home-tile-cat">{g.category}</span>
              <span className="av-home-tile-title">{g.title}</span>
              {i === 0 && <span className="av-home-tile-tag">{g.tagline}</span>}
            </span>
            <span className="av-home-tile-go av-pixel" aria-hidden="true">
              {g.src ? "PLAY ▶" : "VIEW ▶"}
            </span>
          </Link>
        ))}
        <Link href="/library" className="av-home-all">
          <span className="av-home-all-n av-pixel">{GAMES.length}</span>
          <span className="av-home-all-t av-pixel">VIEW ALL GAMES</span>
          {GAMES.length > shown.length && (
            <span className="av-home-all-more">
              +{GAMES.length - shown.length} more in the vault
            </span>
          )}
          <span className="av-home-all-a" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </Reveal>
  );
}
