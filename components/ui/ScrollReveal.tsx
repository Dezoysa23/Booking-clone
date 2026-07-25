"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}

export default function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  // Respect prefers-reduced-motion: a gentle fade only, no movement.
  const initial = reduce
    ? { opacity: 0, x: 0, y: 0 }
    : direction === "left"
      ? { opacity: 0, x: -32, y: 0 }
      : direction === "right"
        ? { opacity: 0, x: 32, y: 0 }
        : direction === "none"
          ? { opacity: 0, x: 0, y: 0 }
          : { opacity: 0, x: 0, y: 30 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={
        reduce
          ? { duration: 0.25, delay: 0 }
          : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
