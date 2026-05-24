"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo";
import { fileUrl } from "@/lib/api";
import {
  ADD_COMMENT_REACTION_MUTATION,
  COMMENT_REACTION_SUBSCRIPTION,
} from "@/lib/queries";
import type { PostComment } from "./types";
import CommentInput from "./CommentInput";

interface CommentItemProps {
  c: PostComment;
  me: { id: number } | null;
  replyTo: number | null;
  setReplyTo: (value: number | null) => void;
  replyText: string;
  setReplyText: (value: string) => void;
  sendComment: (parentId: number | null, value: string) => Promise<void>;
  deleteComment: (commentId: number | string) => Promise<void>;
  updateComment: (commentId: number | string, text: string) => Promise<void>;
}

export default function CommentItem({
  c,
  me,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
  sendComment,
  deleteComment,
  updateComment,
}: CommentItemProps) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(c.texto);
  const [liked, setLiked] = useState(c.reacted?.like ?? false);
  const [likes, setLikes] = useState(c.likes ?? 0);

  useEffect(() => {
    setLiked(c.reacted?.like ?? false);
    setLikes(c.likes ?? 0);
  }, [c.reacted?.like, c.likes]);

  useSubscription<{ commentReactionUpdated: any }>(
    COMMENT_REACTION_SUBSCRIPTION,
    {
      variables: {
        commentId: Number(c.id_comentario),
      },
      onData: ({ data }) => {
        const reaction = data.data?.commentReactionUpdated;
        if (!reaction) return;

        setLiked(Boolean(reaction.like));

        if (reaction.like !== undefined) {
          setLikes((current) =>
            reaction.like ? current + 1 : Math.max(current - 1, 0),
          );
        }
      },
    },
  );

  async function updateCommentReaction(value: boolean) {
    setLiked(value);
    setLikes((current) => (value ? current + 1 : Math.max(current - 1, 0)));

    await apolloClient.mutate({
      mutation: ADD_COMMENT_REACTION_MUTATION,
      variables: {
        input: {
          id_comment: Number(c.id_comentario),
          like: value,
        },
      },
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="bg-black/40 p-3 rounded-md border border-[var(--accent)]/20"
    >
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
              className="bg-black/60 px-3 py-2 rounded-full mt-1"
            />
          ) : (
            <p className="text-sm text-[var(--text)] break-words">{c.texto}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/5 text-[color:var(--text-dim)]"
              onClick={() => updateCommentReaction(!liked)}
            >
              {liked ? <FaHeart className="text-red-400" /> : <FaRegHeart />}
              {likes}
            </motion.button>
          </div>
        </div>

        {me?.id === c.usuario.id_usuario && (
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)}>
              <HiOutlineDotsVertical />
            </button>

            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-6 bg-black border border-white/10 rounded-lg overflow-hidden z-50 min-w-[120px]"
              >
                {!editing ? (
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-white/10"
                    onClick={() => {
                      setEditing(true);
                      setMenu(false);
                    }}
                  >
                    editar
                  </button>
                ) : (
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-white/10"
                    onClick={() => {
                      updateComment(c.id_comentario, editText);
                      setEditing(false);
                    }}
                  >
                    guardar
                  </button>
                )}

                <button
                  className="w-full text-left px-3 py-2 hover:bg-red-500/20 text-red-400"
                  onClick={() => deleteComment(c.id_comentario)}
                >
                  eliminar
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 text-xs mt-2">
        <button
          className="text-blue-400"
          onClick={() =>
            setReplyTo(
              replyTo === c.id_comentario ? null : Number(c.id_comentario),
            )
          }
        >
          responder
        </button>

        {c.children?.length > 0 && (
          <button className="text-purple-400" onClick={() => setOpen(!open)}>
            {open ? "ocultar" : `ver respuestas (${c.children.length})`}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {replyTo === c.id_comentario && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <CommentInput
              value={replyText}
              onChange={setReplyText}
              onSubmit={() => sendComment(Number(c.id_comentario), replyText)}
              placeholder="responder..."
              buttonLabel="enviar"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendComment(Number(c.id_comentario), replyText);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && c.children?.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 mt-3 border-l border-white/10 pl-3 flex flex-col gap-3"
          >
            {c.children.map((child) => (
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
