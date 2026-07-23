import Link from "next/link";
import { redirect } from "next/navigation";
import CancelBookingButton from "@/components/CancelBookingButton";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED:  "bg-red-50 text-red-600 border border-red-100",
  PENDING:    "bg-[#eef2fa] text-[#14213D] border border-[#14213D]/10",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CANCELLED:  "Cancelled",
  PENDING:    "Pending",
};

const STATUS_ICONS: Record<string, string> = {
  CONFIRMED: "check_circle",
  CANCELLED:  "cancel",
  PENDING:    "schedule",
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
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-6 bg-[#D9A94D]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D9A94D]">Your Journeys</span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {bookings.length > 0
                ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"} on your account`
                : "No bookings yet"}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Back to Home
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = booking.status as keyof typeof STATUS_STYLES;
              return (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-[#D9A94D]/20 transition-all duration-200"
                >
                  {/* Status top stripe */}
                  <div
                    className={`h-1 ${
                      status === "CONFIRMED" ? "bg-emerald-400" :
                      status === "CANCELLED" ? "bg-red-400" : "bg-[#16233F]"
                    }`}
                  />

                  {/* Header row */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between px-6 py-5 border-b border-gray-50">
                    <div>
                      <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
                        {booking.property.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-gray-400">location_on</span>
                        {booking.property.location}
                      </p>
                      <p className="mt-1.5 text-[11px] text-gray-400 font-mono">
                        #{booking.id}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide ${
                        STATUS_STYLES[status] ?? STATUS_STYLES.PENDING
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{STATUS_ICONS[status] ?? "schedule"}</span>
                      {STATUS_LABELS[status] ?? booking.status}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="px-6 py-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        {
                          label: "Check-in",
                          value: booking.checkIn.toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric", year: "numeric",
                          }),
                          icon: "flight_land",
                        },
                        {
                          label: "Check-out",
                          value: booking.checkOut.toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric", year: "numeric",
                          }),
                          icon: "flight_takeoff",
                        },
                        { label: "Guests",  value: `${booking.guests} guest${booking.guests !== 1 ? "s" : ""}`, icon: "group" },
                        { label: "Nights",  value: `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`,  icon: "bedtime" },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-xl bg-[#F8F2E9] border border-gray-100 p-4 flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#14213D]/35 text-base mt-0.5">{icon}</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</p>
                            <p className="mt-1 font-semibold text-gray-900 text-sm">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer bar */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#14213D] px-5 py-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9A94D]">Total Paid</p>
                        <p className="mt-0.5 text-xl font-bold text-white">
                          LKR {booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/booking-confirmation/${booking.id}`}
                          className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-xs">receipt</span>
                          View Receipt
                        </Link>
                        <CancelBookingButton bookingId={booking.id} status={booking.status} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F8F2E9] border border-gray-100">
              <span className="material-symbols-outlined text-[#14213D]/25 text-4xl">luggage</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#14213D]">
              No journeys yet
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Your bookings will appear here once you reserve a property. Start exploring Sri Lanka.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/results?destination="
                className="rounded-xl bg-[#14213D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">travel_explore</span>
                Explore Properties
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
