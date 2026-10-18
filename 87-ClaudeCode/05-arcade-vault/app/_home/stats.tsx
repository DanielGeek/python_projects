import { Reveal } from "./reveal";

// Static marketing copy, as in the reference. Not measured data.
const STATS = [
  { n: "12+", u: "GAMES", s: "AND COUNTING" },
  { n: "THOUSANDS", u: "OF PLAYS", s: "EVERY DAY" },
  { n: "GLOBAL", u: "RANKING", s: "COMPETE WITH THE WORLD" },
];

export function Stats() {
  return (
    <Reveal className="av-home-stats">
      <div className="av-home-tape" aria-hidden="true" />
      <div className="av-home-stats-inner">
        {STATS.map((st) => (
          <div key={st.u} className="av-home-stat">
            <div className="av-home-stat-n av-neon-yellow">{st.n}</div>
            <div className="av-home-stat-u av-pixel">{st.u}</div>
            <div className="av-home-stat-s">{st.s}</div>
          </div>
        ))}
      </div>
      <div className="av-home-tape" aria-hidden="true" />
    </Reveal>
  );
}
