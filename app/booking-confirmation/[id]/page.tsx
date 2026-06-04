import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type BookingConfirmationPageProps = {
  params: Promise<{ id: string }>;
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
    include: { property: true },
  });

  if (!booking) {
    notFound();
  }

  if (booking.userId !== userId) {
    redirect("/bookings");
  }

  const statusLabel =
    booking.status === "CONFIRMED"
      ? "Confirmed"
      : booking.status === "CANCELLED"
      ? "Cancelled"
      : "Pending";

  const statusClass =
    booking.status === "CONFIRMED"
      ? "bg-green-50 text-green-700 border border-green-100"
      : booking.status === "CANCELLED"
      ? "bg-red-50 text-red-600 border border-red-100"
      : "bg-[#eef2fa] text-[#0f1f3d] border border-[#0f1f3d]/10";

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Success bar */}
          <div className="h-1.5 bg-[#0f1f3d]" />

          <div className="p-8">
            {/* Status badge */}
            {booking.status === "CONFIRMED" ? (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4">
                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                <div>
                  <p className="text-sm font-semibold text-green-800">Booking Confirmed</p>
                  <p className="text-xs text-green-600 mt-0.5">Your reservation has been confirmed.</p>
                </div>
              </div>
            ) : booking.status === "CANCELLED" ? (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-5 py-4">
                <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Booking Cancelled</p>
                  <p className="text-xs text-red-600 mt-0.5">This reservation has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-[#eef2fa] border border-[#0f1f3d]/10 px-5 py-4">
                <span className="material-symbols-outlined text-[#0f1f3d] text-xl">schedule</span>
                <div>
                  <p className="text-sm font-semibold text-[#0f1f3d]">Reservation Received</p>
                  <p className="text-xs text-[#0f1f3d]/60 mt-0.5">Your reservation has been successfully recorded.</p>
                </div>
              </div>
            )}

            <h1 className="mt-7 font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d]">
              Booking Confirmation
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your reservation details are shown below.
            </p>

            {/* Details */}
            <div className="mt-7 space-y-0 divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 bg-[#faf8f5]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Booking ID</p>
                <p className="font-mono text-sm font-semibold text-gray-700">#{booking.id}</p>
              </div>
              <div className="flex justify-between items-start px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Property</p>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">{booking.property.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{booking.property.location}</p>
                </div>
              </div>
              <div className="flex justify-between items-center px-5 py-4 bg-[#faf8f5]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Check-in</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.checkIn.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Check-out</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.checkOut.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex justify-between items-center px-5 py-4 bg-[#faf8f5]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Guests</p>
                <p className="text-sm font-semibold text-gray-900">{booking.guests}</p>
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Nights</p>
                <p className="text-sm font-semibold text-gray-900">{booking.nights}</p>
              </div>
              <div className="flex justify-between items-center px-5 py-4 bg-[#faf8f5]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Status</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-[#0f1f3d] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D8B45A]">
                {booking.status === "CONFIRMED" ? "Total Paid" : "Total"}
              </p>
              <p className="text-2xl font-bold text-white">
                LKR {booking.totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="rounded-lg bg-[#0f1f3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors"
              >
                View All Bookings
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
