"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Client shell for the navbar chrome.
 * - Home route: fixed + transparent while at the top, fading to solid navy on
 *   scroll, so the full-bleed hero image reaches the very top under it.
 * - All other routes: sticky + solid navy (identical to the previous behavior),
 *   so page layouts are unaffected.
 */
export default function NavbarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      const raf = requestAnimationFrame(() => setScrolled(false));
      return () => cancelAnimationFrame(raf);
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} top-0 inset-x-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-gradient-to-b from-[#14213D]/70 via-[#14213D]/20 to-transparent"
          : "bg-[#14213D]/95 backdrop-blur-md border-b border-white/10 shadow-[0_2px_20px_rgba(20,33,61,0.22)]"
      }`}
    >
      {children}
    </header>
  );
}
