// Shared by the contact form (browser) and POST /api/contact (server). Pure functions only.

export const LIMITS = { name: 80, email: 254, message: 2000 } as const;

export type ContactField = "name" | "email" | "message";

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims the values and returns per-field errors; an empty object means valid. */
export function validateContact(input: ContactInput): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = "Name is required.";
  else if (name.length > LIMITS.name) errors.name = `Max ${LIMITS.name} characters.`;

  if (!email) errors.email = "Email is required.";
  else if (email.length > LIMITS.email) errors.email = `Max ${LIMITS.email} characters.`;
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email.";

  if (!message) errors.message = "Message is required.";
  else if (message.length > LIMITS.message) errors.message = `Max ${LIMITS.message} characters.`;

  return errors;
}
