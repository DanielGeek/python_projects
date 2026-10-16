import Link from "next/link";
import { ButtonLink } from "@/components/ui/basics";
import { CoverArt } from "@/components/ui/game";
import { GAMES } from "@/lib/games";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

export function GamesRail() {
  return (
    <Reveal className="av-home-section">
      <SectionHead kicker="// 02" tone="cyan" title="GAMES AVAILABLE NOW" />
      <div className="av-home-rail">
        {GAMES.slice(0, 6).map((g) => (
          <Link key={g.id} href={`/game/${g.id}`} className="av-home-mini">
            <div className="av-home-mini-cover">
              <CoverArt id={g.id} />
            </div>
            <div className="av-home-mini-meta">
              <div className="av-home-mini-title">{g.title}</div>
              <div className="av-home-mini-cat">{g.category}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="av-home-more">
        <ButtonLink href="/library" variant="outline" size="lg">
          VIEW ALL GAMES →
        </ButtonLink>
      </div>
    </Reveal>
  );
}
