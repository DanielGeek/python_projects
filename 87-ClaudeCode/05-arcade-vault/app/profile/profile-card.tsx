"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, NeonLogo } from "@/components/ui/basics";
import { signOut, useSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/client";

type Status = { kind: "loading" } | { kind: "none" } | { kind: "ready"; email: string };

// SPEC 17. The proxy already keeps visitors and guests out of /profile, but it only makes optimistic checks.
// This asks Supabase Auth, which validates the session on the server, so the page does not depend on the proxy.
export function ProfileCard() {
  const router = useRouter();
  const session = useSession();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let alive = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (alive)
          setStatus(data.user ? { kind: "ready", email: data.user.email ?? "" } : { kind: "none" });
      })
      .catch((error) => {
        console.error("[profile] could not read the user", error);
        if (alive) setStatus({ kind: "none" });
      });
    return () => {
      alive = false;
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  }

  if (status.kind === "none") {
    return (
      <div className="av-auth-card">
        <NeonLogo size="md" className="av-auth-logo" />
        <p className="av-auth-sub">PROFILE</p>
        <p className="av-modal-note" role="status">
          Sign in with an account to see your profile.
        </p>
        <ButtonLink href="/login?next=%2Fprofile" variant="outline" block>
          Sign in
        </ButtonLink>
      </div>
    );
  }

  const ready = status.kind === "ready";
  return (
    <div className="av-auth-card">
      <NeonLogo size="md" className="av-auth-logo" />
      <p className="av-auth-sub">PROFILE</p>
      <dl className="av-profile-list" aria-busy={!ready}>
        <div className="av-profile-row">
          <dt>USERNAME</dt>
          <dd>{session && !session.guest ? session.name : "…"}</dd>
        </div>
        <div className="av-profile-row">
          <dt>EMAIL</dt>
          <dd>{ready ? status.email : "…"}</dd>
        </div>
      </dl>
      <Button variant="outline" block disabled={!ready || signingOut} onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
