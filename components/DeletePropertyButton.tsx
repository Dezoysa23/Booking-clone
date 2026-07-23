"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  propertyId: number;
  propertyName: string;
  apiBase?: string;
  redirectPath?: string;
};

type Phase = "idle" | "confirm" | "deleting";

export default function DeletePropertyButton({ propertyId, propertyName, apiBase = "/api/admin/properties", redirectPath }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteClick = () => {
    setErrorMessage("");
    setPhase("confirm");
  };

  const handleCancel = () => {
    setPhase("idle");
    setErrorMessage("");
  };

  const handleConfirm = async () => {
    setPhase("deleting");
    setErrorMessage("");

    try {
      const response = await fetch(`${apiBase}/${propertyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to delete property.");
        setPhase("idle");
        return;
      }

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.refresh();
      }
    } catch {
      setErrorMessage("Failed to delete. Please try again.");
      setPhase("idle");
    }
  };

  if (phase === "confirm" || phase === "deleting") {
    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-xs text-red-600 font-medium truncate max-w-[180px]">
          Delete &quot;{propertyName}&quot;?
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={phase === "deleting"}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === "deleting" ? "Deleting..." : "Yes, Delete"}
          </button>
          {phase === "confirm" && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-[#3B4658] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        {errorMessage && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDeleteClick}
        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
      >
        Delete
      </button>
      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
