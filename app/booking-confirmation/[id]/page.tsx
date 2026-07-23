import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { Badge, Card, bookingStatusTone, buttonVariants } from "@/components/ui";

type BookingConfirmationPageProps = {
  params: Promise<{ id: string }>;
};

const BANNERS = {
  CONFIRMED: {
    icon: "check_circle",
    box: "border-emerald-100 bg-emerald-50",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-800",
    textColor: "text-emerald-600",
    title: "Booking Confirmed",
    subtitle: "Your reservation has been confirmed.",
  },
  CANCELLED: {
    icon: "cancel",
    box: "border-rose-100 bg-rose-50",
    iconColor: "text-rose-500",
    titleColor: "text-rose-800",
    textColor: "text-rose-600",
    title: "Booking Cancelled",
    subtitle: "This reservation has been cancelled.",
  },
  PENDING: {
    icon: "schedule",
    box: "border-[#f4ecd8] bg-[#f4ecd8]",
    iconColor: "text-[#c4922f]",
    titleColor: "text-on-primary-container",
    textColor: "text-on-primary-fixed-variant",
    title: "Reservation Received",
    subtitle: "Your reservation has been successfully recorded.",
  },
} as const;

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

  const banner =
    booking.status === "CONFIRMED"
      ? BANNERS.CONFIRMED
      : booking.status === "CANCELLED"
        ? BANNERS.CANCELLED
        : BANNERS.PENDING;

  return (
    <main className="page-gradient min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <div className="admin-header-gradient h-1.5" />

          <div className="p-8">
            {/* Status banner */}
            <div
              className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${banner.box}`}
            >
              <span
                className={`material-symbols-outlined text-xl ${banner.iconColor}`}
                aria-hidden="true"
              >
                {banner.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${banner.titleColor}`}>
                  {banner.title}
                </p>
                <p className={`mt-0.5 text-xs ${banner.textColor}`}>
                  {banner.subtitle}
                </p>
              </div>
            </div>

            <h1 className="mt-7 font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
              Booking Confirmation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your reservation details are shown below.
            </p>

            {/* Details */}
            <div className="mt-7 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Booking ID
                </p>
                <p className="font-mono text-sm font-semibold text-slate-700">
                  #{booking.id}
                </p>
              </div>
              <div className="flex items-start justify-between px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Property
                </p>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.property.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {booking.property.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Check-in
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.checkIn.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Check-out
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.checkOut.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Guests
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.guests}
                </p>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Nights
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.nights}
                </p>
              </div>
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Status
                </p>
                <Badge tone={bookingStatusTone(booking.status)} dot>
                  {statusLabel}
                </Badge>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-[#14213d] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
                {booking.status === "CONFIRMED" ? "Total Paid" : "Total"}
              </p>
              <p className="text-2xl font-bold text-white">
                LKR {booking.totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/bookings" className={buttonVariants({ variant: "primary" })}>
                View All Bookings
              </Link>
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                Back to Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
