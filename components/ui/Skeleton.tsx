import { cn } from "@/lib/cn";

/** Pulsing placeholder block. Pulse is neutralized under reduced-motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
    />
  );
}
