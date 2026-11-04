"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, NeonLogo } from "@/components/ui/basics";
import { Input, Tabs } from "@/components/ui/interactive";
import {
  LIMITS,
  PASSWORD_RULE,
  requestPasswordReset,
  resendConfirmation,
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
  validateResetRequest,
  validateSignIn,
  validateSignUp,
  type AuthFailure,
  type AuthField,
  type OAuthProvider,
} from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { useSession } from "@/lib/session";

type Mode = "login" | "register";

// Leaving the login page is a full page load, not router.push. When a visitor reaches this page through a
// soft navigation, the router caches the proxy's redirect for the protected path, and a soft push after
// signing in would reuse it and land on the login again. A full load asks the proxy again, with the new cookies.
const LEFT_KEY = "arcade-vault:left-login";
function leave(path: string) {
  try {
    sessionStorage.setItem(LEFT_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the loop guard below is then off, and the proxy answers the same either way.
  }
  window.location.assign(path);
}

/** True when the page was left a moment ago: the proxy sent the user back, so do not leave again. */
function leftJustNow(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(LEFT_KEY) ?? 0) < 5000;
  } catch {
    return false;
  }
}

const FAILURE_MESSAGES: Record<Exclude<AuthFailure, "username_taken">, string> = {
  invalid_credentials: "Wrong email or password.",
  email_not_confirmed: "Confirm your email first. Check your inbox for the link.",
  network: "Could not reach the server. Try again.",
  unknown: "Something went wrong. Try again.",
};

const CONFIRM_LINK_MESSAGE =
  "That confirmation link is invalid or expired. Sign in to get a new one.";
const OAUTH_ERROR_MESSAGE = "Sign-in with Google or GitHub did not finish. Try again.";

/** Message for the `?error=` the confirm and callback routes send back to the login page. */
function messageForError(code: string | null): string {
  if (code === "confirm") return CONFIRM_LINK_MESSAGE;
  if (code === "oauth") return OAUTH_ERROR_MESSAGE;
  return "";
}

export function AuthCard() {
  const params = useSearchParams();
  // Where to go after signing in or playing as a guest. Only a same-origin path passes (SPEC 17).
  const next = safeNextPath(params.get("next"));
  // An account that is already signed in has nothing to do here. A guest may still want to sign in.
  const session = useSession();
  const account = session && !session.guest ? session : null;
  const signedIn = account !== null;
  useEffect(() => {
    if (signedIn && !leftJustNow()) leave(next);
  }, [signedIn, next]);
  const [mode, setMode] = useState<Mode>("login");
  const [errors, setErrors] = useState<Partial<Record<AuthField, string>>>({});
  const [formError, setFormError] = useState(messageForError(params.get("error")));
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  // SPEC 16, "Forgot password?": `forgot` shows the email-only form, `resetSentTo` the confirmation.
  const [forgot, setForgot] = useState(false);
  const [resetSentTo, setResetSentTo] = useState("");

  function reset(next: Mode) {
    setMode(next);
    setErrors({});
    setFormError("");
    setNeedsConfirm(false);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const input = {
      username: String(data.get("username") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const found = mode === "login" ? validateSignIn(input) : validateSignUp(input);
    setErrors(found);
    setFormError("");
    setNeedsConfirm(false);
    if (Object.keys(found).length) return;

    setBusy(true);
    const result = mode === "login" ? await signInWithEmail(input) : await signUpWithEmail(input);
    setBusy(false);
    if (result.ok) {
      if (mode === "login") leave(next);
      else setSentTo(input.email.trim());
      return;
    }
    if (result.code === "username_taken") setErrors({ username: "Username taken." });
    else {
      setFormError(FAILURE_MESSAGES[result.code]);
      setNeedsConfirm(result.code === "email_not_confirmed");
    }
  }

  async function resend(address: string) {
    if (busy) return;
    setBusy(true);
    const result = await resendConfirmation(address);
    setBusy(false);
    if (result.ok) {
      setResent(true);
      setFormError("");
    } else if (result.code !== "username_taken") setFormError(FAILURE_MESSAGES[result.code]);
  }

  async function submitReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const address = String(new FormData(e.currentTarget).get("email") ?? "");
    const found = validateResetRequest({ email: address });
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    const result = await requestPasswordReset(address);
    setBusy(false);
    // Same screen whether or not the email has an account: it must not reveal which ones do.
    if (result.ok) setResetSentTo(address.trim());
    else if (result.code !== "username_taken") setFormError(FAILURE_MESSAGES[result.code]);
  }

  function backToSignIn() {
    setForgot(false);
    setResetSentTo("");
    reset("login");
  }

  // On success the browser leaves for the provider, so `busy` stays on until the page unloads.
  async function social(provider: OAuthProvider) {
    if (busy) return;
    setBusy(true);
    setFormError("");
    setNeedsConfirm(false);
    const result = await signInWithProvider(provider);
    if (!result.ok && result.code !== "username_taken") {
      setBusy(false);
      setFormError(FAILURE_MESSAGES[result.code]);
    }
  }

  if (account) {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">SIGNED IN</p>
        <p className="av-modal-note" role="status">
          You are signed in as {account.name}.
        </p>
        <Button variant="outline" block onClick={() => leave(next)}>
          Continue
        </Button>
      </div>
    );
  }

  if (sentTo) {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">CHECK YOUR EMAIL</p>
        <p className="av-modal-note" role="status">
          We sent a confirmation link to {sentTo}. Open it to finish creating your account.
        </p>
        {resent && (
          <p className="av-modal-note" role="status">
            Sent again.
          </p>
        )}
        {formError && (
          <div className="av-about-error" role="alert">
            <span className="av-about-error-tag">[ERR]</span> {formError}
          </div>
        )}
        <Button variant="outline" block disabled={busy} onClick={() => resend(sentTo)}>
          Resend confirmation
        </Button>
        <Button
          variant="ghost"
          block
          onClick={() => {
            setSentTo("");
            setResent(false);
            reset("login");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  if (forgot) {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">{resetSentTo ? "CHECK YOUR EMAIL" : "RESET PASSWORD"}</p>
        {resetSentTo ? (
          <p className="av-modal-note" role="status">
            If an account exists for {resetSentTo}, we sent a link to reset the password. Check your
            inbox.
          </p>
        ) : (
          <form className="av-auth-form" onSubmit={submitReset} noValidate>
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="player@example.com"
              autoComplete="email"
              error={errors.email}
            />
            {formError && (
              <div className="av-about-error" role="alert">
                <span className="av-about-error-tag">[ERR]</span> {formError}
              </div>
            )}
            <Button type="submit" block disabled={busy}>
              {busy ? "Please wait…" : "Send reset link"}
            </Button>
          </form>
        )}
        <Button variant="ghost" block onClick={backToSignIn}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="av-auth-card">
      <NeonLogo size="md" className="av-auth-logo" />
      <p className="av-auth-sub">SYSTEM ACCESS · v2.6</p>
      <Tabs
        fill
        label="Account"
        value={mode}
        onChange={(id) => reset(id as Mode)}
        tabs={[
          { id: "login", label: "Sign in" },
          { id: "register", label: "Create account" },
        ]}
      />
      <form className="av-auth-form" onSubmit={submit} noValidate>
        {mode === "register" && (
          <Input
            name="username"
            label="Username"
            placeholder="your_username"
            autoComplete="username"
            error={errors.username}
          />
        )}
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="player@example.com"
          autoComplete="email"
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          hint={
            mode === "register"
              ? `${LIMITS.passwordMin} to ${LIMITS.passwordMax} characters. ${PASSWORD_RULE}`
              : undefined
          }
          error={errors.password}
        />
        {mode === "login" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setForgot(true);
              setErrors({});
              setFormError("");
              setNeedsConfirm(false);
            }}
          >
            Forgot password?
          </Button>
        )}
        {formError && (
          <div className="av-about-error" role="alert">
            <span className="av-about-error-tag">[ERR]</span> {formError}
          </div>
        )}
        {resent && (
          <p className="av-modal-note" role="status">
            Confirmation sent again. Check your inbox.
          </p>
        )}
        {needsConfirm && (
          <Button
            type="button"
            variant="outline"
            block
            disabled={busy}
            onClick={() => resend(email.trim())}
          >
            Resend confirmation
          </Button>
        )}
        <Button type="submit" block disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="av-auth-divider">
        <span>OR CONTINUE WITH</span>
      </div>
      <div className="av-auth-social">
        <Button variant="outline" size="sm" disabled={busy} onClick={() => social("google")}>
          Google
        </Button>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => social("github")}>
          GitHub
        </Button>
      </div>
      <p className="av-auth-terms">BY ENTERING YOU ACCEPT THE ARCADE TERMS</p>
    </div>
  );
}
