"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Blurred gold/navy gradient blobs that drift on scroll behind dark sections.
 * Parallax is applied by writing transforms directly to the DOM inside a rAF
 * loop (no React state). Skipped entirely for reduced-motion users, who get a
 * calm static backdrop.
 */
export function ParallaxBlobs({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blobs = Array.from(
      host.querySelectorAll<HTMLElement>("[data-speed]"),
    );
    let raf = 0;

    const update = () => {
      const rect = host.getBoundingClientRect();
      // Progress of the section through the viewport (-1 above → 1 below).
      const progress =
        (rect.top + rect.height / 2 - window.innerHeight / 2) /
        (window.innerHeight + rect.height);
      for (const blob of blobs) {
        const speed = Number(blob.dataset.speed) || 0;
        blob.style.transform = `translate3d(0, ${(-progress * speed * 260).toFixed(1)}px, 0)`;
      }
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <span
        data-speed="0.9"
        className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#d9a94d]/20 blur-3xl"
      />
      <span
        data-speed="1.4"
        className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-[#e8c892]/12 blur-3xl"
      />
      <span
        data-speed="0.6"
        className="absolute bottom-[-4rem] left-1/3 h-64 w-64 rounded-full bg-[#0e1a30]/50 blur-3xl"
      />
    </div>
  );
}
