"use client";

import { motion } from "framer-motion";

export default function PearlHero() {
  return (
    <div
      className="absolute right-[7%] top-1/2 -translate-y-[52%] hidden xl:flex items-center justify-center pointer-events-none select-none z-10"
      aria-hidden="true"
      style={{ width: 220, height: 220 }}
    >
      {/* Outer ambient ring 1 */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-[#D8B45A]/20"
      />
      {/* Outer ambient ring 2 */}
      <motion.div
        animate={{ scale: [1, 1.07, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute rounded-full border border-[#1D63D8]/15"
        style={{ inset: -24 }}
      />

      {/* Ambient glow blob */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(29,99,216,0.18) 0%, rgba(216,180,90,0.07) 55%, transparent 80%)",
          filter: "blur(22px)",
          transform: "scale(1.6)",
        }}
      />

      {/* Floating pearl sphere */}
      <motion.div
        animate={{ y: [0, -18, 0], rotateZ: [0, 2, 0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ width: 120, height: 120 }}
      >
        {/* Pearl main body */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 35%, #ffffff 0%, rgba(210,228,255,0.95) 28%, rgba(148,186,234,0.82) 58%, rgba(72,120,192,0.6) 85%, rgba(40,80,160,0.4) 100%)",
            boxShadow: [
              "0 0 48px rgba(18,62,175,0.45)",
              "0 0 90px rgba(18,62,175,0.22)",
              "0 0 150px rgba(18,62,175,0.1)",
              "inset 0 2px 18px rgba(255,255,255,0.9)",
              "inset 0 -8px 28px rgba(70,120,200,0.45)",
              "0 16px 48px rgba(7,27,99,0.6)",
            ].join(", "),
          }}
        >
          {/* Primary specular highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: "14%",
              left: "18%",
              width: "40%",
              height: "22%",
              background:
                "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.3) 60%, transparent 100%)",
              filter: "blur(2.5px)",
            }}
          />
          {/* Secondary soft highlight */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: "22%",
              right: "18%",
              width: "20%",
              height: "12%",
              background:
                "radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 100%)",
              filter: "blur(3px)",
            }}
          />
        </div>

        {/* Gold sparkle — top right */}
        <motion.span
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.85, 1.2, 0.85] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute text-[#D8B45A] leading-none"
          style={{ top: -18, right: -14, fontSize: 28 }}
        >
          ✦
        </motion.span>

        {/* Small sparkle — bottom left */}
        <motion.span
          animate={{ opacity: [0.25, 0.75, 0.25], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          className="absolute text-[#D8B45A]/60 leading-none"
          style={{ bottom: -8, left: -16, fontSize: 16 }}
        >
          ✦
        </motion.span>
      </motion.div>
    </div>
  );
}
