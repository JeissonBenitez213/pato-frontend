"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-black text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner animado */}
        <motion.div
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1,
          }}
        />

        {/* Texto animado */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.8,
          }}
          className="text-sm tracking-widest uppercase text-white/70"
        >
          Loading...
        </motion.p>

        {/* Skeleton UI simulado */}
        <div className="flex flex-col gap-2 w-48">
          <motion.div
            className="h-3 bg-white/10 rounded"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <motion.div
            className="h-3 bg-white/10 rounded w-5/6"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
          <motion.div
            className="h-3 bg-white/10 rounded w-3/4"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
          />
        </div>
      </div>
    </div>
  );
}
