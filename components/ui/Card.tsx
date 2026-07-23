import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Add hover lift + shadow (use for clickable dashboard cards). */
  hover?: boolean;
};

export function Card({ className, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e7ddc9] bg-white shadow-card",
        hover &&
          "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "light" | "dark";
};

export function GlassPanel({
  tone = "light",
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        tone === "dark" ? "glass-panel-dark" : "glass-panel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
