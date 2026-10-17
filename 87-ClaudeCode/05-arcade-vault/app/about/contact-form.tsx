"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/basics";
import { Input } from "@/components/ui/interactive";
import { Reveal } from "../_home/reveal";

export function ContactSection() {
  const messageId = useId();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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

        <form className="av-about-form" onSubmit={onSubmit} noValidate>
          <Input label="NAME" name="name" placeholder="px_kai" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="EMAIL" name="email" type="email" placeholder="player@vault.gg" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="av-field">
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
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button type="submit" variant="outline" size="xl" block>
            ▶ SEND MESSAGE
          </Button>
        </form>
      </div>
    </Reveal>
  );
}
