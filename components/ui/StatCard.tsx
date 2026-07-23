import { cn } from "@/lib/cn";
import { Card } from "./Card";

export type StatTone = "default" | "invert" | "blue" | "amber" | "emerald" | "rose";

const ICON_CHIP: Record<StatTone, string> = {
  default: "bg-[#f4ecd8] text-[#a9791f]",
  invert: "bg-white/12 text-[#e8c892]",
  blue: "bg-[#f4ecd8] text-[#a9791f]",
  amber: "bg-[#f4ecd8] text-[#a9791f]",
  emerald: "bg-[#e2f0e9] text-[#2f7a5b]",
  rose: "bg-[#f8e0dc] text-[#a5311f]",
};

/**
 * Dashboard metric tile. `tone="invert"` renders a filled navy card for emphasis.
 */
export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: StatTone;
  className?: string;
}) {
  const invert = tone === "invert";
  return (
    <Card
      className={cn(
        "flex items-start gap-4 p-5",
        invert && "border-transparent bg-[#14213d] text-white shadow-[0_18px_42px_rgba(16,26,48,0.35)]",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          ICON_CHIP[tone],
        )}
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            invert ? "text-white/70" : "text-slate-500",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1 font-(family-name:--font-playfair-display) text-2xl font-semibold leading-tight",
            invert ? "text-white" : "text-[#14213d]",
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className={cn("mt-1 text-xs", invert ? "text-white/60" : "text-slate-400")}>
            {hint}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
