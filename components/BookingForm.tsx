"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  propertyId: number;
  propertyName: string;
  pricePerNight: number;
};

export default function BookingForm({
  propertyId,
  pricePerNight,
}: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diffInMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [checkIn, checkOut]);

  const totalPrice = numberOfNights * pricePerNight;

  const handleBooking = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!checkIn || !checkOut) {
      setErrorMessage("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setErrorMessage("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    if (guests < 1) {
      setErrorMessage("Number of guests must be at least 1.");
      return;
    }

    try {
      setIsSubmitting(true);

      // nights and totalPrice are computed server-side from the property's actual price.
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        setErrorMessage(data.error || "Failed to create booking. Please try again.");
        return;
      }

      router.push(`/booking-confirmation/${data.bookingId}`);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#0f1f3d] focus:bg-white focus:ring-2 focus:ring-[#0f1f3d]/10";

  return (
    <form
      onSubmit={handleBooking}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden sticky top-24"
    >
      <div className="bg-[#0f1f3d] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a84c]">
          Price per night
        </p>
        <p className="mt-1 text-2xl font-bold text-white">
          LKR {pricePerNight.toLocaleString()}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Guests
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value))))}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-[#faf8f5] border border-gray-100 px-4 py-4 space-y-1.5">
          {numberOfNights === 0 ? (
            <p className="text-xs text-gray-400 text-center py-1">
              Select your dates to see the price breakdown.
            </p>
          ) : (
            <>
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {numberOfNights} night{numberOfNights !== 1 ? "s" : ""} × LKR{" "}
                  {pricePerNight.toLocaleString()}
                </span>
                <span className="font-medium text-gray-700">
                  LKR {(numberOfNights * pricePerNight).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Guests</span>
                <span className="font-medium text-gray-700">{guests}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-[#0f1f3d]">Total</span>
                <span className="font-bold text-[#0f1f3d]">
                  LKR {totalPrice.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#0f1f3d] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#1a3060] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Reserving..." : "Reserve Now"}
        </button>

        <p className="text-center text-xs text-gray-400">
          No charge will be made until confirmed.
        </p>
      </div>
    </form>
  );
}
