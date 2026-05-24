"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import { gql } from "@/lib/api";
import { FEED_QUERY } from "@/lib/queries";

import type { Post } from "@/lib/types";

export default function FeedPostPage() {
  const params = useParams();
  const id = Number(params?.id ?? 0);

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de publicación inválido.");
      return;
    }

    gql<{
      posts: {
        data: Post[];
        nextCursor: number | null;
      };
    }>(FEED_QUERY)
      .then((d) => {
        const items = d.posts.data ?? [];
        const ordered = [...items].sort((a, b) => {
          if (a.id_post === id) return -1;
          if (b.id_post === id) return 1;
          return 0;
        });
        setPosts(ordered);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <AppShell>
      {error && (
        <p style={{ color: "#ff8aa5" }}>No se pudo cargar el feed: {error}</p>
      )}

      {posts === null && !error && (
        <p style={{ color: "var(--text-dim)" }}>Cargando publicación…</p>
      )}

      {posts && posts.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>
          No se encontró la publicación solicitada.
        </p>
      )}

      {posts?.map((p) => (
        <PostCard key={p.id_post} post={p} />
      ))}
    </AppShell>
  );
}
