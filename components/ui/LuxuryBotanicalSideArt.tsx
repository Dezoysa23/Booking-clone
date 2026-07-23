/**
 * LuxuryBotanicalSideArt — decorative "Luxury Botanical" accents for premium
 * section framing: soft palm-frond line-art, a blurred pearl/gold gradient orb,
 * and a thin gold editorial line. Purely decorative and non-interactive.
 *
 * - Absolutely positioned; parent must be `relative` (and usually `overflow-hidden`).
 * - `pointer-events-none` + `aria-hidden` so it never blocks content or a11y.
 * - Responsive: visible/elegant on lg+, lighter on md, hidden on small screens
 *   so it never causes overflow or covers content on mobile.
 * - No animation by default (safe for reduced-motion + performance).
 */

type Side = "left" | "right" | "both";

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
    >
      {/* Spine */}
      <path
        d={`M ${bx} ${by} Q ${cx} ${cy} ${tx} ${ty}`}
        stroke="currentColor"
        strokeWidth="1.2"
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
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d={`M ${p.x} ${p.y} Q ${(p.x + lx) / 2 - 8} ${(p.y + ly) / 2} ${lx} ${ly}`}
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

function SidePiece({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`pointer-events-none absolute top-0 bottom-0 -z-10 hidden md:block ${
        isLeft ? "left-0" : "right-0"
      }`}
      aria-hidden="true"
    >
      {/* Blurred pearl/gold gradient orb */}
      <div
        className={`absolute top-1/4 h-72 w-72 rounded-full blur-3xl ${
          isLeft ? "-left-24" : "-right-24"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(232,200,146,0.22) 0%, rgba(248,242,233,0.14) 45%, transparent 75%)",
        }}
      />
      {/* Palm frond line-art */}
      <Frond
        className={`absolute top-1/2 h-[70%] max-h-[520px] w-auto -translate-y-1/2 text-[#D9A94D]/25 lg:text-[#D9A94D]/30 ${
          isLeft ? "left-1 -scale-x-100 lg:left-4" : "right-1 lg:right-4"
        }`}
      />
      {/* Thin gold editorial line */}
      <div
        className={`absolute top-[18%] bottom-[18%] w-px bg-gradient-to-b from-transparent via-[#D9A94D]/25 to-transparent ${
          isLeft ? "left-6 lg:left-10" : "right-6 lg:right-10"
        }`}
      />
    </div>
  );
}

export default function LuxuryBotanicalSideArt({
  side = "both",
}: {
  side?: Side;
}) {
  return (
    <>
      {(side === "left" || side === "both") && <SidePiece side="left" />}
      {(side === "right" || side === "both") && <SidePiece side="right" />}
    </>
  );
}
