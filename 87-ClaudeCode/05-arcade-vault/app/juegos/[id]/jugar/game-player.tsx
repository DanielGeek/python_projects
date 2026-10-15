"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, PixelSpinner, formatScore } from "@/components/ui/basics";
import { CRTScreen, HUD } from "@/components/ui/game";
import { Input, Modal, Typewriter } from "@/components/ui/interactive";
import type { Game } from "@/lib/games";
import { saveScore } from "@/lib/scores";
import { useSession } from "@/lib/session";

interface GameState {
  score: number;
  lives: number | null;
  level: number | null;
  over: boolean;
}

const INITIAL: GameState = { score: 0, lives: null, level: 1, over: false };

export function GamePlayer({ game }: { game: Game }) {
  const router = useRouter();
  const session = useSession();
  const frame = useRef<HTMLIFrameElement>(null);
  const [run, setRun] = useState(0);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<GameState>(INITIAL);
  const [paused, setPaused] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const signedIn = !!session && !session.guest;
  const player = session?.name ?? "INVITADO";

  // State reported by public/games/bridge.js inside the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow || e.data?.source !== "arcade-vault-game") return;
      const next = e.data.state as GameState;
      setState((prev) => {
        if (next.over && !prev.over) setFinalScore(next.score);
        return next;
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function send(type: "pause" | "resume") {
    frame.current?.contentWindow?.postMessage({ source: "arcade-vault-host", type }, "*");
  }

  function togglePause() {
    send(paused ? "resume" : "pause");
    setPaused(!paused);
    if (paused) frame.current?.focus();
  }

  function playAgain() {
    setState(INITIAL);
    setFinalScore(null);
    setSaved(false);
    setPaused(false);
    setLoading(true);
    setRun((r) => r + 1);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (finalScore == null) return;
    const playerName = signedIn ? player : (name.trim() || "INVITADO").toUpperCase().slice(0, 12);
    saveScore(game.id, { player: playerName, score: finalScore, date: new Date().toISOString() });
    setSaved(true);
  }

  return (
    <div className="av-player">
      <HUD
        score={state.score}
        lives={state.lives}
        level={state.level}
        player={player}
        paused={paused}
        onPause={togglePause}
        onExit={() => router.push(`/juegos/${game.id}`)}
      />
      <CRTScreen
        aspect={game.aspect}
        on={!loading}
        overlay={
          <>
            {loading && (
              <div className="av-screen-overlay av-wipe">
                <PixelSpinner label="INICIANDO JUEGO…" />
              </div>
            )}
            {paused && (
              <button type="button" className="av-screen-overlay av-paused" onClick={togglePause}>
                <span className="av-paused-title">PAUSA</span>
                <span className="av-paused-hint">Haz clic para reanudar</span>
              </button>
            )}
          </>
        }
      >
        <iframe
          key={run}
          ref={frame}
          src={game.src!}
          title={game.title}
          // First-party games from public/games: same origin so Tetris can keep its own records.
          // Games from other origins should drop allow-same-origin.
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          onLoad={() => {
            setLoading(false);
            frame.current?.focus();
          }}
        />
      </CRTScreen>
      <p className="av-player-controls">{game.controls}</p>

      <Modal
        open={finalScore != null}
        actions={
          <>
            <Button block onClick={playAgain}>
              Jugar de nuevo
            </Button>
            <ButtonLink href="/" variant="ghost" block>
              Volver al Vault
            </ButtonLink>
          </>
        }
      >
        <div>
          <div className="av-final-label">PUNTUACIÓN FINAL</div>
          <div className="av-final-score">{formatScore(finalScore ?? 0)}</div>
        </div>
        {saved ? (
          <div className="av-saved">
            <Typewriter text="PUNTUACIÓN GUARDADA" />
          </div>
        ) : (
          <form className="av-save-form" onSubmit={submit}>
            {signedIn ? (
              <p className="av-modal-note">Se guardará como {player}.</p>
            ) : (
              <>
                <Input label="Tu nombre" placeholder="INVITADO" maxLength={12} value={name} onChange={(e) => setName(e.target.value)} />
                <p className="av-modal-note">Juegas como invitado: tu puntuación se guarda solo en este dispositivo.</p>
              </>
            )}
            <Button type="submit" variant="outline" block>
              Guardar puntuación
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
