import type { Metadata } from "next";

export const metadata: Metadata = { title: "About · Arcade Vault" };

export default function AboutPage() {
  return (
    <div className="av-container av-container-wide">
      <h1 className="av-hero-title">ABOUT ARCADE VAULT</h1>
    </div>
  );
}
