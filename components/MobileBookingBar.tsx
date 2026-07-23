"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-only sticky booking bar for the Hotel Detail page. Keeps the price +
 * Reserve action reachable without scrolling to the form. Slides away once the
 * booking form (`#book`) is on screen so it never doubles up with the form's
 * own Reserve button. Hidden on lg+ where the sticky sidebar is visible.
 */
export default function MobileBookingBar({ price }: { price: number }) {
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const target = document.getElementById("book");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setAtForm(entry.isIntersecting),
      { rootMargin: "-96px 0px 0px 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#e7ddc9] bg-white/95 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        atForm ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ boxShadow: "0 -6px 24px rgba(43,32,22,0.12)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div>
          <p className="text-xs text-[#7c879b]">from</p>
          <p className="font-(family-name:--font-playfair-display) text-xl font-semibold leading-none text-[#14213d]">
            LKR {price.toLocaleString()}
            <span className="text-xs font-normal text-[#7c879b]"> / night</span>
          </p>
        </div>
        <a
          href="#book"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#d9a94d] px-7 py-3 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f]"
        >
          <span className="material-symbols-outlined text-xl leading-none" aria-hidden="true">
            event_available
          </span>
          Reserve
        </a>
      </div>
    </div>
  );
}
