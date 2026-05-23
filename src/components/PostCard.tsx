"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  FaHeart,
  FaRegHeart,
  FaRegStar,
  FaStar,
  FaRegComment,
  FaShare,
} from "react-icons/fa";

import { HiOutlineDotsVertical } from "react-icons/hi";

import { useSubscription } from "@apollo/client/react";

import {
  CREATE_COMMENT_MUTATION,
  NEW_COMMENT_SUBSCRIPTION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
  UPDATED_COMMENT_SUBSCRIPTION,
  DELETED_COMMENT_SUBSCRIPTION,
  ADD_REACTION_MUTATION,
} from "@/lib/queries";

import { apolloClient } from "@/lib/apollo";

import { api, fileUrl } from "@/lib/api";

import type { Post } from "@/lib/types";

function isVideo(ext?: string) {
  return !!ext && ["mp4", "webm", "ogg", "mov"].includes(ext.toLowerCase());
}

/* ---------------- TREE ---------------- */

function buildTree(list: any[]) {
  const map = new Map<number, any>();

  for (const c of list) {
    map.set(Number(c.id_comentario), {
      ...c,
      children: [],
    });
  }

  const roots: any[] = [];

  for (const c of list) {
    const node = map.get(Number(c.id_comentario));

    const parentId =
      c.id_comentario_padre !== null && c.id_comentario_padre !== undefined
        ? Number(c.id_comentario_padre)
        : null;

    if (parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = map.get(parentId);

    if (parent) {
      parent.children.push(node);
    }
  }

  return roots;
}

/* ---------------- COMMENT ITEM ---------------- */

function CommentItem({
  c,
  me,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
  sendComment,
  deleteComment,
  updateComment,
}: any) {
  const [open, setOpen] = useState(false);

  const [menu, setMenu] = useState(false);

  const [editing, setEditing] = useState(false);

  const [editText, setEditText] = useState(c.texto);

  return (
    <div className="bg-black/40 p-3 rounded-md border border-[var(--accent)]/20">
      {/* HEADER */}
      <div className="flex gap-2 items-start">
        <Link href={`/profile/${c.usuario.id_usuario}`}>
          <img
            src={fileUrl(c.usuario.avatar) || ""}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>

        <div className="flex flex-col flex-1">
          <span className="text-xs text-gray-400">
            @{c.usuario.nombre_usuario}
          </span>

          {editing ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateComment(c.id_comentario, editText);
                  setEditing(false);
                }
              }}
              className="
                bg-black/60
                px-3
                py-2
                rounded-full
                mt-1
              "
            />
          ) : (
            <p className="text-sm text-[var(--text)] break-words">{c.texto}</p>
          )}
        </div>

        {/* OWNER MENU */}
        {me?.id === c.usuario.id_usuario && (
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)}>
              <HiOutlineDotsVertical />
            </button>

            {menu && (
              <div
                className="
                  absolute
                  right-0
                  top-6
                  bg-black
                  border
                  border-white/10
                  rounded-lg
                  overflow-hidden
                  z-50
                  min-w-[120px]
                "
              >
                {!editing ? (
                  <button
                    className="
                      w-full
                      text-left
                      px-3
                      py-2
                      hover:bg-white/10
                    "
                    onClick={() => {
                      setEditing(true);
                      setMenu(false);
                    }}
                  >
                    editar
                  </button>
                ) : (
                  <button
                    className="
                      w-full
                      text-left
                      px-3
                      py-2
                      hover:bg-white/10
                    "
                    onClick={() => {
                      updateComment(c.id_comentario, editText);

                      setEditing(false);
                    }}
                  >
                    guardar
                  </button>
                )}

                <button
                  className="
                    w-full
                    text-left
                    px-3
                    py-2
                    hover:bg-red-500/20
                    text-red-400
                  "
                  onClick={() => deleteComment(c.id_comentario)}
                >
                  eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 text-xs mt-2">
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

      {/* REPLY */}
      {replyTo === c.id_comentario && (
        <div className="mt-3 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendComment(c.id_comentario, replyText);
              }
            }}
            className="
              flex-1
              bg-black/60
              px-3
              py-2
              rounded-full
            "
          />

          <button
            className="
              bg-green-600
              px-4
              rounded-full
            "
            onClick={() => sendComment(c.id_comentario, replyText)}
          >
            enviar
          </button>
        </div>
      )}

      {/* CHILDREN */}
      {open && c.children.length > 0 && (
        <div className="ml-4 mt-3 border-l border-white/10 pl-3 flex flex-col gap-3">
          {c.children.map((child: any) => (
            <CommentItem
              key={child.id_comentario}
              c={child}
              me={me}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyText={replyText}
              setReplyText={setReplyText}
              sendComment={sendComment}
              deleteComment={deleteComment}
              updateComment={updateComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- POST CARD ---------------- */

export default function PostCard({ post }: { post: Post }) {
  const [me, setMe] = useState<any>(null);

  const [comments, setComments] = useState<any[]>(post.comentarios ?? []);

  const [replyText, setReplyText] = useState("");

  const [replyTo, setReplyTo] = useState<number | null>(null);

  const [text, setText] = useState("");

  const [showComments, setShowComments] = useState(false);

  const [likes, setLikes] = useState(post.stats?.likes || 0);

  const [favorites, setFavorites] = useState(post.stats?.favorites || 0);

  const [shares, setShares] = useState(post.stats?.shares || 0);

  const [liked, setLiked] = useState(false);

  const [favorited, setFavorited] = useState(false);

  const [shared, setShared] = useState(false);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    async function loadMe() {
      try {
        const user = await api.me();

        setMe(user);
      } catch {
        try {
          await api.refresh();

          const user = await api.me();

          setMe(user);
        } catch {
          setMe(null);
        }
      }
    }

    loadMe();
  }, []);

  /* ---------------- SUBSCRIPTIONS ---------------- */

  useSubscription<{ newComment: any }>(NEW_COMMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const comment = data.data?.newComment;

      if (!comment) return;

      if (Number(comment.id_post) !== Number(post.id_post)) {
        return;
      }

      setComments((prev) => {
        const exists = prev.some(
          (c) => Number(c.id_comentario) === Number(comment.id_comentario),
        );

        if (exists) return prev;

        return [...prev, comment];
      });
    },
  });

  useSubscription<{ updatedComment: any }>(UPDATED_COMMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const updated = data.data?.updatedComment;

      if (!updated) return;

      setComments((prev) =>
        prev.map((c) =>
          Number(c.id_comentario) === Number(updated.id_comentario)
            ? {
                ...c,
                ...updated,
              }
            : c,
        ),
      );
    },
  });

  useSubscription<{ deletedComment: any }>(DELETED_COMMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const deleted = data.data?.deletedComment;

      if (!deleted) return;

      setComments((prev) =>
        prev.filter(
          (c) => Number(c.id_comentario) !== Number(deleted.id_comentario),
        ),
      );
    },
  });

  /* ---------------- TREE ---------------- */

  const tree = useMemo(() => buildTree(comments), [comments]);

  /* ---------------- REACTIONS ---------------- */

  async function react(
    type: "like" | "favorites" | "shares" | "comentario",
    value: boolean,
  ) {
    await apolloClient.mutate({
      mutation: ADD_REACTION_MUTATION,

      variables: {
        input: {
          id_post: post.id_post,
          [type]: value,
        },
      },
    });
  }

  async function toggleLike() {
    const next = !liked;

    setLiked(next);

    setLikes((v) => (next ? v + 1 : v - 1));

    await react("like", next);
  }

  async function toggleFavorite() {
    const next = !favorited;

    setFavorited(next);

    setFavorites((v) => (next ? v + 1 : v - 1));

    await react("favorites", next);
  }

  async function sharePost() {
    if (shared) return;

    const url = `${window.location.origin}/feed/${post.id_post}`;

    window.open(url, "_blank");

    await navigator.clipboard.writeText(url);

    setShared(true);

    setShares((v) => v + 1);

    await react("shares", true);
  }

  async function markCommentReaction() {
    await react("comentario", true);
  }

  /* ---------------- COMMENTS ---------------- */

  async function sendComment(parentId: number | null, value: string) {
    const content = value.trim();

    if (!content) return;

    await markCommentReaction();

    const response = await apolloClient.mutate<{
      createComment: any;
    }>({
      mutation: CREATE_COMMENT_MUTATION,

      variables: {
        input: {
          id_post: post.id_post,
          texto: content,
          id_comentario_padre: parentId,
        },
      },
    });

    const created = response.data?.createComment;

    if (created) {
      setComments((prev) => {
        const exists = prev.some(
          (c) => Number(c.id_comentario) === Number(created.id_comentario),
        );

        if (exists) return prev;

        return [...prev, created];
      });
    }

    setText("");

    setReplyText("");

    setReplyTo(null);
  }

  async function deleteComment(commentId: number) {
    await apolloClient.mutate({
      mutation: DELETE_COMMENT_MUTATION,

      variables: {
        comment_id: commentId,
      },
    });
  }

  async function updateComment(commentId: number, text: string) {
    const content = text.trim();

    if (!content) return;

    await apolloClient.mutate({
      mutation: UPDATE_COMMENT_MUTATION,

      variables: {
        input: {
          id_comentario: commentId,
          texto: content,
        },
      },
    });
  }

  return (
    <article
      className="
        rounded-[var(--radius)]
        bg-linear-to-br
        from-[var(--surface-grad-a)]
        to-[var(--surface-grad-b)]
        p-4
        mb-6
        border-2
        border-[var(--accent)]
        w-[80vw]
        md:w-[60vw]
      "
    >
      <div className="flex gap-4">
        {post.files?.length > 0 && (
          <div className="w-1/2">
            {isVideo(post.files[0].file_extension) ? (
              <video
                src={fileUrl(post.files[0].dir) || ""}
                controls
                className="rounded-xl"
              />
            ) : (
              <img
                src={fileUrl(post.files[0].dir) || ""}
                className="rounded-xl"
              />
            )}
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-xl font-bold">{post.title}</h3>

          <p>{post.description}</p>

          {/* REACTIONS */}
          <div className="mt-4 flex gap-5 text-lg">
            <button onClick={toggleLike} className="flex items-center gap-2">
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}

              <span className="text-sm">{likes}</span>
            </button>

            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-2"
            >
              <FaRegComment />

              <span className="text-sm">{comments.length}</span>
            </button>

            <button onClick={sharePost} className="flex items-center gap-2">
              <FaShare />

              <span className="text-sm">{shares}</span>
            </button>

            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2"
            >
              {favorited ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar />
              )}

              <span className="text-sm">{favorites}</span>
            </button>
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 border-t pt-4 space-y-4">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendComment(null, text);
                }
              }}
              className="
                w-full
                bg-black/60
                px-4
                py-2
                rounded-full
                outline-none
                border
                border-white/10
              "
              placeholder="comentar..."
            />

            <button
              className="
                px-4
                rounded-full
                bg-green-600
                hover:bg-green-500
                transition
              "
              onClick={() => sendComment(null, text)}
            >
              enviar
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {tree.map((c) => (
              <CommentItem
                key={c.id_comentario}
                c={c}
                me={me}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                sendComment={sendComment}
                deleteComment={deleteComment}
                updateComment={updateComment}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
