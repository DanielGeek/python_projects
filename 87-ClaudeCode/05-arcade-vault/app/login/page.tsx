import type { Metadata } from "next";
import { AuthCard } from "./auth-card";

export const metadata: Metadata = { title: "Iniciar sesión · Arcade Vault" };

export default function AccessPage() {
  return (
    <div className="av-container av-auth">
      <AuthCard />
    </div>
  );
}
