"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonVariant } from "./Button";

export interface ConfirmButtonProps {
  /** Performs the destructive/confirmed action. Throw to surface an error. */
  onConfirm: () => Promise<void> | void;
  idleLabel: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  actingLabel?: React.ReactNode;
  /** Optional short question shown while confirming. */
  prompt?: React.ReactNode;
  idleVariant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: string;
  disabled?: boolean;
  className?: string;
  /** Handle the error yourself instead of the built-in inline message. */
  onError?: (message: string) => void;
}

/**
 * Inline idle → confirm → acting flow (no browser dialog). Consolidates the
 * cancel-booking / cancel-plan / delete-property patterns: pass the action as
 * `onConfirm`; throw inside it to show an error.
 */
export function ConfirmButton({
  onConfirm,
  idleLabel,
  confirmLabel = "Confirm",
  cancelLabel = "Keep",
  actingLabel = "Working…",
  prompt,
  idleVariant = "outline",
  confirmVariant = "danger",
  size = "sm",
  icon,
  disabled,
  className,
  onError,
}: ConfirmButtonProps) {
  const [phase, setPhase] = useState<"idle" | "confirm" | "acting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPhase("acting");
    setError(null);
    try {
      await onConfirm();
      setPhase("idle");
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "Something went wrong. Please try again.";
      if (onError) onError(msg);
      else setError(msg);
      setPhase("idle");
    }
  }

  if (phase === "acting") {
    return (
      <div className={cn("inline-flex", className)}>
        <Button variant={confirmVariant} size={size} loading>
          {actingLabel}
        </Button>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div className={cn("inline-flex flex-col gap-2", className)}>
        {prompt ? (
          <span className="text-xs text-slate-500">{prompt}</span>
        ) : null}
        <div className="inline-flex items-center gap-2">
          <Button variant={confirmVariant} size={size} onClick={run}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" size={size} onClick={() => setPhase("idle")}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <Button
        variant={idleVariant}
        size={size}
        icon={icon}
        disabled={disabled}
        onClick={() => setPhase("confirm")}
      >
        {idleLabel}
      </Button>
      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : null}
    </div>
  );
}
