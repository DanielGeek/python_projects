"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { Accent, TouchButton, TouchControls as TouchConfig } from "@/lib/games";
import { cx } from "./basics";

const COARSE = "(pointer: coarse)";

// Key repeat for `repeat` buttons: the browser does not repeat a synthetic keydown.
const REPEAT_DELAY = 250;
const REPEAT_EVERY = 90;

// Accent as an RGB triplet, so the CSS can set the alpha. Same colors as --cyan, --magenta, --yellow, --green.
const RGB: Record<Accent, string> = {
  cyan: "0, 245, 255",
  magenta: "255, 0, 110",
  yellow: "245, 255, 0",
  green: "0, 255, 136",
};

function subscribe(onChange: () => void) {
  const query = window.matchMedia(COARSE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the main pointer is a finger. False on the server and on the first render. */
export function useCoarsePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(COARSE).matches,
    () => false,
  );
}

interface Held {
  pointerId: number;
  el: HTMLElement;
  delay?: number;
  timer?: number;
}

export function TouchControls({
  controls,
  accent,
  paused,
  onKey,
}: {
  controls: TouchConfig;
  accent: Accent;
  /** While true the buttons are disabled and every held key is released. */
  paused: boolean;
  /** Sends one key event to the game, e.g. through the bridge. */
  onKey: (code: string, down: boolean) => void;
}) {
  const held = useRef(new Map<string, Held>());
  const send = useRef(onKey);
  useEffect(() => {
    send.current = onKey;
  }, [onKey]);

  function release(code: string) {
    const entry = held.current.get(code);
    if (!entry) return;
    window.clearTimeout(entry.delay);
    window.clearInterval(entry.timer);
    delete entry.el.dataset.pressed;
    held.current.delete(code);
    send.current(code, false);
  }

  function releaseAll() {
    for (const code of Array.from(held.current.keys())) release(code);
  }

  function press(button: TouchButton, e: PointerEvent<HTMLButtonElement>) {
    // No focus change, so the game keeps the focus: Brick Buster pauses when its window blurs.
    e.preventDefault();
    if (paused || held.current.has(button.code)) return;
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Capture only keeps a sliding finger on the button, so the key goes down without it.
    }
    el.dataset.pressed = "true";
    const entry: Held = { pointerId: e.pointerId, el };
    held.current.set(button.code, entry);
    send.current(button.code, true);
    if (button.repeat) {
      entry.delay = window.setTimeout(() => {
        entry.timer = window.setInterval(() => send.current(button.code, true), REPEAT_EVERY);
      }, REPEAT_DELAY);
    }
  }

  function end(button: TouchButton, e: PointerEvent<HTMLButtonElement>) {
    // Another finger may have taken the same code after this one lifted.
    if (held.current.get(button.code)?.pointerId === e.pointerId) release(button.code);
  }

  useEffect(() => {
    if (paused) releaseAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- release only uses refs
  }, [paused]);

  useEffect(() => {
    function onHide() {
      if (document.hidden) releaseAll();
    }
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      releaseAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- release only uses refs
  }, []);

  function renderButton(button: TouchButton) {
    return (
      <button
        key={button.code}
        type="button"
        className="av-touch-btn"
        data-key={button.code}
        data-glyph={/^[◀▶▲▼]$/.test(button.label) || undefined}
        aria-label={button.name}
        disabled={paused}
        onPointerDown={(e) => press(button, e)}
        onPointerUp={(e) => end(button, e)}
        onPointerCancel={(e) => end(button, e)}
        onLostPointerCapture={(e) => end(button, e)}
        onMouseDown={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span aria-hidden>{button.label}</span>
      </button>
    );
  }

  return (
    <div className="av-touch" style={{ "--av-touch-rgb": RGB[accent] } as CSSProperties}>
      <div className={cx("av-touch-move", `av-touch-${controls.move.layout}`)}>
        {controls.move.buttons.map(renderButton)}
      </div>
      <div className="av-touch-actions">{controls.actions.map(renderButton)}</div>
    </div>
  );
}
