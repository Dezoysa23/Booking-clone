import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type BookingConfirmationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const bookingId = Number(resolvedParams.id);

  if (Number.isNaN(bookingId)) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: true,
    },
  });

  if (!booking) {
    notFound();
  }

  if (booking.userId !== userId) {
    redirect("/bookings");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <div className="rounded-lg bg-green-100 px-4 py-3 text-green-800">
          Booking confirmed successfully!
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Booking Confirmation
        </h1>

        <p className="mt-2 text-gray-600">
          Your reservation details are shown below.
        </p>

        <div className="mt-8 space-y-4 rounded-xl bg-gray-50 p-6">
          <div>
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="text-lg font-semibold text-gray-900">{booking.id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Property</p>
            <p className="text-lg font-semibold text-gray-900">
              {booking.property.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-lg font-semibold text-gray-900">
              {booking.property.location}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Check-in</p>
              <p className="font-semibold text-gray-900">
                {booking.checkIn.toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Check-out</p>
              <p className="font-semibold text-gray-900">
                {booking.checkOut.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Guests</p>
              <p className="font-semibold text-gray-900">{booking.guests}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Nights</p>
              <p className="font-semibold text-gray-900">{booking.nights}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-gray-900">{booking.status}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-2xl font-bold text-gray-900">
              LKR {booking.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/bookings"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            View My Bookings
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}