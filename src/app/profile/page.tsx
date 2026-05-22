"use client";

import { useEffect, useState } from "react";

import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";

import { gql } from "@/lib/api";

export default function MyProfilePage() {
  const [id, setId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gql(`
      query {
        getMyData {
          id_usuario
          nombre_usuario
        }
      }
    `)
      .then((data) => {
        setId(data.getMyData.id_usuario);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <AppShell>
        {error && (
          <p style={{ color: "#ff8aa5" }}>
            No se pudo cargar el perfil: {error}
          </p>
        )}

        {id === null && !error && (
          <p style={{ color: "var(--text-dim)" }}>Cargando tu perfil…</p>
        )}

        {id !== null && <ProfileView userId={id} />}
      </AppShell>
    </div>
  );
}
