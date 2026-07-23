"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/results",
    label: "Browse Stays",
    match: (p: string) => p.startsWith("/results") || p.startsWith("/properties"),
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    match: (p: string) => p.startsWith("/how-it-works"),
  },
  {
    href: "/bookings",
    label: "My Bookings",
    match: (p: string) => p.startsWith("/bookings"),
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm tracking-wide transition-colors",
              active
                ? "border-b-2 border-[#d9a94d] pb-0.5 font-semibold text-white"
                : "font-medium text-white/60 hover:text-white/90",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
