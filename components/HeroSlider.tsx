"use client";

/**
 * HeroSlider — full-screen immersive image slider for the Pearlora homepage.
 *
 * Features:
 *  - Smooth crossfade transitions via Framer Motion AnimatePresence
 *  - Ken Burns slow-zoom effect on each slide (GPU-accelerated CSS transform)
 *  - Auto-advance every 6 s, reset on any user interaction
 *  - Touch/swipe support (mobile-first, threshold 48 px)
 *  - Prev/Next arrow buttons (visible on sm+ screens)
 *  - Navigation dot indicators with active pill expansion
 *  - Auto-advance progress bar (thin gold line at bottom of slide)
 *  - prefers-reduced-motion: all animations are skipped instantly
 *  - Per-slide destination badge (top-left, animated on change)
 *  - Static headline, subtitle, and CTAs — only the background image changes
 *  - PearlHero 3D pearl orb (desktop only) remains centred across all slides
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import PearlHero from "@/components/ui/PearlHero";

// ── Slide data ────────────────────────────────────────────────────────────────

interface Slide {
  src: string;
  alt: string;
  label: string;
  location: string;
}

const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2069&auto=format&fit=crop",
    alt: "Luxury private-pool villa overlooking the Sri Lankan coast",
    label: "Coastal Villas",
    location: "Southern Coast",
  },
  {
    src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2069&auto=format&fit=crop",
    alt: "Elegant beachfront resort at golden hour",
    label: "Beachfront Resorts",
    location: "Mirissa",
  },
  {
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2069&auto=format&fit=crop",
    alt: "Infinity pool with panoramic ocean view at sunset",
    label: "Infinity Estates",
    location: "Ella & Nuwara Eliya",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2069&auto=format&fit=crop",
    alt: "Golden sunrise over the shores of Galle",
    label: "Beach Retreats",
    location: "Galle",
  },
];

const INTERVAL_MS = 6000;

// ── Component ────────────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const touchStartX = useRef(0);

  // ── Timer management ────────────────────────────────────────────────────────

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS
    );
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
      resetTimer();
    },
    [resetTimer]
  );

  // ── Touch / swipe ───────────────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) goTo(index + (delta > 0 ? 1 : -1));
  };

  // ── Animation presets ───────────────────────────────────────────────────────

  const crossfade = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number] };

  const kenBurns = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 7.5, ease: "linear" as const };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full h-[480px] md:h-[620px] rounded-3xl overflow-hidden shadow-[0_12px_60px_rgba(15,31,61,0.22)] select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Pearlora featured destinations"
    >

      {/* ── Slide backgrounds ─────────────────────────────────────────────── */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={crossfade}
          aria-hidden
        >
          {/* Ken Burns: slow zoom from 1.07 → 1.0 */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: prefersReducedMotion ? 1 : 1.07 }}
            animate={{ scale: 1 }}
            transition={kenBurns}
          >
            <Image
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              fill
              style={{ objectFit: "cover" }}
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1280px"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlays (static) ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#060f22]/80 via-[#071B63]/30 to-[#0a1a2e]/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060f22]/72 via-transparent to-transparent" />

      {/* ── Pearl 3D centerpiece (desktop only) ───────────────────────────── */}
      <PearlHero />

      {/* ── Destination badge (top-left, changes per slide) ──────────────── */}
      <div className="absolute top-5 left-5 z-30 pointer-events-none" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.span
            key={`badge-${index}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 7 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-black/28 backdrop-blur-sm px-3.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8B45A]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
              {SLIDES[index].label}
            </span>
            <span className="mx-0.5 text-white/30">·</span>
            <span className="text-[10px] tracking-wide text-white/55">
              {SLIDES[index].location}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Hero content (static across all slides) ───────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 pb-14 text-center">

        {/* Eyebrow */}
        <div className="pointer-events-none mb-7 flex items-center justify-center gap-4">
          <span className="hidden h-px w-14 bg-gradient-to-r from-transparent to-[#D8B45A]/70 sm:block" />
          <div className="flex items-center gap-2.5">
            <span className="text-sm leading-none text-[#D8B45A]">✦</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D8B45A]">
              Sri Lanka&apos;s Premier Booking Platform
            </span>
            <span className="text-sm leading-none text-[#D8B45A]">✦</span>
          </div>
          <span className="hidden h-px w-14 bg-gradient-to-l from-transparent to-[#D8B45A]/70 sm:block" />
        </div>

        {/* Headline */}
        <h1
          className="pointer-events-none mb-5 max-w-3xl font-[family-name:var(--font-playfair-display)] font-semibold leading-[1.12] text-white"
          style={{ fontSize: "clamp(2rem, 5.2vw, 3.9rem)", letterSpacing: "-0.01em" }}
        >
          Discover Extraordinary Stays
          <br className="hidden md:block" /> Across Sri Lanka
        </h1>

        {/* Sub-headline */}
        <p className="pointer-events-none max-w-xl text-base font-light leading-relaxed text-white/72 md:text-lg">
          From colonial coastal forts to misty highland estates —
          <br className="hidden md:block" /> Pearlora curates rare stays for the discerning traveller.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center gap-5">
          <Link
            href="/results?destination="
            className="rounded-full bg-[#D8B45A] px-8 py-3 text-sm font-bold text-[#0f1f3d] shadow-[0_4px_20px_rgba(216,180,90,0.35)] transition-colors hover:bg-[#e8c96a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B45A]"
          >
            Explore Stays
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            How it works
            <span className="material-symbols-outlined text-base" aria-hidden>arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* ── Prev / Next buttons (sm+) ─────────────────────────────────────── */}
      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous destination"
        className="absolute left-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden>chevron_left</span>
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next destination"
        className="absolute right-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden>chevron_right</span>
      </button>

      {/* ── Dot / pill navigation ─────────────────────────────────────────── */}
      <div
        className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2"
        role="tablist"
        aria-label="Slide navigation"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === index}
            aria-label={`${slide.label} — ${slide.location}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "h-1.5 w-6 bg-[#D8B45A]"
                : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* ── Auto-advance progress bar ─────────────────────────────────────── */}
      {!prefersReducedMotion && (
        <motion.div
          key={`progress-${index}`}
          className="pointer-events-none absolute bottom-0 left-0 z-30 h-0.5 bg-[#D8B45A]/55"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
          aria-hidden
        />
      )}
    </div>
  );
}
