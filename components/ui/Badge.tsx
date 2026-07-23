import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "navy";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-[#f1e7d6] text-on-surface-variant ring-outline/35",
  info: "bg-[#eef1f7] text-[#14213d] ring-[#14213d]/15",
  success: "bg-[#e2f0e9] text-[#2f7a5b] ring-[#2f7a5b]/25",
  warning: "bg-[#f4ecd8] text-on-primary-fixed-variant ring-[#d9a94d]/45",
  danger: "bg-[#f8e0dc] text-[#a5311f] ring-[#c0392b]/25",
  accent: "bg-[#ece5f5] text-[#6d5296] ring-[#6d5296]/25",
  navy: "bg-[#14213d]/6 text-[#14213d] ring-[#14213d]/15",
};

const DOTS: Record<BadgeTone, string> = {
  neutral: "bg-outline",
  info: "bg-[#14213d]",
  success: "bg-[#2f7a5b]",
  warning: "bg-[#d9a94d]",
  danger: "bg-[#c0392b]",
  accent: "bg-[#6d5296]",
  navy: "bg-[#14213d]",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[tone])} />
      ) : null}
      {children}
    </span>
  );
}

/* ── Status → tone maps (consolidate the per-page color maps) ── */

export function bookingStatusTone(status: string): BadgeTone {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "danger";
    case "REFUNDED":
      return "info";
    default:
      return "neutral";
  }
}

export function subscriptionStatusTone(status: string): BadgeTone {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "success";
    case "PAST_DUE":
      return "warning";
    case "CANCELLED":
      return "danger";
    case "EXPIRED":
    case "INACTIVE":
    default:
      return "neutral";
  }
}
