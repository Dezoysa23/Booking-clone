"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { cn } from "@/lib/cn";

export interface MobileNavProps {
  isLoggedIn: boolean;
  showAdmin: boolean;
  showHostPortal: boolean;
  name: string;
}

interface Item {
  href: string;
  label: string;
  icon: string;
}

export default function MobileNav({
  isLoggedIn,
  showAdmin,
  showHostPortal,
  name,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const primary: Item[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/results", label: "Browse Stays", icon: "travel_explore" },
    { href: "/how-it-works", label: "How It Works", icon: "help" },
  ];
  if (isLoggedIn)
    primary.push({ href: "/bookings", label: "My Bookings", icon: "luggage" });

  const roleItems: Item[] = [];
  if (showAdmin)
    roleItems.push({
      href: "/admin",
      label: "Admin Console",
      icon: "shield_person",
    });
  if (showHostPortal)
    roleItems.push({
      href: "/host/dashboard",
      label: "Host Portal",
      icon: "space_dashboard",
    });
  if (!showAdmin && !showHostPortal)
    roleItems.push({
      href: "/become-a-host",
      label: "Become a Host",
      icon: "add_home_work",
    });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
      isActive(href)
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white",
    );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          menu
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          id="mobile-drawer"
        >
          <div
            className="absolute inset-0 bg-[#14213d]/60 backdrop-blur-[2px]"
            onClick={close}
          />
          <div className="section-navy absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <Link href="/" onClick={close} className="flex items-center gap-2.5">
                <Image
                  src="/brand/Pearlora-logo-only.png"
                  alt="Pearlora"
                  width={28}
                  height={28}
                  className="shrink-0 rounded-md object-contain"
                />
                <span className="font-(family-name:--font-playfair-display) text-lg font-semibold text-white">
                  Pearlora
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {primary.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className={linkClass(it.href)}
                >
                  <span
                    className="material-symbols-outlined text-xl leading-none text-[#e8c892]"
                    aria-hidden="true"
                  >
                    {it.icon}
                  </span>
                  {it.label}
                </Link>
              ))}

              <div className="my-3 h-px bg-white/10" />

              {roleItems.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className={linkClass(it.href)}
                >
                  <span
                    className="material-symbols-outlined text-xl leading-none text-[#e8c892]"
                    aria-hidden="true"
                  >
                    {it.icon}
                  </span>
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-4">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <Link
                    href="/account"
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition-colors hover:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9a94d]/20 text-[#e8c892]">
                      <span
                        className="material-symbols-outlined text-xl leading-none"
                        aria-hidden="true"
                      >
                        person
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">
                        {name}
                      </span>
                      <span className="block text-xs text-white/50">
                        View account
                      </span>
                    </span>
                  </Link>
                  <LogoutButton className="w-full justify-center bg-white/5 text-white/80 hover:bg-white/10 hover:text-white" />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-bold text-[#14213d] transition-colors hover:bg-[#e8c892]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
