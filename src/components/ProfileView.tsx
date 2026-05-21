"use client";

import { useEffect, useMemo, useState } from "react";
import PostCard from "./PostCard";
import { gql, fileUrl } from "@/lib/api";
import { FIND_ONE_USER_QUERY, TOGGLE_FOLLOW_MUTATION } from "@/lib/queries";
import type { FullUser } from "@/lib/types";

export default function ProfileView({ userId }: { userId: number }) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    gql<{ findOneUser: FullUser }>(FIND_ONE_USER_QUERY, {
      id_user: userId,
    })
      .then((d) => setUser(d.findOneUser))
      .catch((e) => setError(e.message));
  }, [userId]);

  async function toggleFollow() {
    setFollowing((v) => !v);
    try {
      await gql(TOGGLE_FOLLOW_MUTATION, { id_user: userId });
    } catch {
      setFollowing((v) => !v); // revertir
    }
  }

  const posts = useMemo(() => {
    const list = user?.posts ?? [];
    if (!dateFilter) return list;
    return list.filter((p) =>
      p.fecha_publicacion?.startsWith(dateFilter),
    );
  }, [user, dateFilter]);

  if (error)
    return <p style={{ color: "#ff8aa5" }}>No se pudo cargar el perfil: {error}</p>;
  if (!user) return <p style={{ color: "var(--text-dim)" }}>Cargando perfil…</p>;

  const avatar = fileUrl(user.avatar) ?? user.avatar;

  return (
    <div className="fade-up">
      {/* tarjeta de perfil con banner */}
      <div
        style={{
          position: "relative",
          borderRadius: 22,
          overflow: "hidden",
          border: "2px solid var(--accent)",
          boxShadow: "0 0 24px var(--accent-glow)",
          marginBottom: 24,
        }}
      >
        {/* banner */}
        <div
          style={{
            height: 150,
            background:
              "linear-gradient(120deg, #5a1242, #2a0a20), radial-gradient(circle at 70% 30%, rgba(177,76,255,0.4), transparent)",
          }}
        />
        <div style={{ padding: "0 22px 22px", background: "var(--surface)" }}>
          {/* avatar con anillo de stories */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              padding: 4,
              marginTop: -55,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              boxShadow: "0 0 18px var(--accent-glow)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={user.nombre_usuario}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--surface)",
              }}
            />
          </div>

          {/* nombre + indicadores online / reputacion */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              {user.nombre_usuario}
            </h1>
            <span
              title="En línea"
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#4cff9c",
                boxShadow: "0 0 8px #4cff9c",
              }}
            />
            {user.is_admin && (
              <span
                title="Insignia de reputación"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ffd34c",
                  boxShadow: "0 0 8px #ffd34c",
                }}
              />
            )}
          </div>

          {user.descripcion && (
            <p style={{ color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
              {user.descripcion}
            </p>
          )}

          {/* stats seguidores / siguiendo */}
          <div style={{ display: "flex", gap: 22, marginTop: 12, color: "var(--text-dim)", fontSize: 14 }}>
            <span><strong style={{ color: "var(--text)" }}>{user.seguidores?.length ?? 0}</strong> seguidores</span>
            <span><strong style={{ color: "var(--text)" }}>{user.siguiendo?.length ?? 0}</strong> siguiendo</span>
          </div>

          {/* insignias / stack */}
          {user.insignias && user.insignias.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {user.insignias.map((bu) => (
                <span
                  key={bu.id_insignia}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    background: "rgba(124,92,255,0.15)",
                    border: "1px solid rgba(124,92,255,0.4)",
                    fontSize: 12,
                  }}
                >
                  {bu.insignia.icono ? `${bu.insignia.icono} ` : ""}
                  {bu.insignia.nombre}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={toggleFollow}
            style={{
              marginTop: 18,
              padding: "11px 30px",
              borderRadius: 999,
              border: "none",
              fontWeight: 700,
              color: "#fff",
              background: following
                ? "rgba(124,92,255,0.25)"
                : "linear-gradient(90deg, var(--accent), var(--accent-2))",
              boxShadow: following ? "none" : "0 0 18px var(--accent-glow)",
            }}
          >
            {following ? "Siguiendo" : "Follow"}
          </button>
        </div>
      </div>

      {/* filtro de fechas de proyectos */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Proyectos</h2>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          title="Filtrar por fecha (DD/MM/AAAA)"
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(12,5,10,0.6)",
            border: "1px solid rgba(124,92,255,0.4)",
            color: "var(--text)",
            colorScheme: "dark",
          }}
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-2)",
              fontSize: 13,
            }}
          >
            limpiar
          </button>
        )}
      </div>

      {posts.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>
          {dateFilter ? "Sin proyectos en esa fecha." : "Aún no hay proyectos."}
        </p>
      )}

      {posts.map((p) => (
        <PostCard
          key={p.id_post}
          post={{ ...p, usuario: user }}
        />
      ))}
    </div>
  );
}
