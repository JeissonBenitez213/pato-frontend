"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./PostCard.module.css";

import { gql, fileUrl } from "@/lib/api";

import {
  ADD_REACTION_MUTATION,
  CREATE_COMMENT_MUTATION,
  POST_COMMENTS_QUERY,
} from "@/lib/queries";

import { usePersistentState } from "@/hooks/usePersistentState";

import type { Post } from "@/lib/types";

import {
  HeartIcon,
  CommentIcon,
  ShareIcon,
  StarIcon,
  ChevronIcon,
} from "./Icons";

function formatDate(iso: string) {
  const d = new Date(iso);

  if (isNaN(d.getTime())) return "";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");

  return `${dd}/${mm}/${d.getFullYear()}`;
}

type CommentType = {
  id_comentario: number;
  texto: string;
  Fecha: string;

  Usuario: {
    id_usuario: number;
    nombre_usuario: string;
    avatar?: string | null;
  };
};

export default function PostCard({ post }: { post: Post }) {
  const [photoExpanded, setPhotoExpanded] = usePersistentState(
    `post:${post.id_post}:photo`,
    false,
  );

  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState<CommentType[]>([]);

  const [loadingComments, setLoadingComments] = useState(false);

  const [commentText, setCommentText] = useState("");

  const [reaction, setReaction] = useState({
    like: false,
    favorites: false,
    shares: false,
  });

  const [stats, setStats] = useState(
    post.stats ?? {
      likes: 0,
      comentarios: 0,
      shares: 0,
      favorites: 0,
    },
  );

  const [busy, setBusy] = useState(false);

  const firstImage = post.files?.find((f) =>
    /\.(webp|png|jpe?g|gif|avif)$/i.test(f.file_extension || f.dir),
  );

  const bg = firstImage ? fileUrl(firstImage.dir) : null;

  async function react(kind: "like" | "favorites" | "shares") {
    const next = !reaction[kind];

    setReaction((r) => ({
      ...r,
      [kind]: next,
    }));

    setStats((s) => ({
      ...s,

      [kind === "like"
        ? "likes"
        : kind === "favorites"
          ? "favorites"
          : "shares"]: Math.max(
        0,

        (s[
          kind === "like"
            ? "likes"
            : kind === "favorites"
              ? "favorites"
              : "shares"
        ] ?? 0) + (next ? 1 : -1),
      ),
    }));

    try {
      await gql(ADD_REACTION_MUTATION, {
        input: {
          id_post: post.id_post,

          like: kind === "like" ? next : undefined,

          favorites: kind === "favorites" ? next : undefined,

          shares: kind === "shares" ? next : undefined,
        },
      });
    } catch {}
  }

  async function toggleComments() {
    const next = !showComments;

    setShowComments(next);

    if (!next || comments.length > 0) {
      return;
    }

    setLoadingComments(true);

    try {
      const data = await gql<{
        getComment: CommentType[];
      }>(POST_COMMENTS_QUERY, {
        postId: post.id_post,
      });

      setComments(data.getComment ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  }

  async function sendComment() {
    if (!commentText.trim() || busy) {
      return;
    }

    setBusy(true);

    try {
      const data = await gql<{
        createComment: CommentType;
      }>(CREATE_COMMENT_MUTATION, {
        input: {
          id_post: post.id_post,
          texto: commentText.trim(),
        },
      });

      setComments((prev) => [data.createComment, ...prev]);

      setStats((s) => ({
        ...s,
        comentarios: (s.comentarios ?? 0) + 1,
      }));

      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={`${styles.card} ${
        photoExpanded ? styles.photoExpanded : ""
      } fade-up`}
    >
      {bg && (
        <>
          <div
            className={styles.bgImage}
            style={{
              backgroundImage: `url(${bg})`,
            }}
          />

          <div className={styles.bgFade} />
        </>
      )}

      {bg && (
        <button
          className={`${styles.chevron} ${photoExpanded ? styles.up : ""}`}
          onClick={() => setPhotoExpanded((v) => !v)}
          aria-label={photoExpanded ? "Contraer" : "Expandir"}
        >
          <ChevronIcon />
        </button>
      )}

      <div className={styles.inner}>
        <header className={styles.header}>
          <Link href={`/profile/${post.usuario.id_usuario}`}>
            <img
              className={styles.avatar}
              src={fileUrl(post.usuario.avatar) ?? post.usuario.avatar}
              alt={post.usuario.nombre_usuario}
            />
          </Link>

          <Link
            href={`/profile/${post.usuario.id_usuario}`}
            className={styles.namePill}
          >
            {post.usuario.nombre_usuario}
          </Link>

          <div className={styles.badges}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeDot} />
          </div>
        </header>

        <div
          className={styles.content}
          onClick={() => bg && setPhotoExpanded((v) => !v)}
          role={bg ? "button" : undefined}
          tabIndex={bg ? 0 : undefined}
        >
          <h3 className={styles.title}>{post.title}</h3>

          {post.description && (
            <p className={styles.body}>{post.description}</p>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${
              reaction.like ? styles.liked : ""
            }`}
            onClick={() => react("like")}
          >
            <HeartIcon width={22} height={22} />
            {stats.likes ?? 0}
          </button>

          <button className={styles.actionBtn} onClick={toggleComments}>
            <CommentIcon width={22} height={22} />
            {stats.comentarios ?? 0}
          </button>

          <button
            className={`${styles.actionBtn} ${
              reaction.shares ? styles.shared : ""
            }`}
            onClick={() => react("shares")}
          >
            <ShareIcon width={22} height={22} />
            {stats.shares ?? 0}
          </button>

          <button
            className={`${styles.actionBtn} ${
              reaction.favorites ? styles.faved : ""
            }`}
            onClick={() => react("favorites")}
          >
            <StarIcon width={22} height={22} />
            {stats.favorites ?? 0}
          </button>
        </div>

        {showComments && (
          <div className={styles.comments}>
            <div className={styles.commentInput}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
                placeholder="Escribe un comentario…"
              />

              <button
                className={styles.commentSend}
                onClick={sendComment}
                disabled={busy}
              >
                Enviar
              </button>
            </div>

            {loadingComments && <p>Cargando comentarios...</p>}

            {!loadingComments && comments.length === 0 && (
              <p>No hay comentarios todavía.</p>
            )}

            {comments.map((c) => (
              <div
                key={c.id_comentario}
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <img
                    src={fileUrl(c.Usuario.avatar) ?? c.Usuario.avatar ?? ""}
                    alt={c.Usuario.nombre_usuario}
                    width={34}
                    height={34}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

                  <strong>{c.Usuario.nombre_usuario}</strong>
                </div>

                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {c.texto}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className={styles.date}>{formatDate(post.fecha_publicacion)}</div>
      </div>
    </article>
  );
}
