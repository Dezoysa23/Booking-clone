/**
 * Premium decorative transition band that sits between page content and the
 * navy footer, replacing the old plain cream gap. Luxury-Botanical style:
 * a cream→navy gradient, soft gold/pearl blurred shapes, faint corner palm
 * leaves, and a centered gold ornament with the brand line. Purely decorative
 * (aria-hidden), static, and lightweight (CSS + inline SVG only).
 */
export function FooterTopDecoration() {
  return (
    <div
      aria-hidden="true"
      className="relative h-40 w-full overflow-hidden md:h-56"
    >
      {/* Warm cream → navy transition (top blends with the page, bottom meets the footer) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(243,232,215,0.55) 30%, rgba(233,216,180,0.42) 52%, #16233f 86%, #14213d 100%)",
        }}
      />

      {/* Soft gold / pearl blurred shapes for depth */}
      <span className="absolute left-[22%] top-4 h-36 w-36 -translate-x-1/2 rounded-full bg-[#c9a86a]/18 blur-3xl" />
      <span className="absolute right-[22%] top-8 h-40 w-40 translate-x-1/2 rounded-full bg-[#e9d8b4]/16 blur-3xl" />

      {/* Thin gold wave accent near the top */}
      <svg
        className="absolute inset-x-0 top-7 h-6 w-full md:top-10"
        viewBox="0 0 1440 40"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 20 C 240 4, 480 36, 720 20 S 1200 4, 1440 20"
          stroke="#c9a86a"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
      </svg>

      {/* Corner palm-leaf outlines */}
      <svg
        className="absolute bottom-0 left-3 h-24 w-24 md:h-32 md:w-32"
        viewBox="0 0 120 120"
        fill="none"
      >
        <g
          transform="translate(30 96) rotate(-32)"
          stroke="#c9a86a"
          strokeWidth="1.4"
          strokeOpacity="0.4"
          strokeLinecap="round"
        >
          <path d="M0 44 C 15 22, 15 -22, 0 -44 C -15 -22, -15 22, 0 44 Z" />
          <path d="M0 40 L0 -40" />
          <path d="M0 16 L 11 2" />
          <path d="M0 16 L -11 2" />
          <path d="M0 -10 L 12 -26" />
          <path d="M0 -10 L -12 -26" />
        </g>
        <g
          transform="translate(58 104) rotate(-8)"
          stroke="#e9d8b4"
          strokeWidth="1.3"
          strokeOpacity="0.32"
          strokeLinecap="round"
        >
          <path d="M0 32 C 11 16, 11 -16, 0 -32 C -11 -16, -11 16, 0 32 Z" />
          <path d="M0 28 L0 -28" />
        </g>
      </svg>
      <svg
        className="absolute bottom-0 right-3 h-24 w-24 md:h-32 md:w-32"
        viewBox="0 0 120 120"
        fill="none"
      >
        <g
          transform="translate(90 96) rotate(32)"
          stroke="#c9a86a"
          strokeWidth="1.4"
          strokeOpacity="0.4"
          strokeLinecap="round"
        >
          <path d="M0 44 C 15 22, 15 -22, 0 -44 C -15 -22, -15 22, 0 44 Z" />
          <path d="M0 40 L0 -40" />
          <path d="M0 16 L 11 2" />
          <path d="M0 16 L -11 2" />
          <path d="M0 -10 L 12 -26" />
          <path d="M0 -10 L -12 -26" />
        </g>
        <g
          transform="translate(62 104) rotate(8)"
          stroke="#e9d8b4"
          strokeWidth="1.3"
          strokeOpacity="0.32"
          strokeLinecap="round"
        >
          <path d="M0 32 C 11 16, 11 -16, 0 -32 C -11 -16, -11 16, 0 32 Z" />
          <path d="M0 28 L0 -28" />
        </g>
      </svg>

      {/* Centered gold ornament + brand line */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2.5 px-4">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c9a86a]/70 md:w-16" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path
              d="M8 0.5 C 8.6 5, 11 7.4, 15.5 8 C 11 8.6, 8.6 11, 8 15.5 C 7.4 11, 5 8.6, 0.5 8 C 5 7.4, 7.4 5, 8 0.5 Z"
              fill="#c9a86a"
            />
          </svg>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c9a86a]/70 md:w-16" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d34] md:text-xs">
          From Coastlines to Hilltops
        </p>
      </div>
    </div>
  );
}
