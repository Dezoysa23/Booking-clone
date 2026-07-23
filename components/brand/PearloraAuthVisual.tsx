import Image from "next/image";
import Link from "next/link";

const TRUST_BADGES = [
  { icon: "verified_user",  label: "Verified Stays",   sub: "Every property is quality-checked" },
  { icon: "lock",           label: "Secure Booking",   sub: "256-bit encrypted transactions"    },
  { icon: "groups",         label: "Trusted Hosts",    sub: "5,000+ five-star guest reviews"    },
];

export default function PearloraAuthVisual() {
  return (
    <div className="relative flex flex-col justify-between h-full w-full px-10 py-10 overflow-hidden select-none">

      {/* ── Background orbs ── */}
      <div className="auth-orb-1 pointer-events-none absolute -top-16 -left-10 h-72 w-72 rounded-full bg-[#2A3A5C]/28 blur-3xl" />
      <div className="auth-orb-2 pointer-events-none absolute -bottom-12 -right-8 h-60 w-60 rounded-full bg-[#D9A94D]/12 blur-3xl" />
      <div className="auth-orb-3 pointer-events-none absolute top-2/5 -right-14 h-48 w-48 rounded-full bg-[#16233F]/22 blur-3xl" />

      {/* ── Logo ── */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 w-fit">
        <Image
          src="/brand/pearlora-logo.jpg"
          alt="Pearlora"
          width={36}
          height={36}
          className="rounded-lg object-contain"
          unoptimized
        />
        <span className="font-[family-name:var(--font-playfair-display)] text-white text-2xl font-semibold">
          Pearlora
        </span>
      </Link>

      {/* ── Floating booking card + headline ── */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tagline */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-10 bg-[#D9A94D]/45" />
            <span className="text-[#D9A94D] text-[10px] font-semibold tracking-[0.22em] uppercase">
              Sri Lanka&apos;s Premier Stays
            </span>
            <span className="h-px w-10 bg-[#D9A94D]/45" />
          </div>
          <h2 className="font-[family-name:var(--font-playfair-display)] text-white text-[1.6rem] font-semibold leading-snug">
            Discover Extraordinary<br />Places to Stay
          </h2>
        </div>

        {/* 3D floating booking card */}
        <div
          className="auth-booking-card w-full max-w-[292px] rounded-2xl overflow-hidden border border-white/12 select-none"
          style={{
            boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card image header */}
          <div
            className="relative h-36 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #0369a1 0%, #0891b2 35%, #2A3A5C 65%, #0a4fa6 100%)",
            }}
          >
            {/* Light sheen */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 22% 44%, rgba(255,255,255,0.45) 0%, transparent 52%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.25) 0%, transparent 40%)",
              }}
            />
            {/* Subtle wave lines */}
            <svg
              className="absolute bottom-0 left-0 w-full opacity-15"
              viewBox="0 0 292 40"
              preserveAspectRatio="none"
            >
              <path d="M0 30 Q73 10 146 25 Q219 40 292 20 L292 40 L0 40Z" fill="white" />
            </svg>

            {/* Property info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
              <div className="flex items-center gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-[#D9A94D] text-xs leading-none">★</span>
                ))}
                <span className="text-white/60 text-[10px] ml-1.5">4.9 · 128 reviews</span>
              </div>
              <p className="font-[family-name:var(--font-playfair-display)] text-white text-[15px] font-semibold leading-tight">
                Sea View Villa
              </p>
              <p className="text-white/55 text-[11px] mt-0.5">📍 Mirissa, Sri Lanka</p>
            </div>
          </div>

          {/* Card body */}
          <div
            className="px-4 pt-3.5 pb-4"
            style={{ background: "rgba(10,24,53,0.85)", backdropFilter: "blur(8px)" }}
          >
            {/* Dates row */}
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <p className="text-white/38 text-[9px] uppercase tracking-wider mb-0.5">Check-in</p>
                <p className="text-white text-sm font-semibold">12 Aug</p>
              </div>
              <div className="flex-1 mx-2 flex items-center gap-1">
                <div className="flex-1 h-px bg-white/18" />
                <span className="text-white/30 text-[10px]">→</span>
                <div className="flex-1 h-px bg-white/18" />
              </div>
              <div className="text-right">
                <p className="text-white/38 text-[9px] uppercase tracking-wider mb-0.5">Check-out</p>
                <p className="text-white text-sm font-semibold">16 Aug</p>
              </div>
              <div className="ml-3 text-right">
                <p className="text-white/38 text-[9px] uppercase tracking-wider mb-0.5">Guests</p>
                <p className="text-white text-sm font-semibold">2</p>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-wider">per night</p>
                <p className="text-[#D9A94D] text-base font-bold tracking-tight">LKR 24,000</p>
              </div>
              <div className="bg-[#D9A94D] text-[#14213D] text-[11px] font-bold px-3.5 py-1.5 rounded-lg tracking-wide">
                Book Now →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="relative z-10 flex flex-col gap-4">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#D9A94D] text-base">{badge.icon}</span>
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold leading-none">{badge.label}</p>
              <p className="text-white/38 text-[11px] mt-0.5 leading-tight">{badge.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
