import type { Metadata } from "next";
import { HallOfFame } from "./hall-of-fame";

export const metadata: Metadata = { title: "Hall of Fame · Arcade Vault" };

export default function HallOfFamePage() {
  return (
    <div className="av-container">
      <h1 className="av-page-title">HALL OF FAME</h1>
      <HallOfFame />
    </div>
  );
}
