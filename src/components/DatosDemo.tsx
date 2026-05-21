"use client";

import { useEffect, useState } from "react";
import { gql } from "@/lib/api";
import { GET_BADGES_QUERY } from "@/lib/queries";
import type { Badge } from "@/lib/types";

export default function DatosDemo() {
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    setLoading(true);
    try {
      const result = await gql<{ getBadges: Badge[] }>(GET_BADGES_QUERY);
      setBadges(result.getBadges ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando insignias");
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        background: "rgba(20,20,30,0.88)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22 }}>Conexión backend</h2>
      <p style={{ color: "#c7c7d1", margin: "10px 0 18px" }}>
        Ejemplo de consulta GraphQL al backend usando `src/lib/api.ts`.
      </p>

      {error && (
        <p style={{ color: "#ff8aa5", margin: "0 0 16px" }}>{error}</p>
      )}

      <button
        type="button"
        onClick={fetchBadges}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #555",
          background: "transparent",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Recargar insignias
      </button>

      <div style={{ marginTop: 22 }}>
        {loading ? (
          <p style={{ color: "var(--text-dim)" }}>Cargando insignias…</p>
        ) : badges && badges.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {badges.map((badge) => (
              <li
                key={badge.id_insignia}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <strong>{badge.nombre}</strong>
                {badge.descripcion ? <p style={{ margin: "8px 0 0", color: "#c7c7d1" }}>{badge.descripcion}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-dim)", margin: 0 }}>No hay insignias disponibles.</p>
        )}
      </div>
    </section>
  );
}
