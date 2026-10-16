"use client";

import { useEffect, useId, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./basics";

export function Input({ label, hint, error, className, id, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  const hintId = hint || error ? `${fieldId}-hint` : undefined;
  return (
    <div className={cx("av-field", error && "av-field-error", className)}>
      {label && (
        <label className="av-field-label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <input type="text" {...rest} id={fieldId} className="av-input" aria-invalid={error ? true : undefined} aria-describedby={hintId} />
      {(error || hint) && (
        <div className="av-field-hint" id={hintId}>
          {error || hint}
        </div>
      )}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  categories,
  category,
  onCategoryChange,
  placeholder = "Search for a game by name…",
}: {
  value: string;
  onChange: (q: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (c: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="av-search" role="search">
      <div className="av-search-box">
        <span className="av-search-icon" aria-hidden>
          ⌕
        </span>
        <label className="av-sr" htmlFor={id}>
          Search games
        </label>
        <input id={id} type="search" className="av-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
      <div className="av-chips" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button key={c} type="button" className="av-chip" aria-pressed={c === category} onClick={() => onCategoryChange(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({ tabs, value, onChange, fill, label }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; fill?: boolean; label: string }) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === value);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next.id);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
  }
  return (
    <div className={cx("av-tabs", fill && "av-tabs-fill")} role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button key={t.id} type="button" role="tab" data-tab={t.id} className="av-tab" aria-selected={on} tabIndex={on ? 0 : -1} onClick={() => onChange(t.id)}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Typewriter({ text = "SCORE SAVED", speed = 60 }: { text?: string; speed?: number }) {
  const [n, setN] = useState(0);
  // Only mounted after a user action, so reading the media query during render cannot cause a hydration mismatch.
  const count = prefersReducedMotion() ? text.length : n;
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return (
    <span className="av-type" role="status" aria-label={text}>
      <span aria-hidden>{text.slice(0, count)}</span>
      <span className="av-caret" aria-hidden />
    </span>
  );
}

export function Modal({
  open,
  title = "GAME OVER",
  tone = "magenta",
  onClose,
  actions,
  children,
}: {
  open: boolean;
  title?: string;
  tone?: "magenta" | "cyan";
  onClose?: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open || !onClose) return;
    const k = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="av-modal-scrim" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx("av-modal", tone === "cyan" && "av-modal-cyan")} role="dialog" aria-modal aria-labelledby={titleId}>
        <h2 className="av-modal-title" id={titleId}>
          {title}
        </h2>
        {children}
        {actions && <div className="av-modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
