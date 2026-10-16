"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, NeonLogo } from "@/components/ui/basics";
import { Input, Tabs } from "@/components/ui/interactive";
import { playAsGuest, signIn } from "@/lib/session";

type Mode = "login" | "register";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const user = String(data.get("username") ?? "").trim();
    const pass = String(data.get("password") ?? "");
    const mail = String(data.get("email") ?? "").trim();
    const next: Record<string, string> = {};
    if (!/^[A-Za-z0-9_]{3,12}$/.test(user)) next.username = "Use 3 to 12 letters, numbers or underscores.";
    if (pass.length < 8) next.password = "Password must be at least 8 characters.";
    if (mode === "register" && !/^\S+@\S+\.\S+$/.test(mail)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    // BACKEND: send the credentials to the real auth provider here; the password is never stored locally.
    signIn(user);
    router.push("/library");
  }

  function social(provider: string) {
    // BACKEND: start the OAuth flow (e.g. Supabase signInWithOAuth) for this provider.
    setNotice(`Sign-in with ${provider} will be available once the server is connected.`);
  }

  return (
    <div className="av-auth-card">
      <NeonLogo size="md" className="av-auth-logo" />
      <p className="av-auth-sub">SYSTEM ACCESS · v2.6</p>
      <Tabs
        fill
        label="Account"
        value={mode}
        onChange={(id) => {
          setMode(id as Mode);
          setErrors({});
        }}
        tabs={[
          { id: "login", label: "Sign in" },
          { id: "register", label: "Create account" },
        ]}
      />
      <form className="av-auth-form" onSubmit={submit} noValidate>
        <Input name="username" label="Username" placeholder="your_username" autoComplete="username" error={errors.username} />
        {mode === "register" && (
          <Input name="email" type="email" label="Email" placeholder="player@example.com" autoComplete="email" error={errors.email} />
        )}
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={errors.password}
        />
        <Button type="submit" block>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="av-auth-divider">
        <span>OR CONTINUE WITH</span>
      </div>
      <div className="av-auth-social">
        <Button variant="outline" size="sm" onClick={() => social("Google")}>
          Google
        </Button>
        <Button variant="outline" size="sm" onClick={() => social("GitHub")}>
          GitHub
        </Button>
      </div>
      {notice && (
        <p className="av-modal-note" role="status">
          {notice}
        </p>
      )}
      <Button
        variant="ghost"
        block
        onClick={() => {
          playAsGuest();
          router.push("/library");
        }}
      >
        Play as guest
      </Button>
      <p className="av-auth-caption">Without an account, your scores are saved on this device only.</p>
      <p className="av-auth-terms">BY ENTERING YOU ACCEPT THE ARCADE TERMS</p>
    </div>
  );
}
