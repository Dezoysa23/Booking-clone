import { cn } from "@/lib/cn";

/**
 * Consistent empty / zero-results block: icon chip + title + copy + optional CTA.
 */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-secondary-fixed-dim bg-white/70 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ecd8] text-[#a9791f]">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </span>
      <h3 className="mt-4 font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
