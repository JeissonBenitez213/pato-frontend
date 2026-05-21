"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import DatosDemo from "@/components/DatosDemo";
import PostCard from "@/components/PostCard";
import { gql } from "@/lib/api";
import { FEED_QUERY } from "@/lib/queries";
import type { Post } from "@/lib/types";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gql<{
      posts: {
        data: Post[];
        nextCursor: number | null;
      };
    }>(FEED_QUERY)
      .then((d) => setPosts(d.posts.data ?? []))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AppShell>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          margin: "6px 0 22px",
          letterSpacing: "-0.02em",
        }}
      >
        Inicio
      </h1>

      <DatosDemo />

      {error && (
        <p style={{ color: "#ff8aa5" }}>No se pudo cargar el feed: {error}</p>
      )}

      {posts === null && !error && (
        <p style={{ color: "var(--text-dim)" }}>Cargando publicaciones…</p>
      )}

      {posts && posts.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>
          Aún no hay publicaciones. ¡Sé el primero en postear!
        </p>
      )}

      {posts?.map((p) => (
        <PostCard key={p.id_post} post={p} />
      ))}
    </AppShell>
  );
}
