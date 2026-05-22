"use client";

import { useEffect, useMemo, useState } from "react";
import PostCard from "./PostCard";
import { gql, fileUrl } from "@/lib/api";
import {
  FIND_ONE_USER_QUERY,
  GET_PET_QUERY,
  TOGGLE_FOLLOW_MUTATION,
} from "@/lib/queries";
import type { FullUser, Pet } from "@/lib/types";

export default function ProfileView({ userId }: { userId: number }) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [petError, setPetError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    setUser(null);
    setError(null);
    setPet(null);
    setPetError(null);

    gql<{ findOneUser: FullUser }>(FIND_ONE_USER_QUERY, {
      id_user: userId,
    })
      .then((d) => setUser(d.findOneUser))
      .catch((e) => setError(e.message));

    gql<{ getPet: Pet }>(GET_PET_QUERY)
      .then((d) => setPet(d.getPet))
      .catch((e) => setPetError(e.message));
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
    return list.filter((p) => p.fecha_publicacion?.startsWith(dateFilter));
  }, [user, dateFilter]);

  if (error)
    return (
      <p className="text-[#ff8aa5]">No se pudo cargar el perfil: {error}</p>
    );
  if (!user) return <p className="text-[var(--text-dim)]">Cargando perfil…</p>;

  const avatar = fileUrl(user.avatar) ?? user.avatar;

  return (
    <section className="space-y-6 pt-[calc(12rem+1rem)] xl:pt-0">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_minmax(280px,340px)]">
        <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-[var(--surface)] shadow-lg">
          <header className="h-40 bg-linear-90 from-fuchsia-900 via-purple-900" />

          <main className="px-6 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={user.nombre_usuario}
              className="-mt-14 mb-4 h-28 w-28 rounded-full border-4 border-[var(--surface)] object-cover shadow-lg"
            />

            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              {user.nombre_usuario}

              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

              {user.is_admin && (
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
                  Admin
                </span>
              )}
            </h1>

            {user.descripcion && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">
                {user.descripcion}
              </p>
            )}

            <p className="mt-4 flex gap-6 text-sm text-[var(--text-dim)]">
              <span>
                <strong className="text-white">
                  {user.seguidores?.length ?? 0}
                </strong>{" "}
                seguidores
              </span>

              <span>
                <strong className="text-white">
                  {user.siguiendo?.length ?? 0}
                </strong>{" "}
                siguiendo
              </span>
            </p>

            {user.insignias?.length > 0 && (
              <p className="mt-4 flex flex-wrap gap-2">
                {user.insignias.map((bu) => (
                  <span
                    key={bu.id_insignia}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200"
                  >
                    {bu.insignia.icono ? `${bu.insignia.icono} ` : ""}
                    {bu.insignia.nombre}
                  </span>
                ))}
              </p>
            )}

            <button
              onClick={toggleFollow}
              className={`mt-5 rounded-xl px-5 py-2 font-medium transition ${
                following
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-300"
                  : "bg-purple-600 text-white hover:bg-purple-500"
              }`}
            >
              {following ? "Siguiendo" : "Seguir"}
            </button>
          </main>
        </article>

        <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-[var(--surface)] shadow-lg">
          <header className="px-6 py-5 border-b border-zinc-800 bg-zinc-950/40">
            <h2 className="text-lg font-semibold text-white">Mascota</h2>
            <p className="mt-1 text-sm text-[var(--text-dim)]">
              Información de tu pet en el backend.
            </p>
          </header>

          <main className="p-6 space-y-4">
            {pet ? (
              <div className="space-y-3 text-sm text-[var(--text-dim)]">
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p>
                    <strong className="text-white">Nivel actual</strong>:{" "}
                    {pet.nivel_actual}
                  </p>
                  <p>
                    <strong className="text-white">XP</strong>:{" "}
                    {pet.puntos_experiencia}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p>
                    <strong className="text-white">ID mascota</strong>:{" "}
                    {pet.id_mascota}
                  </p>
                  <p>
                    <strong className="text-white">ID usuario</strong>:{" "}
                    {pet.id_usuario}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-white">Última evolución</p>
                  <p>
                    {new Date(pet.fecha_ultima_evolucion).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            ) : petError ? (
              <p className="text-sm text-[#ff8aa5]">
                No se pudo cargar la mascota: {petError}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-dim)]">
                Cargando mascota…
              </p>
            )}
          </main>
        </article>
      </div>

      <header className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white">Proyectos</h2>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="ml-auto rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
        />

        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-sm text-purple-300"
          >
            limpiar
          </button>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-[var(--surface)] p-5 text-sm text-[var(--text-dim)]">
          {dateFilter ? "Sin proyectos en esa fecha." : "Aún no hay proyectos."}
        </p>
      ) : (
        posts.map((p) => (
          <PostCard key={p.id_post} post={{ ...p, usuario: user }} />
        ))
      )}
    </section>
  );
}
