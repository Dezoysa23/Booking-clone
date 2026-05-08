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
  propertyName,
  pricePerNight,
}: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays > 0 ? diffInDays : 0;
  }, [checkIn, checkOut]);

  const totalPrice = numberOfNights * pricePerNight;

  const handleBooking = async () => {
    if (!checkIn || !checkOut || numberOfNights <= 0) {
      alert("Please select valid check-in and check-out dates.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          propertyName,
          checkIn,
          checkOut,
          guests,
          nights: numberOfNights,
          totalPrice,
        }),
      });

      const data = await response.json();

     if (!response.ok) {
  if (response.status === 401) {
    alert("Please log in before making a booking.");
    router.push("/login");
    return;
  }

  throw new Error(data.error || "Booking failed.");
}

      router.push(`/booking-confirmation/${data.bookingId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">Price per night</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        LKR {pricePerNight.toLocaleString()}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Guests
          </label>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          Nights: <span className="font-semibold">{numberOfNights}</span>
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Guests: <span className="font-semibold">{guests}</span>
        </p>

        <p className="mt-3 text-lg font-bold text-gray-900">
          Total: LKR {totalPrice.toLocaleString()}
        </p>
      </div>

      <button
        onClick={handleBooking}
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Booking..." : "Book Now"}
      </button>

      <p className="mt-4 text-sm text-gray-500">
        Demo booking will now be saved to the database.
      </p>
    </div>
  );
}