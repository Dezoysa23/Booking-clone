/**
 * BotanicalMargins — a single, page-wide "Luxury Botanical" decorative layer that
 * fills the empty cream margins on either side of the centred content column.
 *
 * How it works:
 *  - Rendered once in the root layout, it is `fixed`, `-z-10`, and pointer-events-none,
 *    so it sits BEHIND all page content and never blocks interaction or a11y.
 *  - Two vertical "vine" bands hug the left/right viewport edges. Their width is the
 *    real outer margin — `calc((100vw - contentColumn) / 2)` — so they never overlap
 *    the ~1180–1280px content column, only the blank cream gutters beside it.
 *  - Because it is `-z-10`, any opaque in-flow section (the hero image, the dark
 *    footer, dark cards) paints OVER it — so botanical appears only across the cream
 *    content areas, exactly where the page is otherwise blank.
 *  - Gated to wide screens (>=1440px) where those margins are actually wide enough to
 *    decorate; hidden on laptops/tablets/mobile so it never crowds the content.
 *  - A top/bottom luminance mask fades the bands gently near the navbar and footer.
 *  - Purely CSS/SVG, no animation — safe for reduced-motion and cheap to render.
 */

/** A single elegant palm frond drawn as thin line-art (no fill). */
function Frond({ className = "" }: { className?: string }) {
  // Leaflets branch symmetrically off a gently curved spine.
  const leaflets = [
    { t: 0.16, len: 46, ang: 38 },
    { t: 0.3, len: 58, ang: 33 },
    { t: 0.45, len: 64, ang: 30 },
    { t: 0.6, len: 60, ang: 27 },
    { t: 0.74, len: 50, ang: 24 },
    { t: 0.86, len: 38, ang: 21 },
  ];
  // Spine as a quadratic curve from base (bottom) to tip (top).
  const bx = 120,
    by = 400,
    tx = 96,
    ty = 24,
    cx = 40,
    cy = 200;
  const pointAt = (t: number) => ({
    x: (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * tx,
    y: (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * ty,
  });

  return (
    <svg
      viewBox="0 0 160 420"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Spine */}
      <path
        d={`M ${bx} ${by} Q ${cx} ${cy} ${tx} ${ty}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {leaflets.map(({ t, len, ang }, i) => {
        const p = pointAt(t);
        const rad = (Math.PI / 180) * ang;
        // Two leaflets per node, curving upward toward the tip.
        const rx = p.x + Math.cos(rad) * len;
        const ry = p.y - Math.sin(rad) * len * 0.8;
        const lx = p.x - Math.cos(rad) * len;
        const ly = p.y - Math.sin(rad) * len * 0.8;
        return (
          <g key={i}>
            <path
              d={`M ${p.x} ${p.y} Q ${(p.x + rx) / 2 + 8} ${(p.y + ry) / 2} ${rx} ${ry}`}
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
            <path
              d={`M ${p.x} ${p.y} Q ${(p.x + lx) / 2 - 8} ${(p.y + ly) / 2} ${lx} ${ly}`}
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** A single leaf drawn as thin line-art with a midrib + veins (no fill). */
function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 120"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M30 3 C 10 32, 10 88, 30 117 C 50 88, 50 32, 30 3 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M30 8 L 30 112" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M30 34 L 18 44 M30 34 L 42 44 M30 56 L 15 68 M30 56 L 45 68 M30 78 L 19 88 M30 78 L 41 88"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * One margin band. Composition is authored for the LEFT side; the RIGHT side simply
 * mirrors it with `-scale-x-100` so the fronds arc symmetrically inward on both sides.
 */
function Band({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`absolute inset-y-0 w-[calc((100vw-1180px)/2)] max-w-[460px] overflow-hidden ${
        isLeft ? "left-0" : "right-0"
      }`}
    >
      <div
        className={`relative h-full w-full ${isLeft ? "" : "-scale-x-100"}`}
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)",
        }}
      >
        {/* Warm gold / pearl glow hugging the outer edge for depth */}
        <div
          className="absolute -left-24 top-[24%] h-96 w-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(217,169,77,0.22) 0%, rgba(232,200,146,0.12) 45%, transparent 72%)",
          }}
        />
        {/* Primary large frond — base low-outer, arcing up and inward */}
        <Frond className="absolute -left-[8%] top-[7%] h-[52%] w-auto text-[#D9A94D]/60" />
        {/* Secondary frond lower down, dimmer + vertically flipped for a fuller column */}
        <Frond className="absolute left-[6%] bottom-[5%] h-[40%] w-auto -scale-y-100 text-[#C99A3F]/38" />
        {/* Leaf sprigs woven between the fronds */}
        <Leaf className="absolute left-[14%] top-[41%] h-24 w-auto rotate-[24deg] text-[#D9A94D]/50" />
        <Leaf className="absolute left-[30%] top-[55%] h-16 w-auto -rotate-[18deg] text-[#C99A3F]/42" />
        <Leaf className="absolute left-[4%] top-[65%] h-20 w-auto rotate-[8deg] text-[#D9A94D]/40" />
      </div>
    </div>
  );
}

export default function BotanicalMargins() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden min-[1440px]:block"
    >
      <Band side="left" />
      <Band side="right" />
    </div>
  );
}
