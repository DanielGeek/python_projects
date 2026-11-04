"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, NeonLogo } from "@/components/ui/basics";
import { Input } from "@/components/ui/interactive";
import {
  LIMITS,
  PASSWORD_RULE,
  updatePassword,
  validateNewPassword,
  type AuthField,
  type AuthFailure,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "none";

const FAILURE_MESSAGES: Record<Exclude<AuthFailure, "username_taken">, string> = {
  invalid_credentials: "Could not change the password. Request a new link.",
  email_not_confirmed: "Could not change the password. Request a new link.",
  network: "Could not reach the server. Try again.",
  unknown: "Could not change the password. Try a different one or request a new link.",
};

/** Reads the session the recovery link opened. No session means no `updateUser` call at all. */
async function hasSession(): Promise<boolean> {
  try {
    const { data, error } = await createClient().auth.getUser();
    return !error && data.user !== null;
  } catch {
    return false;
  }
}

export function ResetForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [errors, setErrors] = useState<Partial<Record<AuthField, string>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    hasSession().then((found) => {
      if (active) setStatus(found ? "ready" : "none");
    });
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || status !== "ready") return;
    const data = new FormData(e.currentTarget);
    const input = {
      password: String(data.get("password") ?? ""),
      repeat: String(data.get("repeat") ?? ""),
    };
    const found = validateNewPassword(input);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    const result = await updatePassword(input.password);
    if (result.ok) {
      router.push("/library"); // /library is not behind proxy.ts, so a soft navigation is enough
      return;
    }
    setBusy(false);
    if (result.code !== "username_taken") setFormError(FAILURE_MESSAGES[result.code]);
  }

  if (status === "checking") {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">RESET PASSWORD</p>
        <p className="av-modal-note" role="status">
          Checking your link…
        </p>
      </div>
    );
  }

  if (status === "none") {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">RESET PASSWORD</p>
        <div className="av-about-error" role="alert">
          <span className="av-about-error-tag">[ERR]</span> This reset link is invalid or expired.
          Request a new one from the sign-in page.
        </div>
        <ButtonLink href="/login" variant="outline" block>
          Back to sign in
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="av-auth-card">
      <NeonLogo size="md" className="av-auth-logo" />
      <p className="av-auth-sub">CHOOSE A NEW PASSWORD</p>
      <form className="av-auth-form" onSubmit={submit} noValidate>
        <Input
          name="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          hint={`${LIMITS.passwordMin} to ${LIMITS.passwordMax} characters. ${PASSWORD_RULE}`}
          error={errors.password}
        />
        <Input
          name="repeat"
          type="password"
          label="Repeat password"
          autoComplete="new-password"
          error={errors.repeat}
        />
        {formError && (
          <div className="av-about-error" role="alert">
            <span className="av-about-error-tag">[ERR]</span> {formError}
          </div>
        )}
        <Button type="submit" block disabled={busy}>
          {busy ? "Please wait…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
