"use client";

import { useMemo, useState } from "react";
import { FiHeart, FiImage, FiMessageCircle, FiPaperclip, FiShare2 } from "react-icons/fi";
import ActionButton from "@/components/ActionButton";

/**
 * @typedef {Object} CommentReply
 * @property {string} id
 * @property {string} authorName
 * @property {string} text
 * @property {string} timestamp
 * @property {boolean} liked
 */

/**
 * @typedef {Object} CommentEntry
 * @property {string} id
 * @property {string} authorName
 * @property {string} authorAvatar
 * @property {string} text
 * @property {string} timestamp
 * @property {boolean} liked
 * @property {number} likeCount
 * @property {CommentReply[]} replies
 */

/**
 * @typedef {Object} PostData
 * @property {string} id
 * @property {string} authorName
 * @property {string} authorAvatar
 * @property {string} contentImage
 * @property {string} caption
 * @property {string} timestamp
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} shareCount
 * @property {CommentEntry[]} [comments]
 */

/**
 * Renderiza una publicación con interacciones reutilizables.
 * @param {{ post: PostData }} props
 */
export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [shareStatus, setShareStatus] = useState("");
  const [comments, setComments] = useState(post.comments ?? []);
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [commentImageName, setCommentImageName] = useState("");
  const [commentFileName, setCommentFileName] = useState("");
  const commentLimit = 220;

  const renderedComments = useMemo(() => comments, [comments]);

  const handleLike = () => {
    setLiked((current) => !current);
  };

  const handleCommentToggle = () => {
    setCommentsOpen((current) => !current);
  };

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) return;

    const newComment = {
      id: `${Date.now()}`,
      authorName: "Tú",
      authorAvatar: post.authorAvatar,
      text,
      timestamp: "Ahora",
      liked: false,
      likeCount: 0,
      replies: [],
    };

    setComments((current) => [newComment, ...current]);
    setCommentText("");
    setCommentImageName("");
    setCommentFileName("");
    setCommentCount((current) => current + 1);
  };

  const handleReply = (commentId) => {
    const reply = replyText.trim();
    if (!reply) return;

    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) return comment;
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: `${Date.now()}-${commentId}`,
              authorName: "Tú",
              text: reply,
              timestamp: "Ahora",
              liked: false,
            },
          ],
        };
      })
    );
    setReplyText("");
    setActiveReplyId(null);
    setCommentCount((current) => current + 1);
  };

  const handleCommentImage = (event) => {
    setCommentImageName(event.target.files?.[0]?.name ?? "");
  };

  const handleCommentFile = (event) => {
    setCommentFileName(event.target.files?.[0]?.name ?? "");
  };

  const toggleCommentLike = (commentId) => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) return comment;
        return {
          ...comment,
          liked: !comment.liked,
          likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1,
        };
      })
    );
  };

  const toggleReplyLike = (commentId, replyId) => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) return comment;
        return {
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id !== replyId) return reply;
            return {
              ...reply,
              liked: !reply.liked,
            };
          }),
        };
      })
    );
  };

  const handleShare = async () => {
    const shareText = `${post.authorName} compartió: ${post.caption}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Publicación", text: shareText });
        setShareStatus("Compartido");
      } catch {}
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      setShareStatus("Link copiado");
    }
    setShareCount((current) => current + 1);
  };

  return (
    <article className="relative rounded-[2rem] border border-white/10 bg-[var(--color-surface)] p-4 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <header className="flex items-center gap-4 pb-4">
        <img
          src={post.authorAvatar}
          alt={post.authorName}
          className="h-14 w-14 rounded-full object-cover border border-white/10"
        />
        <div>
          <p className="font-semibold text-text-base">{post.authorName}</p>
          <p className="text-xs text-white/60">{post.timestamp}</p>
        </div>
      </header>

      <p className="mb-4 rounded-3xl bg-[rgba(255,255,255,0.05)] p-4 text-sm leading-6 text-white/85">
        {post.caption}
      </p>

      {post.contentImage ? (
        <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/5">
          <img src={post.contentImage} alt={post.caption} className="w-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLike}
            aria-label="Me gusta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[var(--color-surface)] text-2xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              liked ? "text-red-500 scale-110 heartbeat border-red-400/30" : "text-text-base hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <FiHeart />
          </button>

          <ActionButton
            icon={<FiMessageCircle />}
            label={`Comentar (${commentCount})`}
            active={commentsOpen}
            onClick={handleCommentToggle}
          />
          <ActionButton
            icon={<FiShare2 />}
            label={`Compartir (${shareCount})`}
            onClick={handleShare}
          />
        </div>

        {shareStatus ? (
          <p className="text-xs text-white/60">{shareStatus}</p>
        ) : null}
      </div>

      {commentsOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--color-surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-text-base">Comentarios</h3>
                <p className="text-sm text-white/60">{commentCount} comentarios</p>
              </div>
              <button
                type="button"
                onClick={handleCommentToggle}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-4 rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-white/60">
                <span>Escribe tu comentario</span>
                <span>{commentText.length}/{commentLimit}</span>
              </div>
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value.slice(0, commentLimit))}
                placeholder="Escribe tu comentario..."
                rows="3"
                className="w-full resize-none rounded-3xl border border-white/10 bg-transparent p-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
                maxLength={commentLimit}
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
                    <FiImage className="text-base" />
                    <span>Imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCommentImage} />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
                    <FiPaperclip className="text-base" />
                    <span>Archivo</span>
                    <input type="file" className="hidden" onChange={handleCommentFile} />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(122,109,243,0.95)]"
                >
                  Publicar comentario
                </button>
              </div>
              {(commentImageName || commentFileName) && (
                <div className="mt-3 space-y-1 text-xs text-white/70">
                  {commentImageName ? <p>Imagen: {commentImageName}</p> : null}
                  {commentFileName ? <p>Archivo: {commentFileName}</p> : null}
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {renderedComments.length === 0 ? (
                <p className="text-sm text-white/60">Aún no hay comentarios. Sé el primero.</p>
              ) : (
                renderedComments.map((comment) => (
                  <div key={comment.id} className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="h-11 w-11 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-text-base">{comment.authorName}</p>
                            <p className="text-xs text-white/60">{comment.timestamp}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleCommentLike(comment.id)}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 transition duration-200 ${
                              comment.liked ? "text-red-500 bg-white/5 border-red-400/30" : "text-text-base hover:border-white/20 hover:bg-white/5"
                            }`}
                            aria-label="Me gusta comentario"
                          >
                            <FiHeart className="text-xl" />
                          </button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/80 break-words whitespace-pre-wrap">{comment.text}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                          <span>{comment.likeCount} me gusta</span>
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(comment.id === activeReplyId ? null : comment.id)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:border-white/20 hover:bg-white/10"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>

                    {comment.replies.length > 0 && (
                      <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-white/80">
                              R
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold">{reply.authorName}</p>
                                <button
                                  type="button"
                                  onClick={() => toggleReplyLike(comment.id, reply.id)}
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 transition duration-200 ${
                                    reply.liked ? "text-red-500 bg-white/5 border-red-400/30" : "text-text-base hover:border-white/20 hover:bg-white/5"
                                  }`}
                                  aria-label="Me gusta respuesta"
                                >
                                  <FiHeart className="text-base" />
                                </button>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-white/80 break-words whitespace-pre-wrap">{reply.text}</p>
                              <p className="mt-1 text-xs text-white/50">{reply.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeReplyId === comment.id ? (
                      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-white/60">
                          <span>Responder</span>
                          <span>{replyText.length}/{commentLimit}</span>
                        </div>
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value.slice(0, commentLimit))}
                          placeholder="Escribe tu respuesta..."
                          rows="2"
                          className="w-full resize-none rounded-2xl border border-white/10 bg-transparent p-3 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
                          maxLength={commentLimit}
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReply(comment.id)}
                            className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(122,109,243,0.95)]"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
