"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSubscription } from "@apollo/client/react";

import { fileUrl } from "@/lib/api";
import {
  CREATE_COMMENT_MUTATION,
  NEW_COMMENT_SUBSCRIPTION,
} from "@/lib/queries";
import { apolloClient } from "@/lib/apollo";

import type { Post } from "@/lib/types";

function isVideo(ext?: string) {
  return !!ext && ["mp4", "webm", "ogg", "mov"].includes(ext.toLowerCase());
}

/* ---------------- TREE ---------------- */
function buildTree(list: any[]) {
  const map = new Map<number, any>();
  const roots: any[] = [];

  for (const c of list) {
    map.set(c.id_comentario, { ...c, children: [] });
  }

  for (const c of list) {
    const node = map.get(c.id_comentario);

    if (c.id_comentario_padre) {
      const parent = map.get(c.id_comentario_padre);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);

  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const [comments, setComments] = useState(post.comentarios ?? []);

  /* ---------------- WS ---------------- */
  useSubscription(NEW_COMMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const payload = data.data as any;

      const newComment = payload?.newComment;
      if (!newComment) return;

      setComments((prev) => [...prev, newComment]);
    },
  });

  const tree = useMemo(() => buildTree(comments), [comments]);

  /* ---------------- CREATE COMMENT ---------------- */
  async function sendComment(parentId: number | null, value: string) {
    const content = value.trim();
    if (!content) return;

    const response = await apolloClient.mutate<any>({
      mutation: CREATE_COMMENT_MUTATION,
      variables: {
        input: {
          id_post: post.id_post,
          texto: content,
          id_comentario_padre: parentId ?? null,
        },
      },
    });

    const createdComment = response.data?.createComment as any;
    if (createdComment) {
      setComments((prev) => [...prev, createdComment]);
    }

    setText("");
    setReplyText("");
    setReplyTo(null);
  }

  /* ---------------- COMMENT ITEM ---------------- */
  function CommentItem({ c }: any) {
    const [open, setOpen] = useState(true);

    return (
      <div className="bg-black/40 p-3 rounded-md border border-[var(--accent)]/20">
        {/* HEADER */}
        <div className="flex gap-2 items-center">
          <Link href={`/profile/${c.usuario.id_usuario}`}>
            <img
              src={fileUrl(c.usuario.avatar)}
              className="w-8 h-8 rounded-full"
            />
          </Link>

          <p className="text-sm text-[var(--text)] flex-1">{c.texto}</p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 text-xs mt-1">
          <button
            className="text-blue-400"
            onClick={() =>
              setReplyTo(replyTo === c.id_comentario ? null : c.id_comentario)
            }
          >
            responder
          </button>

          {c.children.length > 0 && (
            <button className="text-purple-400" onClick={() => setOpen(!open)}>
              {open ? "ocultar" : `ver respuestas (${c.children.length})`}
            </button>
          )}
        </div>

        {/* REPLY INPUT */}
        {replyTo === c.id_comentario && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-black/60 px-3 py-2 rounded-full"
              placeholder="respuesta..."
            />
            <button
              className="text-xs bg-green-600 px-3 rounded-full"
              onClick={() => sendComment(c.id_comentario, replyText)}
            >
              enviar
            </button>
          </div>
        )}

        {/* CHILDREN */}
        {open && (
          <div className="ml-4 mt-2 border-l border-[var(--accent)]/30 pl-3 flex flex-col gap-2">
            {c.children.map((child: any) => (
              <CommentItem key={child.id_comentario} c={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-[var(--radius)] bg-linear-to-br from-[var(--surface-grad-a)] to-[var(--surface-grad-b)] p-4 mb-6 border-2 border-[var(--accent)] w-[80vw] md:w-[60vw]">
      {/* HEADER */}
      <div className="flex gap-4">
        {/* MEDIA */}
        {post.files?.length > 0 && (
          <div className="w-1/2">
            {isVideo(post.files[0].file_extension) ? (
              <video src={fileUrl(post.files[0].dir)} controls />
            ) : (
              <img src={fileUrl(post.files[0].dir)} />
            )}
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1">
          <h3 className="text-xl font-bold">{post.title}</h3>
          <p>{post.description}</p>

          {/* ICONS (RESTO RESTAURADO) */}
          <div className="mt-3 flex gap-4 text-sm">
            <button>❤️ {post.stats?.likes}</button>
            <button onClick={() => setShowComments((v) => !v)}>
              💬 {comments.length}
            </button>
            <button>🔁 {post.stats?.shares}</button>
            <button>⭐ {post.stats?.favorites}</button>
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 border-t pt-3 space-y-3">
          {/* ROOT COMMENT */}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-black/60 px-3 py-2 rounded-full"
            placeholder="comentar..."
            onKeyDown={(e) => e.key === "Enter" && sendComment(null, text)}
          />

          {/* TREE */}
          <div className="flex flex-col gap-3">
            {tree.map((c) => (
              <CommentItem key={c.id_comentario} c={c} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
