import { ButtonLink } from "@/components/ui/basics";

export default function NotFound() {
  return (
    <div className="av-container av-notfound">
      <h1 className="av-page-title">GAME OVER</h1>
      <p className="av-detail-desc">This page does not exist in the Vault.</p>
      <ButtonLink href="/">Back to the Vault</ButtonLink>
    </div>
  );
}
