import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Reset password · Arcade Vault" };

// SPEC 16. The recovery email link goes through /auth/confirm (type=recovery), which opens a session and
// sends the player here. The form checks that session on the client before it shows the password fields.
export default function ResetPage() {
  return (
    <div className="av-container av-auth">
      <ResetForm />
    </div>
  );
}
