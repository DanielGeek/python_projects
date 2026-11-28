import { notFound } from "next/navigation";
import { mockChildProfiles } from "@/lib/mock-children";
import ChildProfileContent from "./page-content";

export const instant = false;

type ChildProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChildProfilePage({
  params,
}: ChildProfilePageProps) {
  const { id } = await params;
  const profile = mockChildProfiles[id];

  if (!profile) {
    notFound();
  }

  return <ChildProfileContent profile={profile} />;
}
