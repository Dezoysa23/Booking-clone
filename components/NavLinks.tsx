"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  const active =
    "text-white text-sm font-semibold border-b-2 border-[#D8B45A] pb-0.5 tracking-wide";
  const inactive =
    "text-white/55 hover:text-white/90 transition-colors text-sm font-medium tracking-wide";

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link href="/" className={pathname === "/" ? active : inactive}>
        Home
      </Link>
      <Link
        href="/bookings"
        className={pathname.startsWith("/bookings") ? active : inactive}
      >
        My Bookings
      </Link>
    </nav>
  );
}
