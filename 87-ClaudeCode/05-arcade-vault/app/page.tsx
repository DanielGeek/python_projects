import { Library } from "./library";

export default function Home() {
  return (
    <div className="av-container av-container-wide">
      <header className="av-hero">
        <h1 className="av-hero-title av-flicker-title">ARCADE VAULT</h1>
        <p className="av-tagline">
          INSERT A COIN TO PLAY <span className="av-tagline-caret">_</span>
        </p>
      </header>
      <Library />
    </div>
  );
}
