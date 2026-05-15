"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookingId: number;
  status: string;
};

type Phase = "idle" | "confirm" | "cancelling";

export default function CancelBookingButton({ bookingId, status }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex rounded-full bg-red-950/20 border border-red-300/30 px-4 py-1.5 text-xs font-semibold text-red-300">
        Cancelled
      </span>
    );
  }

  const handleConfirm = async () => {
    setPhase("cancelling");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        setErrorMessage(data.error || "Failed to cancel booking.");
        setPhase("idle");
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Failed to cancel. Please try again.");
      setPhase("idle");
    }
  };

  if (phase === "confirm" || phase === "cancelling") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <p className="text-xs text-red-300 font-medium">Cancel this booking?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={phase === "cancelling"}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === "cancelling" ? "Cancelling..." : "Yes, Cancel"}
          </button>
          {phase === "confirm" && (
            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setErrorMessage("");
              }}
              className="rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 transition-colors"
            >
              Keep
            </button>
          )}
        </div>
        {errorMessage && (
          <p className="text-xs text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {errorMessage && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}
      <button
        type="button"
        onClick={() => {
          setErrorMessage("");
          setPhase("confirm");
        }}
        className="inline-flex rounded-lg border border-red-300/50 bg-white/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/20 transition-colors"
      >
        Cancel Booking
      </button>
    </div>
  );
}
