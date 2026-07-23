"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DateRange = { checkIn: string; checkOut: string };

type Props = {
  propertyId: number;
  propertyName: string;
  pricePerNight: number;
};

function datesOverlap(
  newIn: Date,
  newOut: Date,
  existIn: Date,
  existOut: Date
): boolean {
  return newIn < existOut && newOut > existIn;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingForm({ propertyId, pricePerNight }: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookedRanges, setBookedRanges] = useState<DateRange[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/availability`)
      .then((r) => r.json())
      .then((data) => {
        setBookedRanges(data.ranges ?? []);
        setAvailabilityLoading(false);
      })
      .catch(() => {
        setAvailabilityError(true);
        setAvailabilityLoading(false);
      });
  }, [propertyId]);

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [checkIn, checkOut]);

  const totalPrice = numberOfNights * pricePerNight;

  const selectedDatesConflict = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    const newIn = new Date(checkIn);
    const newOut = new Date(checkOut);
    return bookedRanges.some((r) =>
      datesOverlap(newIn, newOut, new Date(r.checkIn), new Date(r.checkOut))
    );
  }, [checkIn, checkOut, bookedRanges]);

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

    if (selectedDatesConflict) {
      setErrorMessage("These dates are already booked. Please choose different dates.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, checkIn, checkOut, guests }),
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
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10";

  return (
    <form
      onSubmit={handleBooking}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden sticky top-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-[#14213D] to-[#16233F] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D]">
          Price per night
        </p>
        <p className="mt-1 text-2xl font-bold text-white">
          LKR {pricePerNight.toLocaleString()}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Availability status */}
        {availabilityLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-[#F8F2E9] border border-gray-100 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#D9A94D] animate-pulse" />
            <span className="text-xs text-gray-500">Checking availability…</span>
          </div>
        )}
        {availabilityError && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5">
            <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
            <span className="text-xs text-amber-700">
              Could not load availability. Dates may be checked on submit.
            </span>
          </div>
        )}

        {/* Booked date ranges */}
        {!availabilityLoading && !availabilityError && bookedRanges.length > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">event_busy</span>
              Already booked dates
            </p>
            <ul className="space-y-0.5">
              {bookedRanges.map((r, i) => (
                <li key={i} className="text-xs text-red-600">
                  {formatDateShort(r.checkIn)} → {formatDateShort(r.checkOut)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => { setCheckIn(e.target.value); setErrorMessage(""); }}
            disabled={isSubmitting}
            className={`${inputClass} ${
              selectedDatesConflict && checkIn ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""
            }`}
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
            onChange={(e) => { setCheckOut(e.target.value); setErrorMessage(""); }}
            disabled={isSubmitting}
            className={`${inputClass} ${
              selectedDatesConflict && checkOut ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""
            }`}
          />
        </div>

        {/* Conflict warning shown inline */}
        {selectedDatesConflict && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
            <span className="material-symbols-outlined text-red-500 text-sm mt-0.5 shrink-0">block</span>
            <p className="text-xs text-red-700 leading-relaxed">
              Your selected dates overlap with an existing booking. Please choose different dates.
            </p>
          </div>
        )}

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

        {/* Price summary */}
        <div className="rounded-xl bg-[#F8F2E9] border border-gray-100 px-4 py-4 space-y-1.5">
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
                <span className="text-sm font-semibold text-[#14213D]">Total</span>
                <span className="font-bold text-[#14213D]">
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
          disabled={isSubmitting || selectedDatesConflict}
          className="w-full rounded-lg bg-gradient-to-r from-[#14213D] to-[#16233F] px-4 py-3.5 text-sm font-bold text-white hover:from-[#16233F] hover:to-[#264d8c] transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Reserving…" : "Reserve Now"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your booking will be confirmed instantly.
        </p>
      </div>
    </form>
  );
}
