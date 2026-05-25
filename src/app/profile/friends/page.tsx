"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { FIND_ONE_USER_QUERY } from "@/lib/queries";

/* =========================
   TYPES
========================= */
type UserProfile = {
  id_usuario: number;
  nombre_usuario: string;
  avatar?: string;

  seguidores: { follower_id: number }[];
  siguiendo: { following_id: number }[];
};

/* =========================
   AVATAR RESOLVER
========================= */
function resolveAvatar(avatar?: string) {
  if (!avatar) return null;

  if (avatar.startsWith("http")) return avatar;

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base.replace(/\/$/, "")}/${avatar.replace(/^\//, "")}`;
}

export default function Page() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER GRAPH
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();

        const res = await api.gql<{
          findOneUser: UserProfile;
        }>(FIND_ONE_USER_QUERY, {
          id_user: me.id,
        });

        setUser(res.findOneUser);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* =========================
     DERIVED DATA
  ========================= */
  const followers = user?.seguidores ?? [];
  const following = user?.siguiendo ?? [];

  const followerIds = new Set(followers.map((f) => f.follower_id));
  const followingIds = new Set(following.map((f) => f.following_id));

  const friends = [...followerIds].filter((id) => followingIds.has(id));

  /* =========================
     UI
  ========================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-primary)] text-white">
        Cargando amigos...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-primary)] text-red-400">
        Error cargando usuario
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-white p-5">
      {/* HEADER TOP BAR */}
      <div className="mb-6 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => router.back()}
          className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm hover:bg-black/40"
        >
          ← Atrás
        </motion.button>

        <div>
          <h1 className="text-xl font-semibold">Amigos</h1>
          <p className="text-sm text-white/50">
            personas que sigues y te siguen
          </p>
        </div>
      </div>

      {/* SECTIONS */}
      <div className="space-y-8">
        <Section title="Amigos (mutuos)" count={friends.length}>
          {friends.length === 0 ? (
            <Empty text="Aún no tienes amigos mutuos" />
          ) : (
            friends.map((id) => <UserCard key={id} userId={id} />)
          )}
        </Section>

        <Section title="Seguidores" count={followers.length}>
          {followers.map((f) => (
            <UserCard key={f.follower_id} userId={f.follower_id} />
          ))}
        </Section>

        <Section title="Siguiendo" count={following.length}>
          {following.map((f) => (
            <UserCard key={f.following_id} userId={f.following_id} />
          ))}
        </Section>
      </div>
    </div>
  );
}

/* =========================
   SECTION WRAPPER
========================= */
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">{title}</h2>
        <span className="text-xs text-white/50">{count}</span>
      </div>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */
function Empty({ text }: { text: string }) {
  return (
    <div className="text-sm text-white/40 bg-white/5 rounded-xl p-4">
      {text}
    </div>
  );
}

/* =========================
   USER CARD
========================= */
function UserCard({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.gql<{
          findOneUser: UserProfile;
        }>(FIND_ONE_USER_QUERY, {
          id_user: userId,
        });

        setUser(res.findOneUser);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [userId]);

  const avatar = resolveAvatar(user?.avatar);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/chat/${userId}`)}
      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-secondary)]/30 border border-white/10 cursor-pointer"
    >
      {avatar ? (
        <img src={avatar} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-[var(--color-acent)] flex items-center justify-center font-bold">
          {user?.nombre_usuario?.charAt(0).toUpperCase() ?? "?"}
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {user?.nombre_usuario ?? "Cargando..."}
        </span>
        <span className="text-xs text-white/50">tocar para chatear</span>
      </div>
    </motion.div>
  );
}
