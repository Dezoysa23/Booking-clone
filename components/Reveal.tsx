"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-reveal wrapper. Progressive enhancement: children render visible by
 * default; only when motion is allowed does JS hide then fade+lift them in as
 * they enter the viewport. Uses class toggles (no state) so there's no
 * hydration flash and no re-render churn.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger in ms. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("reveal-init");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.remove("reveal-init");
          el.classList.add("reveal-in");
          io.disconnect();
        }
      },
      // threshold 0 so tall blocks (e.g. a full results list) reveal as soon as
      // they enter — a percentage threshold can never be met when only a sliver
      // shows at the fold, leaving content stuck hidden.
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
