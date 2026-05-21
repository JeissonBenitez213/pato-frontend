"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";

export default function MyProfilePage() {
  const [id, setId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no auth"))))
      .then((d) => setId(d.id))
      .catch(() => setError("No se pudo identificar tu usuario."));
  }, []);

  return (
    <AppShell>
      {error && <p style={{ color: "#ff8aa5" }}>{error}</p>}
      {id === null && !error && (
        <p style={{ color: "var(--text-dim)" }}>Cargando tu perfil…</p>
      )}
      {id !== null && <ProfileView userId={id} />}
    </AppShell>
  );
}
