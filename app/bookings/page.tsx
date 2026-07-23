import Link from "next/link";
import { redirect } from "next/navigation";
import CancelBookingButton from "@/components/CancelBookingButton";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import {
  Badge,
  Card,
  EmptyState,
  bookingStatusTone,
  buttonVariants,
} from "@/components/ui";

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
    <main className="page-gradient min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {bookings.length > 0
                ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"} on your account`
                : "No bookings found yet"}
            </p>
          </div>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <span className="material-symbols-outlined text-lg leading-none" aria-hidden="true">
              arrow_back
            </span>
            Back to Home
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
                      {booking.property.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {booking.property.location}
                    </p>
                    <p className="mt-2 font-mono text-xs text-slate-400">
                      Booking #{booking.id}
                    </p>
                  </div>
                  <Badge tone={bookingStatusTone(booking.status)} dot>
                    {STATUS_LABELS[booking.status] ?? booking.status}
                  </Badge>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Check-in
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {booking.checkIn.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Check-out
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {booking.checkOut.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Guests
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {booking.guests}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Nights
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {booking.nights}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#14213d] px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
                        Total
                      </p>
                      <p className="mt-0.5 text-xl font-bold text-white">
                        LKR {booking.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/booking-confirmation/${booking.id}`}
                      className={buttonVariants({ variant: "accent", size: "sm" })}
                    >
                      View Details
                    </Link>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <CancelBookingButton
                      bookingId={booking.id}
                      status={booking.status}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="luggage"
            title="No bookings yet"
            description="Your bookings will appear here once you reserve a property."
            action={
              <Link href="/" className={buttonVariants({ variant: "primary" })}>
                Explore Properties
              </Link>
            }
          />
        )}
      </div>
    </main>
  );
}
