import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "danger"
  | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c4922f]";

const VARIANTS: Record<ButtonVariant, string> = {
  /* Primary CTA — gold fill, navy ink. */
  primary:
    "bg-[#d9a94d] text-[#14213d] shadow-[0_10px_24px_-10px_rgba(217,169,77,0.7)] hover:bg-[#c4922f] hover:shadow-[0_14px_30px_-10px_rgba(217,169,77,0.7)]",
  /* Dark CTA — navy fill, white text. */
  accent:
    "bg-[#14213d] text-white shadow-[0_10px_24px_-12px_rgba(20,33,61,0.7)] hover:bg-[#101a30] hover:shadow-md",
  /* Secondary — navy outline on white. */
  outline:
    "border border-[#14213d]/25 bg-white text-[#14213d] hover:border-[#14213d]/45 hover:bg-[#14213d]/3",
  ghost: "text-[#14213d] hover:bg-[#14213d]/6",
  danger:
    "bg-[#c0392b] text-white shadow-sm hover:bg-[#a5311f] hover:shadow-md",
  subtle: "bg-[#f4ecd8] text-on-primary-fixed-variant hover:bg-[#ecdcbb]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-[15px] px-7 py-3",
};

/**
 * Returns the class string for a button-styled element. Use on `<Link>` too:
 * `<Link className={buttonVariants({ variant: "primary" })}>`.
 */
export function buttonVariants(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  const { variant = "primary", size = "md", fullWidth, className } = opts ?? {};
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  /** Material Symbols ligature name rendered before the label. */
  icon?: string;
  /** Material Symbols ligature name rendered after the label. */
  iconRight?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonVariants({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : icon ? (
        <span className="material-symbols-outlined text-[1.15em] leading-none">
          {icon}
        </span>
      ) : null}
      {children}
      {!loading && iconRight ? (
        <span className="material-symbols-outlined text-[1.15em] leading-none">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
}
