import Link from "next/link";
import { redirect } from "next/navigation";
import CancelBookingButton from "@/components/CancelBookingButton";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export default async function BookingsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>

        <p className="mt-3 text-gray-600">
          View all bookings linked to your account.
        </p>

        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Back to Home
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="mt-8 space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {booking.property.name}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {booking.property.location}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Booking ID: {booking.id}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                    {booking.status}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.checkIn.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.checkOut.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.guests}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Nights</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {booking.nights}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    LKR {booking.totalPrice.toLocaleString()}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/booking-confirmation/${booking.id}`}
                    className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View Booking
                  </Link>

                  <CancelBookingButton
                    bookingId={booking.id}
                    status={booking.status}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-md">
            <h2 className="text-2xl font-bold text-gray-900">
              No bookings found
            </h2>
            <p className="mt-2 text-gray-600">
              Once you book a property while logged in, it will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}