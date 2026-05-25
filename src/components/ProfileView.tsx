"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCommentDots, FaUserFriends } from "react-icons/fa";

import PostCard from "./PostCard";
import { api, fileUrl } from "@/lib/api";
import {
  FIND_ONE_USER_QUERY,
  GET_PET_QUERY,
  TOGGLE_FOLLOW_MUTATION,
} from "@/lib/queries";

import type { FullUser, Pet } from "@/lib/types";

type Me = {
  id: number;
  nombre_usuario: string;
  is_admin: boolean;
};

export default function ProfileView({ userId }: { userId: number }) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [petError, setPetError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  const router = useRouter();

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    setUser(null);
    setError(null);
    setPet(null);
    setPetError(null);

    (async () => {
      try {
        const [profile, petData, meData] = await Promise.all([
          api.gql<{ findOneUser: FullUser }>(FIND_ONE_USER_QUERY, {
            id_user: userId,
          }),
          api.gql<{ getPet: Pet }>(GET_PET_QUERY),
          api.me(),
        ]);

        setUser(profile.findOneUser);
        setPet(petData.getPet);
        setMe(meData);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [userId]);

  /* =========================
     SELF CHECK
  ========================= */
  const isSelf = useMemo(() => {
    if (!me || !user) return false;
    return me.id === user.id_usuario;
  }, [me, user]);

  /* =========================
     FOLLOW LOGIC
  ========================= */

  const isFollowing = useMemo(() => {
    if (!me || !user) return false;
    return user.seguidores?.some((s) => s.follower_id === me.id) ?? false;
  }, [me, user]);

  const isFollowedByUser = useMemo(() => {
    if (!me || !user) return false;
    return user.siguiendo?.some((s) => s.following_id === me.id) ?? false;
  }, [me, user]);

  const isMutualFollow = isFollowing && isFollowedByUser;

  async function toggleFollow() {
    if (!user) return;

    try {
      await api.gql(TOGGLE_FOLLOW_MUTATION, {
        id_user: userId,
      });

      const updated = await api.gql<{ findOneUser: FullUser }>(
        FIND_ONE_USER_QUERY,
        { id_user: userId },
      );

      setUser(updated.findOneUser);
    } catch (e) {
      console.error(e);
    }
  }

  /* =========================
     POSTS FILTER
  ========================= */

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

  /* =========================
     UI
  ========================= */

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_minmax(280px,340px)]">
        {/* PROFILE */}
        <article className="overflow-hidden rounded-3xl border border-zinc-800 bg-[var(--surface)] shadow-lg">
          <header className="h-40 bg-linear-90 from-fuchsia-900 via-purple-900" />

          <main className="px-6 pb-6">
            <img
              src={avatar}
              alt={user.nombre_usuario}
              className="-mt-14 mb-4 h-28 w-28 rounded-full border-4 border-[var(--surface)] object-cover shadow-lg"
            />

            <h1 className="text-2xl font-bold text-white">
              {user.nombre_usuario}
            </h1>

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

            {/* =========================
                SELF PROFILE ACTIONS
            ========================= */}
            {isSelf ? (
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => router.push("/profile/friends")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  <FaUserFriends />
                  Ver amigos
                </button>
              </div>
            ) : (
              <>
                {/* FOLLOW */}
                <button
                  onClick={toggleFollow}
                  className={`mt-5 rounded-xl px-5 py-2 font-medium transition ${
                    isFollowing
                      ? "border border-zinc-700 bg-zinc-800 text-zinc-300"
                      : "bg-purple-600 text-white hover:bg-purple-500"
                  }`}
                >
                  {isFollowing ? "Siguiendo" : "Seguir"}
                </button>

                {/* CHAT SOLO MUTUAL */}
                {isMutualFollow && (
                  <button
                    onClick={() => router.push(`/chat/${user.id_usuario}`)}
                    className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                  >
                    <FaCommentDots />
                    Mensaje
                  </button>
                )}
              </>
            )}
          </main>
        </article>

        {/* PET */}
        <article className="rounded-3xl border border-zinc-800 bg-[var(--surface)] p-6">
          {pet ? (
            <div className="text-sm text-white">Nivel: {pet.nivel_actual}</div>
          ) : petError ? (
            <p className="text-[#ff8aa5]">{petError}</p>
          ) : (
            <p className="text-[var(--text-dim)]">Cargando mascota…</p>
          )}
        </article>
      </div>

      {/* POSTS */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id_post} post={{ ...p, usuario: user }} />
        ))}
      </div>
    </section>
  );
}
