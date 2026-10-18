import { cx } from "@/components/ui/basics";

const DEFAULT_ITEMS = [
  "INSERT COIN",
  "1UP READY",
  "FREE PLAY",
  "BEAT THE HIGH SCORE",
  "NO DOWNLOADS",
  "PRESS START",
];

/** Endless hazard-tape ticker. Decorative: hidden from assistive tech. */
export function Marquee({
  items = DEFAULT_ITEMS,
  reverse = false,
  className,
}: {
  items?: string[];
  reverse?: boolean;
  className?: string;
}) {
  const run = (key: string) => (
    <div className="av-home-marquee-run" key={key}>
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="av-home-marquee-item">
          {t}
          <b className={`av-home-marquee-star av-home-marquee-star-${i % 4}`}>★</b>
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={cx("av-home-marquee", reverse && "av-home-marquee-rev", className)}
      aria-hidden="true"
    >
      <div className="av-home-marquee-track">
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
