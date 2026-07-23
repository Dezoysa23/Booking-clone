"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Header chrome that reacts to route + scroll:
 * - On the home route (dark full-bleed hero) it starts transparent and fades to
 *   solid navy once you scroll — the hero shows through behind it (fixed).
 * - Everywhere else it's the usual solid, sticky navy bar.
 * The server <Navbar> passes its inner content as children so auth data stays
 * server-rendered.
 */
export function NavbarChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Routes that open with a dark full-bleed hero the navbar can ride over.
  const overHero = pathname === "/" || pathname.startsWith("/properties/");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // Defer initial read out of the effect body (avoids sync setState-in-effect).
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const transparent = overHero && !scrolled;

  return (
    <header
      className={cn(
        "top-0 z-50 h-16 w-full transition-[background-color,box-shadow,border-color] duration-300",
        overHero ? "fixed inset-x-0" : "sticky",
        // Frosted glass in every state: a light glass band over the hero,
        // a translucent blurred bar once solid.
        transparent
          ? "border-b border-white/10 bg-[#0e1a30]/25 backdrop-blur-md"
          : "border-b border-white/10 bg-[#14213d]/90 shadow-[0_6px_24px_rgba(9,15,30,0.28)] backdrop-blur-xl supports-backdrop-filter:bg-[#14213d]/70",
      )}
    >
      {transparent ? (
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#0b1223]/50 to-transparent" />
      ) : null}
      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-16">
        {children}
      </div>
    </header>
  );
}
