// Account forms: validation here is pure so the forms and the tests share it. Supabase is the authority.
// The wrappers below talk to Supabase Auth from the browser and never throw.
import { createClient } from "./supabase/client";

export const LIMITS = { email: 254, passwordMin: 8, passwordMax: 72 } as const;

export type AuthField = "username" | "email" | "password";

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

// Same shape as the `profiles_username_format` check; GUEST is reserved for guests.
const USERNAME_RE = /^[A-Za-z0-9_]{3,12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<AuthField, string>>;

function checkEmail(raw: string): string | undefined {
  const email = raw.trim();
  if (!email) return "Email is required.";
  if (email.length > LIMITS.email) return `Max ${LIMITS.email} characters.`;
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
}

/** Trims username and email; returns per-field errors, an empty object means valid. */
export function validateSignUp(input: SignUpInput): Errors {
  const errors: Errors = {};
  const username = input.username.trim();
  if (!USERNAME_RE.test(username)) errors.username = "Use 3 to 12 letters, numbers or underscores.";
  else if (username.toUpperCase() === "GUEST") errors.username = "That username is reserved.";

  const email = checkEmail(input.email);
  if (email) errors.email = email;

  if (input.password.length < LIMITS.passwordMin)
    errors.password = `Password must be at least ${LIMITS.passwordMin} characters.`;
  else if (input.password.length > LIMITS.passwordMax)
    errors.password = `Max ${LIMITS.passwordMax} characters.`;
  return errors;
}

/** Sign-in only checks that both fields are filled, so a wrong password never reveals a rule. */
export function validateSignIn(input: SignInInput): Errors {
  const errors: Errors = {};
  const email = checkEmail(input.email);
  if (email) errors.email = email;
  if (!input.password) errors.password = "Password is required.";
  return errors;
}

export type AuthFailure =
  "username_taken" | "invalid_credentials" | "email_not_confirmed" | "network" | "unknown";

export type AuthResult = { ok: true } | { ok: false; code: AuthFailure };

/** Maps a Supabase auth error to a code the forms can show. Anything unexpected is "unknown". */
export function toAuthFailure(error: {
  code?: string;
  message?: string;
  name?: string;
}): AuthFailure {
  switch (error.code) {
    case "invalid_credentials":
      return "invalid_credentials";
    case "email_not_confirmed":
      return "email_not_confirmed";
  }
  if (
    error.name === "AuthRetryableFetchError" ||
    /failed to fetch|network/i.test(error.message ?? "")
  )
    return "network";
  return "unknown";
}

function fail(label: string, error: unknown): AuthResult {
  console.error(`[auth] ${label} failed`, error);
  const e = (error ?? {}) as { code?: string; message?: string; name?: string };
  return { ok: false, code: toAuthFailure(e) };
}

/**
 * Creates the account. The profile row comes from a database trigger that reads `username` from the
 * metadata. The account stays unconfirmed until the email link is opened, so there is no session yet.
 */
export async function signUpWithEmail(input: SignUpInput): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const username = input.username.trim().toUpperCase();
    const free = await supabase.rpc("username_available", { name: username });
    if (free.error) return fail("username check", free.error);
    if (free.data === false) return { ok: false, code: "username_taken" };

    const { error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    return error ? fail("sign-up", error) : { ok: true };
  } catch (error) {
    return fail("sign-up", error);
  }
}

export async function signInWithEmail(input: SignInInput): Promise<AuthResult> {
  try {
    const { error } = await createClient().auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    return error ? fail("sign-in", error) : { ok: true };
  } catch (error) {
    return fail("sign-in", error);
  }
}

/** Sends the confirmation email again. */
export async function resendConfirmation(email: string): Promise<AuthResult> {
  try {
    const { error } = await createClient().auth.resend({ type: "signup", email: email.trim() });
    return error ? fail("resend confirmation", error) : { ok: true };
  } catch (error) {
    return fail("resend confirmation", error);
  }
}

/** Ends the Supabase session in this browser. */
export async function signOutEverywhere(): Promise<AuthResult> {
  try {
    const { error } = await createClient().auth.signOut();
    return error ? fail("sign-out", error) : { ok: true };
  } catch (error) {
    return fail("sign-out", error);
  }
}
