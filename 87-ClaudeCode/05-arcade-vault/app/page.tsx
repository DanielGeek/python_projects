import { Features } from "./_home/features";
import { GamesRail } from "./_home/games-rail";
import { Hero } from "./_home/hero";

export default function Home() {
  return (
    <div className="av-home">
      <Hero />
      <Features />
      <GamesRail />
    </div>
  );
}
