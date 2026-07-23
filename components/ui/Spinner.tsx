import { cn } from "@/lib/cn";

/**
 * Inline spinner. Inherits `currentColor`, so it matches the surrounding text.
 * The global reduced-motion rule neutralizes the spin for users who opt out.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]",
        className,
      )}
    />
  );
}
