// SPEC 17. Where to go after sign-in when the login page has `?next=`. An open redirect on a login page is a
// phishing risk, so only a same-origin relative path passes: one leading `/`, no `//`, no `\`, no scheme,
// no control characters or spaces (browsers strip tabs and newlines, so `/\t/evil.example` would escape).
export const DEFAULT_NEXT = "/library";

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return DEFAULT_NEXT;
  if (value.includes("//") || value.includes("\\")) return DEFAULT_NEXT;
  if (/[\s\u0000-\u001f\u007f]/.test(value)) return DEFAULT_NEXT;
  return value;
}
