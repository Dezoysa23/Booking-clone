"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Phase = "idle" | "confirm" | "cancelling";

export default function CancelPlanButton() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setPhase("cancelling");
    setError("");
    try {
      const res = await fetch("/api/host/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel plan.");
        setPhase("idle");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPhase("idle");
    }
  };

  if (phase === "confirm" || phase === "cancelling") {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <p className="text-xs text-red-600 font-medium">Cancel your plan?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={phase === "cancelling"}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === "cancelling" ? "Cancelling…" : "Yes, Cancel"}
          </button>
          {phase === "confirm" && (
            <button
              type="button"
              onClick={() => { setPhase("idle"); setError(""); }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-[#3B4658] hover:bg-gray-50 transition-colors"
            >
              Keep Plan
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setPhase("confirm")}
        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Cancel Plan
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
