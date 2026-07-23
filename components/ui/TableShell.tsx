import { cn } from "@/lib/cn";

/**
 * Card wrapper that keeps wide tables horizontally scrollable on small screens
 * instead of overflowing the page. Put a `<table className="w-full ...">` inside.
 */
export function TableShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-[#e7ddc9] bg-white shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
