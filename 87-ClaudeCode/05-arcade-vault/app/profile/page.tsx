import type { Metadata } from "next";
import { ProfileCard } from "./profile-card";

export const metadata: Metadata = { title: "Profile · Arcade Vault" };

export default function ProfilePage() {
  return (
    <div className="av-container av-auth">
      <ProfileCard />
    </div>
  );
}
