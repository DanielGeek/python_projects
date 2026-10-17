"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button, cx } from "@/components/ui/basics";
import { Input } from "@/components/ui/interactive";
import { validateContact, type ContactField } from "@/lib/contact";
import { Reveal } from "../_home/reveal";

type FormStatus = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "error"; message: string };
type FieldErrors = Partial<Record<ContactField, string>>;

const EMPTY = { name: "", email: "", message: "" };

export function ContactSection() {
  const messageId = useId();
  const [form, setForm] = useState(EMPTY);
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const triggerShake = () => {
    clearTimeout(shakeTimer.current);
    setShake(true);
    shakeTimer.current = setTimeout(() => setShake(false), 400);
  };

  const setField = (field: ContactField, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "sending") return;

    const errors = validateContact(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      triggerShake();
      return;
    }

    setFieldErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      const data: { ok?: boolean; error?: string; fieldErrors?: FieldErrors } = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({ kind: "sent", name: form.name.trim() });
        setForm(EMPTY);
        return;
      }
      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      setStatus({ kind: "error", message: data.error ?? "Could not send the message. Try again later." });
      triggerShake();
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
      triggerShake();
    }
  };

  const sending = status.kind === "sending";

  return (
    <Reveal className="av-about-contact">
      <div className="av-about-grid">
        <div>
          <div className="av-about-contact-kicker av-pixel av-neon-cyan">▸ CONTACT</div>
          <h2 className="av-about-contact-title">CONTACT US</h2>
          <p className="av-about-contact-sub">Got a suggestion, want to propose a game, or just want to say hi? Write to us.</p>
          <div className="av-about-tips">
            <div className="av-about-tip">
              <span className="av-about-tip-led" />
              REPLY IN 24-48H
            </div>
            <div className="av-about-tip">
              <span className="av-about-tip-led av-about-tip-led-y" />
              SUGGESTIONS WELCOME
            </div>
            <div className="av-about-tip">
              <span className="av-about-tip-led av-about-tip-led-m" />
              NO SPAM, EVER
            </div>
          </div>
        </div>

        <form className={cx("av-about-form", shake && "av-about-shake")} onSubmit={onSubmit} noValidate>
          <Input
            label="NAME"
            name="name"
            placeholder="px_kai"
            autoComplete="name"
            value={form.name}
            error={fieldErrors.name}
            disabled={sending}
            onChange={(e) => setField("name", e.target.value)}
          />
          <Input
            label="EMAIL"
            name="email"
            type="email"
            placeholder="player@vault.gg"
            autoComplete="email"
            value={form.email}
            error={fieldErrors.email}
            disabled={sending}
            onChange={(e) => setField("email", e.target.value)}
          />
          <div className={cx("av-field", fieldErrors.message && "av-field-error")}>
            <label className="av-field-label" htmlFor={messageId}>
              MESSAGE
            </label>
            <textarea
              id={messageId}
              name="message"
              className="av-about-textarea"
              rows={5}
              placeholder="Tell us what is on your mind…"
              value={form.message}
              disabled={sending}
              aria-invalid={fieldErrors.message ? true : undefined}
              aria-describedby={fieldErrors.message ? `${messageId}-error` : undefined}
              onChange={(e) => setField("message", e.target.value)}
            />
            {fieldErrors.message && (
              <div className="av-field-hint" id={`${messageId}-error`}>
                {fieldErrors.message}
              </div>
            )}
          </div>

          {/* Honeypot: hidden from people and screen readers. Bots fill it. */}
          <div className="av-about-honeypot" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {status.kind === "error" && (
            <div className="av-about-error" role="alert">
              <span className="av-about-error-tag">[ERR]</span> {status.message}
            </div>
          )}

          <Button type="submit" variant="outline" size="xl" block disabled={sending}>
            {sending ? "SENDING…" : "▶ SEND MESSAGE"}
          </Button>
        </form>
      </div>
    </Reveal>
  );
}
