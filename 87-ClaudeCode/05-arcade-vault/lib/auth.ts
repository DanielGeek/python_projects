// Account forms: validation here is pure so the forms and the tests share it. Supabase is the authority.

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
