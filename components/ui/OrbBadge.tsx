import { cn } from "@/lib/cn";

/**
 * Gold radial "orb" badge — white-hot center fading to gold, warm glow + top
 * highlight, with a serif italic glyph inside. The signature Pearlora mark used
 * for feature/amenity icons. Presentational (server-safe).
 */
export function OrbBadge({
  glyph,
  size = 56,
  className,
}: {
  /** Single letter/character shown in serif italic (e.g. "P", "✦", "W"). */
  glyph: React.ReactNode;
  /** Diameter in px. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("orb inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="orb-glyph font-semibold" style={{ fontSize: Math.round(size * 0.46) }}>
        {glyph}
      </span>
    </span>
  );
}
