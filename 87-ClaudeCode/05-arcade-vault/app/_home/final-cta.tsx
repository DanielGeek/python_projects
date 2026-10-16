import { ButtonLink } from "@/components/ui/basics";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <Reveal className="av-home-final">
      <h2 className="av-home-final-title av-pixel">READY TO PLAY?</h2>
      <ButtonLink href="/library" variant="outline" size="xl" pulse>
        INSERT COIN →
      </ButtonLink>
      <div className="av-home-final-tag">Free. No sign-up required. Start in seconds.</div>
    </Reveal>
  );
}
