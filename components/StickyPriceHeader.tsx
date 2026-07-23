"use client";

import { useEffect, useState } from "react";

/**
 * Fixed mini price-header for the hotel detail page. Fades in once the main
 * title scrolls out of view. Watches the element with id=`watchId` via an
 * IntersectionObserver (no scroll polling). The Reserve button jumps to the
 * booking form anchor.
 */
export default function StickyPriceHeader({
  name,
  rating,
  price,
  watchId,
  bookHref = "#book",
}: {
  name: string;
  rating: number;
  price: number;
  watchId: string;
  bookHref?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div
      className={`fixed inset-x-0 top-16 z-30 hidden border-b border-[#e7ddc9] bg-[#f8f2e9]/95 backdrop-blur-md transition-[opacity,transform] duration-300 lg:block ${
        shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-hidden={!shown}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14213d] sm:flex">
            <span className="material-symbols-outlined filled text-base text-[#e8c892]" aria-hidden="true">
              star
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              {name}
            </p>
            <p className="text-xs text-[#7c879b]">
              {rating.toFixed(1)} rating · from LKR {price.toLocaleString()}/night
            </p>
          </div>
        </div>
        <a
          href={bookHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#d9a94d] px-5 py-2 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f]"
        >
          Reserve
        </a>
      </div>
    </div>
  );
}
