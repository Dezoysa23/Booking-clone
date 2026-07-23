"use client";

import { useRouter } from "next/navigation";
import { Badge, ConfirmButton } from "@/components/ui";

type Props = {
  bookingId: number;
  status: string;
};

export default function CancelBookingButton({ bookingId, status }: Props) {
  const router = useRouter();

  if (status === "CANCELLED") {
    return <Badge tone="danger">Cancelled</Badge>;
  }

  return (
    <ConfirmButton
      idleLabel="Cancel Booking"
      confirmLabel="Yes, Cancel"
      cancelLabel="Keep"
      actingLabel="Cancelling…"
      prompt="Cancel this booking?"
      icon="cancel"
      onConfirm={async () => {
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: "PATCH",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to cancel booking.");
        }

        router.refresh();
      }}
    />
  );
}
