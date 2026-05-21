"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { api, gql } from "@/lib/api";
import { CREATE_POST_MUTATION } from "@/lib/queries";

export default function PostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("El título es obligatorio.");
    setBusy(true);
    try {
      let uploaded: { dir: string; file_extension: string }[] = [];
      if (files.length) {
        const res = await api.uploadFiles(files);
        uploaded = res.map((f) => ({
          dir: f.path,
          file_extension: f.extension,
        }));
      }

      await gql(CREATE_POST_MUTATION, {
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          files: uploaded.length ? uploaded : undefined,
        },
      });

      router.replace("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el post");
    } finally {
      setBusy(false);
    }
  }

  const input = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 16,
    background: "rgba(12,5,10,0.6)",
    border: "2px solid rgba(124,92,255,0.35)",
    color: "var(--text)",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
  } as const;

  return (
    <AppShell>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 22px" }}>
        Nueva publicación
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        {error && (
          <div
            style={{
              background: "rgba(255,90,120,0.12)",
              border: "1px solid rgba(255,90,120,0.4)",
              color: "#ff9bb0",
              padding: "10px 14px",
              borderRadius: 14,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: 7, color: "var(--text-dim)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Título
          </label>
          <input
            style={input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mi nuevo proyecto"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 7, color: "var(--text-dim)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Descripción
          </label>
          <textarea
            style={{ ...input, minHeight: 120, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntanos sobre tu proyecto…"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 7, color: "var(--text-dim)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Archivos (imágenes / video)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            style={{ color: "var(--text-dim)" }}
          />
          {files.length > 0 && (
            <p style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 6 }}>
              {files.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        <button
          disabled={busy}
          style={{
            padding: 14,
            borderRadius: 999,
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            boxShadow: "0 0 22px var(--accent-glow)",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Publicando…" : "Publicar"}
        </button>
      </form>
    </AppShell>
  );
}
