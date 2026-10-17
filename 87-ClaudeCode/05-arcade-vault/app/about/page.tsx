import type { Metadata } from "next";
import { Divider } from "./divider";
import { Highlights } from "./highlights";

export const metadata: Metadata = { title: "About · Arcade Vault" };

export default function AboutPage() {
  return (
    <div className="av-about">
      <section className="av-about-hero">
        <div className="av-about-kicker av-pixel av-neon-yellow">▸ ABOUT</div>
        <h1 className="av-about-title">ABOUT ARCADE VAULT</h1>
        <p className="av-about-mission">
          ARCADE VAULT was born from a love of classic video games. Our mission is to preserve and celebrate the arcades that defined a
          generation, making them accessible to everyone, anywhere, at no cost.
        </p>
        <Highlights />
      </section>
      <Divider />
    </div>
  );
}
