"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Pointer-tracked 3D tilt card. Writes CSS custom props (--rx/--ry/--tz) that
 * the `.tilt-card` rule (globals.css) turns into a perspective transform.
 * No React state — direct style writes keep it cheap. Honors reduced-motion by
 * skipping the tilt entirely (the card just sits flat).
 */
export function TiltCard({
  children,
  className,
  max = 7,
  lift = 12,
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** translateZ lift in px on hover. */
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--tz", `${lift}px`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tz", "0px");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cn("tilt-card", className)}
    >
      {children}
    </div>
  );
}
