"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthContext";
import { gql } from "@/lib/api";
import { GET_BADGES_QUERY, GET_PET_QUERY } from "@/lib/queries";
import type { Badge, Pet } from "@/lib/types";

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    gql<{ getBadges: Badge[] }>(GET_BADGES_QUERY)
      .then((d) => setBadges(d.getBadges ?? []))
      .catch(() => {});
    gql<{ getPet: Pet }>(GET_PET_QUERY)
      .then((d) => setPet(d.getPet))
      .catch(() => {});
  }, []);

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  const sectionTitle = {
    fontSize: 16,
    fontWeight: 700,
    margin: "26px 0 12px",
    color: "var(--text)",
  } as const;

  return (
    <AppShell>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 8px" }}>
        Ajustes
      </h1>

      {pet && (
        <div
          style={{
            marginTop: 18,
            borderRadius: 18,
            padding: 18,
            border: "2px solid var(--accent)",
            background:
              "linear-gradient(135deg, var(--surface-grad-a), var(--surface-grad-b))",
            boxShadow: "0 0 18px var(--accent-glow)",
          }}
        >
          <strong>Tu mascota 🐤</strong>
          <p style={{ color: "var(--text-dim)", margin: "8px 0 0" }}>
            Nivel {pet.nivel_actual} · {pet.puntos_experiencia} XP
          </p>
        </div>
      )}

      <h2 style={sectionTitle}>Insignias disponibles</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {badges.length === 0 && (
          <span style={{ color: "var(--text-faint)" }}>Sin insignias.</span>
        )}
        {badges.map((b) => (
          <span
            key={b.id_insignia}
            title={b.descripcion ?? ""}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid rgba(124,92,255,0.45)",
              background: "rgba(124,92,255,0.12)",
              fontSize: 13,
            }}
          >
            {b.icono ? `${b.icono} ` : ""}
            {b.nombre}
          </span>
        ))}
      </div>

      <h2 style={sectionTitle}>Sesión</h2>
      <button
        onClick={onLogout}
        style={{
          padding: "12px 24px",
          borderRadius: 999,
          border: "2px solid rgba(255,90,120,0.5)",
          background: "rgba(255,90,120,0.1)",
          color: "#ff9bb0",
          fontWeight: 700,
        }}
      >
        Cerrar sesión
      </button>
    </AppShell>
  );
}
