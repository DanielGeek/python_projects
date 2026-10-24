"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, PixelSpinner, formatScore } from "@/components/ui/basics";
import { CRTScreen, HUD } from "@/components/ui/game";
import { Modal, Typewriter } from "@/components/ui/interactive";
import { TouchControls, useCoarsePointer } from "@/components/ui/touch-controls";
import type { Game } from "@/lib/games";
import { insertCoin, spendCredit } from "@/lib/credits";
import { submitScore } from "@/lib/leaderboard";
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
  const [saved, setSaved] = useState(false);
  // True when storage refused the score: it is only kept until the tab closes.
  const [volatile, setVolatile] = useState(false);
  // The request to the global leaderboard: running, and whether it saved (null until it answers).
  const [sending, setSending] = useState(false);
  const [shared, setShared] = useState<boolean | null>(null);
  // The run that is on screen now, so a late answer for a previous run is ignored.
  const currentRun = useRef(run);

  // A finger is the main pointer: the HUD gives way to touch buttons over the screen.
  const coarse = useCoarsePointer();

  const signedIn = !!session && !session.guest;
  const player = session?.name ?? "GUEST";

  useEffect(() => {
    currentRun.current = run;
  }, [run]);

  // One credit per game start. The ref keeps Strict Mode's double effect from spending twice.
  useEffect(() => {
    if (spentRun.current === run) return;
    spentRun.current = run;
    setStatus(spendCredit() ? "playing" : "no-credit");
  }, [run]);

  // State reported by public/games/bridge.js inside the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow || e.data?.source !== "arcade-vault-game")
        return;
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

  function sendKey(code: string, down: boolean) {
    frame.current?.contentWindow?.postMessage(
      { source: "arcade-vault-host", type: "key", code, down },
      "*",
    );
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
    setVolatile(false);
    setSending(false);
    setShared(null);
    setPaused(false);
    setLoading(true);
    setRun((r) => r + 1);
  }

  function addCoins() {
    insertCoin();
    restart();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (finalScore == null || sending) return;
    // A guest is always saved as GUEST; only an account owns a name (the insert policy enforces both).
    const playerName = signedIn ? player : "GUEST";
    // The local copy goes first, so the score is never lost if the request fails.
    const persisted = saveScore(game.id, {
      player: playerName,
      score: finalScore,
      date: new Date().toISOString(),
    });
    setVolatile(!persisted);
    setSending(true);
    const startedRun = currentRun.current;
    const global = await submitScore({
      gameId: game.id,
      player: playerName,
      score: finalScore,
      userId: session?.userId,
    });
    if (startedRun !== currentRun.current) return;
    setSending(false);
    setShared(global);
    setSaved(true);
  }

  return (
    <div className="av-player">
      {!coarse && (
        <HUD
          score={state.score}
          lives={state.lives}
          level={state.level}
          player={player}
          paused={paused}
          onPause={togglePause}
          onExit={() => router.push(`/game/${game.id}`)}
        />
      )}
      {coarse && (
        // Pause and Exit above the bezel: inside the screen they would cover the game's own toolbar.
        <div className="av-touch-bar">
          {status === "playing" && !loading && (
            <button type="button" className="av-touch-mini" onClick={togglePause}>
              {paused ? "Resume" : "Pause"}
            </button>
          )}
          <button
            type="button"
            className="av-touch-mini"
            onClick={() => router.push(`/game/${game.id}`)}
          >
            Exit
          </button>
        </div>
      )}
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
      {coarse && game.touch && status === "playing" && !loading && finalScore == null && (
        <TouchControls controls={game.touch} accent={game.accent} paused={paused} onKey={sendKey} />
      )}
      <p className="av-player-controls">{game.controls}</p>

      <Modal
        open={finalScore != null}
        actions={
          <>
            <Button block onClick={restart}>
              Play again
            </Button>
            <ButtonLink href="/library" variant="ghost" block>
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
            <Typewriter text={volatile ? "SCORE KEPT" : "SCORE SAVED"} />
            {volatile && (
              <p className="av-modal-note">
                Storage is unavailable, so the score is kept only until you close this tab.
              </p>
            )}
            {shared ? (
              <p className="av-modal-note">Your score is on the global leaderboard.</p>
            ) : (
              <div className="av-about-error" role="alert">
                <span className="av-about-error-tag">[ERR]</span>{" "}
                {volatile
                  ? "The global leaderboard could not be reached."
                  : "Saved on this device only. The global leaderboard could not be reached."}
              </div>
            )}
          </div>
        ) : (
          <form className="av-save-form" onSubmit={submit}>
            {signedIn ? (
              <p className="av-modal-note">It will be saved as {player}.</p>
            ) : (
              <p className="av-modal-note">
                Playing as a guest: your score is saved as GUEST. Sign in to save it under your
                name.
              </p>
            )}
            <Button type="submit" variant="outline" block disabled={sending}>
              {sending ? "SAVING…" : "Save score"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
