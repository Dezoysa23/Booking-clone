import React from "react";
import { cn } from "@/lib/cn";

const INPUT_BASE =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-[15px] text-[#16233f] placeholder:text-[#7c879b] shadow-sm outline-none transition-colors border-[#e7ddc9] focus:border-[#d9a94d] focus:ring-2 focus:ring-[#d9a94d]/30 disabled:cursor-not-allowed disabled:bg-[#f8f2e9] disabled:text-[#7c879b]";
const INPUT_INVALID =
  "border-[#d99a90] focus:border-[#c0392b] focus:ring-[#c0392b]/25";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("block text-sm font-semibold text-[#14213d]", className)}
      {...props}
    >
      {children}
      {required ? <span className="text-rose-500"> *</span> : null}
    </label>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(INPUT_BASE, invalid && INPUT_INVALID, className)}
        {...props}
      />
    );
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(INPUT_BASE, "min-h-24 resize-y", invalid && INPUT_INVALID, className)}
        {...props}
      />
    );
  },
);

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            INPUT_BASE,
            "cursor-pointer appearance-none pr-10",
            invalid && INPUT_INVALID,
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-slate-400"
        >
          expand_more
        </span>
      </div>
    );
  },
);

/**
 * Label + control + hint/error wrapper. Pass the control as children.
 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
