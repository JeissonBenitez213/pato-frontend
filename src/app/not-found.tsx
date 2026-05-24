"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-6 w-screen min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Número 404 con efecto leve de “glitch” */}
        <motion.h1
          className="text-6xl font-bold tracking-tight"
          animate={{
            x: [0, -2, 2, -2, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          404
        </motion.h1>

        {/* Título */}
        <h2 className="text-2xl mt-4 font-semibold">Not Found</h2>

        {/* Descripción */}
        <p className="text-white/60 mt-2">Could not find requested resource</p>

        {/* Botón link */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6"
        >
          <Link
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-white text-black font-medium"
          >
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
