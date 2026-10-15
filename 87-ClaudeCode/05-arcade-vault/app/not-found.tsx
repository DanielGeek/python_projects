import { ButtonLink } from "@/components/ui/basics";

export default function NotFound() {
  return (
    <div className="av-container av-notfound">
      <h1 className="av-page-title">FIN DEL JUEGO</h1>
      <p className="av-detail-desc">Esta página no existe en el Vault.</p>
      <ButtonLink href="/">Volver al Vault</ButtonLink>
    </div>
  );
}
