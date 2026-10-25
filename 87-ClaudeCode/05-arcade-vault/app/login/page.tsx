import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "./auth-card";

export const metadata: Metadata = { title: "Sign in · Arcade Vault" };

export default function AccessPage() {
  return (
    <div className="av-container av-auth">
      {/* AuthCard reads ?error=confirm and ?next= through useSearchParams, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <AuthCard />
      </Suspense>
    </div>
  );
}
