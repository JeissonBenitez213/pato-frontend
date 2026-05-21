"use client";

import { use } from "react";
import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";

export default function ProfileByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AppShell>
      <ProfileView userId={Number(id)} />
    </AppShell>
  );
}
