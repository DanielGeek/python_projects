import { Resend } from "resend";
import { validateContact, type ContactInput } from "@/lib/contact";

function fail(status: number, error: string, fieldErrors?: ReturnType<typeof validateContact>) {
  return Response.json({ ok: false, error, ...(fieldErrors && { fieldErrors }) }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid JSON.");
  }
  if (typeof body !== "object" || body === null) return fail(400, "Invalid JSON.");
  const raw = body as Record<string, unknown>;

  // Honeypot: bots fill the hidden field. Answer success so they get no signal.
  if (text(raw.website).trim() !== "") return Response.json({ ok: true });

  const input: ContactInput = {
    name: text(raw.name).trim(),
    email: text(raw.email).trim(),
    message: text(raw.message).trim(),
  };
  const fieldErrors = validateContact(input);
  if (Object.keys(fieldErrors).length > 0) return fail(400, "Check the highlighted fields.", fieldErrors);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error("[contact] RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL is not set.");
    return fail(500, "Message service is not configured.");
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: input.email,
      subject: `[Arcade Vault] Message from ${input.name.replace(/[\r\n]+/g, " ")}`,
      text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return fail(502, "Could not send the message. Try again later.");
    }
  } catch (err) {
    console.error("[contact] Resend request failed:", err);
    return fail(502, "Could not send the message. Try again later.");
  }

  return Response.json({ ok: true });
}
