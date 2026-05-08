"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookingId: number;
  status: string;
};

export default function CancelBookingButton({ bookingId, status }: Props) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);

      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

     if (!response.ok) {
  if (response.status === 401) {
    alert("Please log in first.");
    router.push("/login");
    return;
  }

  if (response.status === 403) {
    alert("You are not allowed to cancel this booking.");
    return;
  }

  throw new Error(data.error || "Failed to cancel booking.");
}

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
        Already Cancelled
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isCancelling}
      className="inline-flex rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isCancelling ? "Cancelling..." : "Cancel Booking"}
    </button>
  );
}