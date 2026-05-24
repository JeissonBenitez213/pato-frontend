"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fileUrl } from "@/lib/api";

interface UserInfoPanelProps {
  user: {
    id_usuario: number;
    nombre_usuario: string;
    avatar?: string | null;
    descripcion?: string | null;
  };
}

export default function UserInfoPanel({ user }: UserInfoPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 text-left"
      >
        <img
          src={fileUrl(user.avatar) || ""}
          alt={user.nombre_usuario}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <p className="text-sm text-gray-400">Publicado por</p>
          <p className="text-lg font-semibold">@{user.nombre_usuario}</p>
        </div>

        <span className="text-xs text-purple-300">
          {expanded ? "ocultar" : "ver más"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-4"
          >
            <p className="text-sm text-[var(--text)] whitespace-pre-line">
              {user.descripcion || "Este usuario no tiene descripción."}
            </p>

            <Link href={`/profile/${user.id_usuario}`}>
              <button
                type="button"
                className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Ver perfil
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
