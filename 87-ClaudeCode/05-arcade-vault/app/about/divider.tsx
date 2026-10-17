import { Reveal } from "../_home/reveal";

export function Divider() {
  return (
    <Reveal as="div" className="av-about-divider">
      <div className="av-about-bar" aria-hidden="true" />
      <div className="av-about-pixels" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <div className="av-about-bar" aria-hidden="true" />
    </Reveal>
  );
}
