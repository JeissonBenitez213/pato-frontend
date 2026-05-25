"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { api, tryRefresh } from "@/lib/api";
import {
  GET_MESSAGES_QUERY,
  CREATE_MESSAGE_MUTATION,
  FIND_ONE_USER_QUERY,
} from "@/lib/queries";

import type { Message } from "@/lib/types";

/* =========================
   TYPES
========================= */
type Me = {
  id: number;
  nombre_usuario: string;
  is_admin: boolean;
};

type UserProfile = {
  id_usuario: number;
  nombre_usuario: string;
  avatar?: string;
};

/* =========================
   AUTH WRAPPER
========================= */
async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isAuthError =
      err?.status === 401 ||
      err?.status === 403 ||
      err?.message?.includes("No access token");

    if (!isAuthError) throw err;

    const refreshed = await tryRefresh();

    if (!refreshed) throw err;

    return await fn();
  }
}

/* =========================
   AVATAR RESOLVER
========================= */
function resolveAvatar(avatar?: string) {
  if (!avatar) return null;

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";

  return `${base.replace(/\/$/, "")}/${avatar.replace(/^\//, "")}`;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const avatarUrl = resolveAvatar(user?.avatar);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const meData = await withAuth(() => api.me());
        setMe(meData);

        const userRes = await withAuth(() =>
          api.gql<{
            findOneUser: UserProfile;
          }>(FIND_ONE_USER_QUERY, {
            id_user: Number(id),
          }),
        );

        setUser(userRes.findOneUser);

        const res = await withAuth(() =>
          api.gql<{ getMessages: Message[] }>(GET_MESSAGES_QUERY, {
            input: {
              id_usuario_envia: meData.id,
              id_usuario_recibe: Number(id),
            },
          }),
        );

        setMessages(res.getMessages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* =========================
     POLLING
  ========================= */
  useEffect(() => {
    if (!me) return;

    const interval = setInterval(async () => {
      try {
        const res = await withAuth(() =>
          api.gql<{ getMessages: Message[] }>(GET_MESSAGES_QUERY, {
            input: {
              id_usuario_envia: me.id,
              id_usuario_recibe: Number(id),
            },
          }),
        );

        setMessages(res.getMessages);
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [me, id]);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */
  async function sendMessage() {
    if (!text.trim() || !me) return;

    try {
      await withAuth(() =>
        api.gql(CREATE_MESSAGE_MUTATION, {
          input: {
            id_usuario_envia: me.id,
            id_usuario_recibe: Number(id),
            texto: text,
          },
        }),
      );

      setText("");

      const res = await withAuth(() =>
        api.gql<{ getMessages: Message[] }>(GET_MESSAGES_QUERY, {
          input: {
            id_usuario_envia: me.id,
            id_usuario_recibe: Number(id),
          },
        }),
      );

      setMessages(res.getMessages);
    } catch (e) {
      console.error(e);
    }
  }

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-primary)] text-white">
        Cargando chat...
      </div>
    );
  }

  if (!me) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-primary)] text-red-400">
        Error cargando usuario
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--color-primary)] text-white">
      {/* HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-[var(--color-secondary)]/40 backdrop-blur-md"
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {/* BACK BUTTON */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/feed")}
            className="rounded-lg px-3 py-2 bg-black/20 hover:bg-black/30 border border-white/10 text-sm"
          >
            ← Feed
          </motion.button>

          {/* AVATAR */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="h-10 w-10 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[var(--color-acent)] flex items-center justify-center text-sm font-bold">
                {user?.nombre_usuario?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border border-black" />
          </div>

          {/* NAME */}
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">
              {user?.nombre_usuario ?? "Usuario"}
            </span>
            <span className="text-xs text-white/50">conversación privada</span>
          </div>
        </div>
      </motion.div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isMe = m.id_usuario_envia === me.id;

            return (
              <motion.div
                key={m.id_mensaje}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`max-w-[70%] px-4 py-2 text-sm rounded-2xl shadow-md ${
                  isMe
                    ? "ml-auto bg-[var(--color-acent)] text-white"
                    : "bg-[var(--color-secondary)] text-white"
                }`}
              >
                {m.texto}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex gap-2 border-t border-white/10 p-3 bg-[var(--color-secondary)]/30 backdrop-blur-md"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-xl bg-black/30 px-4 py-2 text-white outline-none border border-white/10 focus:border-[var(--color-acent)] transition"
          placeholder="Escribe un mensaje..."
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={sendMessage}
          className="rounded-xl bg-[var(--color-acent)] px-5 py-2 font-medium shadow-lg shadow-black/30"
        >
          Enviar
        </motion.button>
      </motion.div>
    </div>
  );
}
