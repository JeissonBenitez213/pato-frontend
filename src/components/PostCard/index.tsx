"use client";

import { useEffect, useMemo, useState } from "react";
import { useSubscription } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo";
import { api, fileUrl } from "@/lib/api";
import {
  ADD_REACTION_MUTATION,
  CREATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
  DELETED_COMMENT_SUBSCRIPTION,
  NEW_COMMENT_SUBSCRIPTION,
  UPDATED_COMMENT_SUBSCRIPTION,
  UPDATE_COMMENT_MUTATION,
} from "@/lib/queries";
import type { Post } from "@/lib/types";
import type { PostComment } from "./types";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import ReactionButtons from "./ReactionButtons";
import UserInfoPanel from "./UserInfoPanel";
import { buildTree, isVideo } from "./utils";

/* =========================
   MEDIA CAROUSEL
========================= */
function MediaCarousel({ files }: { files: any[] }) {
  const [index, setIndex] = useState(0);

  const file = files[index];
  if (!file) return null;

  const src = fileUrl(file.dir);

  const video = isVideo(file.file_extension || "");

  return (
    <div className="w-full">
      {video ? (
        <video src={src} controls className="rounded-xl w-full object-cover" />
      ) : (
        <img
          src={src}
          className="rounded-xl w-full object-cover"
          alt="post media"
        />
      )}

      {/* CONTROLES SOLO SI HAY MÁS DE 1 */}
      {files.length > 1 && (
        <div className="flex justify-between items-center mt-2 text-sm">
          <button
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ◀
          </button>

          <span>
            {index + 1} / {files.length}
          </span>

          <button
            onClick={() => setIndex((i) => Math.min(i + 1, files.length - 1))}
            disabled={index === files.length - 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function PostCard({ post }: { post: Post }) {
  const [me, setMe] = useState<any>(null);
  const [comments, setComments] = useState<PostComment[]>(
    post.comentarios ?? [],
  );

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

  const [commentReactionSent, setCommentReactionSent] = useState(false);

  /* =========================
     USER
  ========================= */
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

  /* =========================
     SUBSCRIPTIONS
  ========================= */
  useSubscription<{ newComment: any }>(NEW_COMMENT_SUBSCRIPTION, {
    onData: ({ data }) => {
      const comment = data.data?.newComment;

      if (!comment || Number(comment.id_post) !== Number(post.id_post)) {
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
            ? { ...c, ...updated }
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

  const tree = useMemo(() => buildTree(comments), [comments]);

  /* =========================
     REACTIONS
  ========================= */
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
    if (commentReactionSent) return;
    await react("comentario", true);
    setCommentReactionSent(true);
  }

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

    setComments((prev) =>
      prev.filter((c) => Number(c.id_comentario) !== Number(commentId)),
    );
  }

  async function updateComment(commentId: number, text: string) {
    const content = text.trim();
    if (!content) return;

    const response = await apolloClient.mutate({
      mutation: UPDATE_COMMENT_MUTATION,
      variables: {
        input: {
          id_comentario: commentId,
          texto: content,
        },
      },
    });

    const payload = response.data as { updateComment?: any };

    const updated = payload?.updateComment;
    if (!updated) return;

    setComments((prev) =>
      prev.map((c) =>
        Number(c.id_comentario) === Number(updated.id_comentario)
          ? { ...c, ...updated }
          : c,
      ),
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <article className="rounded-[var(--radius)] bg-linear-to-br from-[var(--surface-grad-a)] to-[var(--surface-grad-b)] p-4 mb-6 border-2 border-[var(--accent)] w-[80vw] md:w-[60vw]">
      <div className="flex gap-4">
        {/* 🔥 CARRUSEL REAL AQUÍ */}
        {Array.isArray(post.files) && post.files.length > 0 && (
          <div className="w-1/2">
            <MediaCarousel files={post.files} />
          </div>
        )}

        <div className="flex-1">
          <UserInfoPanel user={post.usuario} />
          <h3 className="text-xl font-bold">{post.title}</h3>
          <p>{post.description}</p>

          <ReactionButtons
            likes={likes}
            favorites={favorites}
            shares={shares}
            commentsCount={comments.length}
            liked={liked}
            favorited={favorited}
            showComments={showComments}
            onToggleLike={toggleLike}
            onToggleFavorite={toggleFavorite}
            onShare={sharePost}
            onToggleComments={() => setShowComments((v) => !v)}
          />
        </div>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4 space-y-4">
          <CommentInput
            value={text}
            onChange={setText}
            onSubmit={() => sendComment(null, text)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendComment(null, text);
            }}
          />

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
