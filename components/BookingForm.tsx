"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";

type DateRange = { checkIn: string; checkOut: string };

type Props = {
  propertyId: number;
  propertyName: string;
  pricePerNight: number;
  /** Stay dates carried from the search / results flow to prefill the form. */
  defaultCheckIn?: string;
  defaultCheckOut?: string;
};

function datesOverlap(
  newIn: Date,
  newOut: Date,
  existIn: Date,
  existOut: Date,
): boolean {
  return newIn < existOut && newOut > existIn;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BookingForm({
  propertyId,
  pricePerNight,
  defaultCheckIn,
  defaultCheckOut,
}: Props) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  // Only accept prefilled dates that are still valid (not in the past, and a
  // check-out strictly after check-in); otherwise start empty.
  const seedIn = defaultCheckIn && defaultCheckIn >= today ? defaultCheckIn : "";
  const seedOut =
    defaultCheckOut && seedIn && defaultCheckOut > seedIn ? defaultCheckOut : "";

  const [checkIn, setCheckIn] = useState(seedIn);
  const [checkOut, setCheckOut] = useState(seedOut);
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookedRanges, setBookedRanges] = useState<DateRange[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);

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
      datesOverlap(newIn, newOut, new Date(r.checkIn), new Date(r.checkOut)),
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
      setErrorMessage(
        "These dates are already booked. Please choose different dates.",
      );
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
        setErrorMessage(
          data.error || "Failed to create booking. Please try again.",
        );
        return;
      }

      router.push(`/booking-confirmation/${data.bookingId}`);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const conflictIn = selectedDatesConflict && !!checkIn;
  const conflictOut = selectedDatesConflict && !!checkOut;

  return (
    <form
      id="book"
      onSubmit={handleBooking}
      className="sticky top-24 h-fit self-start scroll-mt-24 overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white shadow-card"
    >
      {/* Header */}
      <div className="section-navy px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e8c892]">
          From
        </p>
        <p className="mt-1 font-(family-name:--font-playfair-display) text-3xl font-semibold text-white">
          LKR {pricePerNight.toLocaleString()}
          <span className="text-sm font-normal text-white/60"> / night</span>
        </p>
      </div>

      <div className="space-y-4 p-6">
        {/* Availability status */}
        {availabilityLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#e7ddc9] bg-[#f8f2e9] px-4 py-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#d9a94d]" />
            <span className="text-xs text-on-surface-variant">Checking availability…</span>
          </div>
        ) : null}
        {availabilityError ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#e8d3a4] bg-[#f4ecd8] px-4 py-2.5">
            <span
              className="material-symbols-outlined text-sm text-[#a9791f]"
              aria-hidden="true"
            >
              warning
            </span>
            <span className="text-xs text-on-primary-fixed-variant">
              Could not load availability. Dates may be checked on submit.
            </span>
          </div>
        ) : null}

        {/* Booked date ranges */}
        {!availabilityLoading &&
        !availabilityError &&
        bookedRanges.length > 0 ? (
          <div className="rounded-lg border border-[#e5c9c2] bg-[#f8e0dc] px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#a5311f]">
              <span
                className="material-symbols-outlined text-sm"
                aria-hidden="true"
              >
                event_busy
              </span>
              Already booked dates
            </p>
            <ul className="space-y-0.5">
              {bookedRanges.map((r, i) => (
                <li key={i} className="text-xs text-[#a5311f]">
                  {formatDateShort(r.checkIn)} → {formatDateShort(r.checkOut)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in">
            <Input
              type="date"
              value={checkIn}
              min={today}
              invalid={conflictIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSubmitting}
            />
          </Field>

          <Field label="Check-out">
            <Input
              type="date"
              value={checkOut}
              min={checkIn || today}
              invalid={conflictOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSubmitting}
            />
          </Field>
        </div>

        {/* Conflict warning shown inline */}
        {selectedDatesConflict ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#e5c9c2] bg-[#f8e0dc] px-3 py-2.5">
            <span
              className="material-symbols-outlined mt-0.5 shrink-0 text-sm text-[#c0392b]"
              aria-hidden="true"
            >
              block
            </span>
            <p className="text-xs leading-relaxed text-[#a5311f]">
              Your selected dates overlap with an existing booking. Please choose
              different dates.
            </p>
          </div>
        ) : null}

        {/* Guests stepper */}
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-[#14213d]">
            Guests
          </span>
          <div className="flex items-center justify-between rounded-xl border border-[#e7ddc9] px-4 py-2.5">
            <span className="text-sm text-[#16233f]">
              {guests} {guests === 1 ? "guest" : "guests"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease guests"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={isSubmitting || guests <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7ddc9] text-[#14213d] transition-colors hover:border-[#d9a94d] hover:bg-[#f4ecd8] disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  remove
                </span>
              </button>
              <span className="w-5 text-center text-sm font-semibold text-[#14213d]">
                {guests}
              </span>
              <button
                type="button"
                aria-label="Increase guests"
                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                disabled={isSubmitting || guests >= 20}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7ddc9] text-[#14213d] transition-colors hover:border-[#d9a94d] hover:bg-[#f4ecd8] disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  add
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-1.5 rounded-xl border border-[#e7ddc9] bg-[#f8f2e9] px-4 py-4">
          {numberOfNights === 0 ? (
            <p className="py-1 text-center text-xs text-[#7c879b]">
              Select your dates to see the price breakdown.
            </p>
          ) : (
            <>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>
                  {numberOfNights} night{numberOfNights !== 1 ? "s" : ""} × LKR{" "}
                  {pricePerNight.toLocaleString()}
                </span>
                <span className="font-medium text-[#16233f]">
                  LKR {(numberOfNights * pricePerNight).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Guests</span>
                <span className="font-medium text-[#16233f]">{guests}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#e7ddc9] pt-2">
                <span className="text-sm font-semibold text-[#14213d]">
                  Total
                </span>
                <span className="font-bold text-[#14213d]">
                  LKR {totalPrice.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-[#e5c9c2] bg-[#f8e0dc] px-4 py-3 text-xs text-[#a5311f]">
            {errorMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={selectedDatesConflict}
        >
          {isSubmitting ? "Reserving…" : "Reserve Now"}
        </Button>

        <p className="text-center text-xs text-[#7c879b]">
          Your booking will be confirmed instantly.
        </p>
      </div>
    </form>
  );
}
