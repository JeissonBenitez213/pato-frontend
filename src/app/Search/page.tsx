"use client";

import { useState, type FormEvent } from "react";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import { gql } from "@/lib/api";
import { SEARCH_POSTS_QUERY } from "@/lib/queries";
import type { Post } from "@/lib/types";

export default function SearchPage() {
  const [term, setTerm] = useState("");
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<Post[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const d = await gql<{ searchPosts: Post[] }>(SEARCH_POSTS_QUERY, {
        filter: {
          search: term.trim() || undefined,
          username: username.trim() || undefined,
        },
      });
      setResults(d.searchPosts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la búsqueda");
    } finally {
      setBusy(false);
    }
  }

  const input = {
    flex: 1,
    padding: "13px 16px",
    borderRadius: 999,
    background: "rgba(12,5,10,0.6)",
    border: "2px solid rgba(124,92,255,0.35)",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
  } as const;

  return (
    <AppShell>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 22px" }}>
        Buscar
      </h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}
      >
        <input
          style={input}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Texto o título…"
        />
        <input
          style={{ ...input, flex: "0 1 200px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@usuario"
        />
        <button
          disabled={busy}
          style={{
            padding: "0 24px",
            borderRadius: 999,
            border: "none",
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          }}
        >
          {busy ? "…" : "Buscar"}
        </button>
      </form>

      {error && <p style={{ color: "#ff8aa5" }}>{error}</p>}

      {results && results.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>Sin resultados.</p>
      )}

      {results?.map((p) => (
        <PostCard key={p.id_post} post={p} />
      ))}
    </AppShell>
  );
}
