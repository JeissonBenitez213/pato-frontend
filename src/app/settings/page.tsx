"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@apollo/client/react";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthContext";

import { api, fileUrl } from "@/lib/api";

import {
  FIND_ONE_USER_QUERY,
  GET_BADGES_QUERY,
  GET_PET_QUERY,
  UPDATE_USER_MUTATION,
  UPDATED_USER_SUBSCRIPTION,
} from "@/lib/queries";

import type { Badge, FullUser, Pet } from "@/lib/types";

type UpdatedUserSubscription = {
  updatedUser: {
    id_usuario: number;
    nombre_usuario: string;
    email: string;
    descripcion?: string | null;
    avatar?: string | null;
  };
};

export default function SettingsPage() {
  const { logout } = useAuth();

  const router = useRouter();

  const [sessionUserId, setSessionUserId] = useState<number | null>(null);

  const [profile, setProfile] = useState<FullUser | null>(null);

  const [badges, setBadges] = useState<Badge[]>([]);

  const [pet, setPet] = useState<Pet | null>(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre_usuario: "",
    email: "",
    descripcion: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState("");

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    api
      .me()
      .then((me) => {
        setSessionUserId(me.id);
      })
      .catch(console.error);

    api
      .getBadges()
      .then((d) => setBadges(d.getBadges ?? []))
      .catch(() => {});

    api
      .getPet()
      .then((d) => setPet(d.getPet))
      .catch(() => {});
  }, []);

  /* ---------------- PROFILE ---------------- */

  useEffect(() => {
    if (!sessionUserId) return;

    api
      .gql<{ findOneUser: FullUser }>(FIND_ONE_USER_QUERY, {
        id_user: Number(sessionUserId),
      })
      .then((d) => {
        const profileData = d.findOneUser;

        setProfile(profileData);

        setForm({
          nombre_usuario: profileData.nombre_usuario ?? "",

          email: profileData.email ?? "",

          descripcion: profileData.descripcion ?? "",
        });

        setAvatarPreview(fileUrl(profileData.avatar) || "");
      })
      .catch(console.error);
  }, [sessionUserId]);

  /* ---------------- SUBSCRIPTION ---------------- */

  useSubscription<UpdatedUserSubscription>(UPDATED_USER_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updatedUser = data.data?.updatedUser;

      if (!updatedUser) return;

      if (updatedUser.id_usuario === profile?.id_usuario) {
        setForm({
          nombre_usuario: updatedUser.nombre_usuario ?? "",

          email: updatedUser.email ?? "",

          descripcion: updatedUser.descripcion ?? "",
        });

        setAvatarPreview(fileUrl(updatedUser.avatar) || "");

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...updatedUser,
              }
            : prev,
        );
      }
    },
  });

  /* ---------------- UPDATE USER ---------------- */

  async function onUpdateUser() {
    try {
      setLoading(true);

      let avatarPath: string | undefined;

      // subir avatar primero
      if (avatarFile) {
        const uploaded = await api.uploadFiles([avatarFile]);

        avatarPath = uploaded?.[0]?.path;

        if (!avatarPath) {
          throw new Error("No se pudo subir el avatar");
        }
      }

      await api.gql(UPDATE_USER_MUTATION, {
        input: {
          nombre_usuario: form.nombre_usuario,

          email: form.email,

          descripcion: form.descripcion,

          ...(avatarPath && {
            avatar: avatarPath,
          }),
        },
      });

      setAvatarFile(null);

      alert("Perfil actualizado");
    } catch (error) {
      console.error(error);

      alert("Error actualizando perfil");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- LOGOUT ---------------- */

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
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          margin: "6px 0 8px",
        }}
      >
        Ajustes
      </h1>

      {/* PROFILE */}

      <h2 style={sectionTitle}>Perfil</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <img
            src={avatarPreview || "https://placehold.co/120x120?text=Avatar"}
            alt="avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--accent)",
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              setAvatarFile(file);

              setAvatarPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        <input
          value={form.nombre_usuario}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              nombre_usuario: e.target.value,
            }))
          }
          placeholder="Nombre de usuario"
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        />

        <input
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          placeholder="Correo"
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        />

        <textarea
          value={form.descripcion}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              descripcion: e.target.value,
            }))
          }
          placeholder="Descripción"
          rows={4}
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            resize: "vertical",
          }}
        />

        <button
          disabled={loading}
          onClick={onUpdateUser}
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            border: "none",
            background: "var(--accent)",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* PET */}

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

          <p
            style={{
              color: "var(--text-dim)",
              margin: "8px 0 0",
            }}
          >
            Nivel {pet.nivel_actual} · {pet.puntos_experiencia} XP
          </p>
        </div>
      )}

      {/* BADGES */}

      <h2 style={sectionTitle}>Insignias disponibles</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {badges.length === 0 && (
          <span
            style={{
              color: "var(--text-faint)",
            }}
          >
            Sin insignias.
          </span>
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

      {/* SESSION */}

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
