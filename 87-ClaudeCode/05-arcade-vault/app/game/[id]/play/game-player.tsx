"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, PixelSpinner, formatScore } from "@/components/ui/basics";
import { CRTScreen, HUD } from "@/components/ui/game";
import { Input, Modal, Typewriter } from "@/components/ui/interactive";
import type { Game } from "@/lib/games";
import { insertCoin, spendCredit } from "@/lib/credits";
import { saveScore } from "@/lib/scores";
import { useSession } from "@/lib/session";

interface GameState {
  score: number;
  lives: number | null;
  level: number | null;
  over: boolean;
}

type Status = "checking" | "playing" | "no-credit";

const INITIAL: GameState = { score: 0, lives: null, level: 1, over: false };

export function GamePlayer({ game }: { game: Game }) {
  const router = useRouter();
  const session = useSession();
  const frame = useRef<HTMLIFrameElement>(null);
  const [run, setRun] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>("checking");
  const spentRun = useRef<number | null>(null);
  const [state, setState] = useState<GameState>(INITIAL);
  const [paused, setPaused] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const signedIn = !!session && !session.guest;
  const player = session?.name ?? "GUEST";

  // One credit per game start. The ref keeps Strict Mode's double effect from spending twice.
  useEffect(() => {
    if (spentRun.current === run) return;
    spentRun.current = run;
    setStatus(spendCredit() ? "playing" : "no-credit");
  }, [run]);

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

  function restart() {
    setStatus("checking");
    setState(INITIAL);
    setFinalScore(null);
    setSaved(false);
    setPaused(false);
    setLoading(true);
    setRun((r) => r + 1);
  }

  function addCoins() {
    insertCoin();
    restart();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (finalScore == null) return;
    const playerName = signedIn ? player : (name.trim() || "GUEST").toUpperCase().slice(0, 12);
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
        onExit={() => router.push(`/game/${game.id}`)}
      />
      <CRTScreen
        aspect={game.aspect}
        label={game.title}
        on={status === "playing" && !loading}
        overlay={
          <>
            {status === "no-credit" && (
              <button type="button" className="av-screen-overlay av-paused" onClick={addCoins}>
                <span className="av-paused-title">INSERT COIN</span>
                <span className="av-paused-hint">Out of credits · click to add 3</span>
              </button>
            )}
            {status !== "no-credit" && loading && (
              <div className="av-screen-overlay av-wipe">
                <PixelSpinner label="STARTING GAME…" />
              </div>
            )}
            {paused && (
              <button type="button" className="av-screen-overlay av-paused" onClick={togglePause}>
                <span className="av-paused-title">PAUSED</span>
                <span className="av-paused-hint">Click to resume</span>
              </button>
            )}
          </>
        }
      >
        {status === "playing" && (
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
        )}
      </CRTScreen>
      <p className="av-player-controls">{game.controls}</p>

      <Modal
        open={finalScore != null}
        actions={
          <>
            <Button block onClick={restart}>
              Play again
            </Button>
            <ButtonLink href="/" variant="ghost" block>
              Back to the Vault
            </ButtonLink>
          </>
        }
      >
        <div>
          <div className="av-final-label">FINAL SCORE</div>
          <div className="av-final-score">{formatScore(finalScore ?? 0)}</div>
        </div>
        {saved ? (
          <div className="av-saved">
            <Typewriter text="SCORE SAVED" />
          </div>
        ) : (
          <form className="av-save-form" onSubmit={submit}>
            {signedIn ? (
              <p className="av-modal-note">It will be saved as {player}.</p>
            ) : (
              <>
                <Input label="Your name" placeholder="GUEST" maxLength={12} value={name} onChange={(e) => setName(e.target.value)} />
                <p className="av-modal-note">Playing as a guest: your score is saved on this device only.</p>
              </>
            )}
            <Button type="submit" variant="outline" block>
              Save score
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
