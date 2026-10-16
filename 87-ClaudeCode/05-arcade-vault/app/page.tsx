import { Activity } from "./_home/activity";
import { Features } from "./_home/features";
import { FinalCta } from "./_home/final-cta";
import { GamesRail } from "./_home/games-rail";
import { Hero } from "./_home/hero";
import { Pricing } from "./_home/pricing";
import { Stats } from "./_home/stats";

export default function Home() {
  return (
    <div className="av-home">
      <Hero />
      <Features />
      <GamesRail />
      <Stats />
      <Activity />
      <Pricing />
      <FinalCta />
    </div>
  );
}
