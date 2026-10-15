import { NeonLogo } from "@/components/ui/basics";
import { Library } from "./library";

export default function Home() {
  return (
    <div className="av-container">
      <header className="av-hero">
        <h1 className="av-sr">Arcade Vault</h1>
        <NeonLogo size="lg" />
        <p className="av-tagline">INSERTA UNA MONEDA PARA JUGAR</p>
      </header>
      <Library />
    </div>
  );
}
