import type { Metadata } from "next";
import { HallOfFame } from "./hall-of-fame";

export const metadata: Metadata = { title: "Salón de la Fama · Arcade Vault" };

export default function HallOfFamePage() {
  return (
    <div className="av-container">
      <h1 className="av-page-title">SALÓN DE LA FAMA</h1>
      <HallOfFame />
    </div>
  );
}
