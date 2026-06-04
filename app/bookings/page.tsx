import Link from "next/link";
import { redirect } from "next/navigation";
import CancelBookingButton from "@/components/CancelBookingButton";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border border-green-100",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
  PENDING: "bg-[#eef2fa] text-[#0f1f3d] border border-[#0f1f3d]/10",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
};

export default async function BookingsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const bookings = await prisma.booking
    .findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    })
    .catch((error) => {
      console.error("[Bookings] Failed to fetch bookings:", error);
      return [];
    });

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {bookings.length > 0
                ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"} on your account`
                : "No bookings found yet"}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between p-6 border-b border-gray-50">
                  <div>
                    <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d]">
                      {booking.property.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">{booking.property.location}</p>
                    <p className="mt-2 text-xs text-gray-400 font-mono">
                      Booking #{booking.id}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide ${
                      STATUS_STYLES[booking.status] ?? STATUS_STYLES.PENDING
                    }`}
                  >
                    {STATUS_LABELS[booking.status] ?? booking.status}
                  </span>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-[#faf8f5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Check-in</p>
                      <p className="mt-1.5 font-semibold text-gray-900 text-sm">
                        {booking.checkIn.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#faf8f5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Check-out</p>
                      <p className="mt-1.5 font-semibold text-gray-900 text-sm">
                        {booking.checkOut.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#faf8f5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Guests</p>
                      <p className="mt-1.5 font-semibold text-gray-900 text-sm">{booking.guests}</p>
                    </div>
                    <div className="rounded-lg bg-[#faf8f5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Nights</p>
                      <p className="mt-1.5 font-semibold text-gray-900 text-sm">{booking.nights}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#0f1f3d] px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#D8B45A]">Total</p>
                      <p className="mt-0.5 text-xl font-bold text-white">
                        LKR {booking.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/booking-confirmation/${booking.id}`}
                        className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0f1f3d] hover:bg-[#faf8f5] transition-colors"
                      >
                        View Details
                      </Link>
                      <CancelBookingButton
                        bookingId={booking.id}
                        status={booking.status}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#faf8f5] border border-gray-100">
              <span className="material-symbols-outlined text-[#0f1f3d]/30 text-2xl">luggage</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d]">
              No bookings yet
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
              Your bookings will appear here once you reserve a property.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#0f1f3d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
