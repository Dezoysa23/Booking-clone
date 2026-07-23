"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/host/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/host/properties", label: "Properties", icon: "apartment" },
  { href: "/host/billing", label: "Billing", icon: "receipt_long" },
];

/** Mobile navigation drawer for the host portal (shown below md). */
export default function HostMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

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

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="host-mobile-drawer"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
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
          id="host-mobile-drawer"
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={close}
          />
          <div className="absolute right-0 top-0 flex h-full w-[84%] max-w-xs flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
                Host Portal
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {ITEMS.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                    isActive(it.href)
                      ? "bg-[#f4ecd8] text-[#14213d]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#14213d]",
                  )}
                >
                  <span
                    className="material-symbols-outlined text-xl leading-none text-[#d9a94d]"
                    aria-hidden="true"
                  >
                    {it.icon}
                  </span>
                  {it.label}
                </Link>
              ))}

              <div className="my-3 h-px bg-slate-200" />

              <Link
                href="/"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14213d]"
              >
                <span
                  className="material-symbols-outlined text-xl leading-none text-[#d9a94d]"
                  aria-hidden="true"
                >
                  open_in_new
                </span>
                View site
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
