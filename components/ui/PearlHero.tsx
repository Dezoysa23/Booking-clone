"use client";

import { motion } from "framer-motion";

/**
 * PearlHero — warm ivory/champagne "pearl" centrepiece for the hero (xl+ only).
 * Decorative and non-interactive.
 */
export default function PearlHero() {
  return (
    <div
      className="absolute right-[7%] top-1/2 -translate-y-[52%] hidden xl:flex items-center justify-center pointer-events-none select-none z-10"
      aria-hidden="true"
      style={{ width: 220, height: 220 }}
    >
      {/* Outer ambient ring 1 (gold) */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border border-[#D9A94D]/25"
      />
      {/* Outer ambient ring 2 (light gold) */}
      <motion.div
        animate={{ scale: [1, 1.07, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute rounded-full border border-[#E8C892]/20"
        style={{ inset: -24 }}
      />

      {/* Ambient champagne glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(217,169,77,0.20) 0%, rgba(232,200,146,0.09) 55%, transparent 80%)",
          filter: "blur(22px)",
          transform: "scale(1.6)",
        }}
      />

      {/* Floating pearl sphere — ivory to champagne */}
      <motion.div
        animate={{ y: [0, -18, 0], rotateZ: [0, 2, 0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ width: 120, height: 120 }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 35%, #ffffff 0%, rgba(248,242,233,0.96) 28%, rgba(232,200,146,0.85) 58%, rgba(217,169,77,0.62) 85%, rgba(160,120,45,0.42) 100%)",
            boxShadow: [
              "0 0 48px rgba(217,169,77,0.4)",
              "0 0 90px rgba(217,169,77,0.2)",
              "inset 0 2px 18px rgba(255,255,255,0.9)",
              "inset 0 -8px 28px rgba(180,140,60,0.4)",
              "0 16px 48px rgba(20,33,61,0.55)",
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
                "radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 60%, transparent 100%)",
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
          className="absolute text-[#D9A94D] leading-none"
          style={{ top: -18, right: -14, fontSize: 28 }}
        >
          ✦
        </motion.span>
        {/* Small sparkle — bottom left */}
        <motion.span
          animate={{ opacity: [0.25, 0.75, 0.25], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          className="absolute text-[#D9A94D]/60 leading-none"
          style={{ bottom: -8, left: -16, fontSize: 16 }}
        >
          ✦
        </motion.span>
      </motion.div>
    </div>
  );
}
