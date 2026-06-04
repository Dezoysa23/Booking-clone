import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";

export type CalendarEventType =
  | "BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "CHECK_IN"
  | "CHECK_OUT"
  | "PAYMENT_PAID"
  | "PAYMENT_FAILED"
  | "SUBSCRIPTION_RENEWAL"
  | "SUBSCRIPTION_CANCELLED"
  | "PROPERTY_CREATED";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  description?: string;
  date: string; // ISO string
  amount?: number;
  currency?: string;
  bookingId?: number;
  propertyId?: number;
  userId?: string;
};

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0]; // YYYY-MM-DD UTC
}

function addEvent(
  map: Record<string, CalendarEvent[]>,
  date: Date,
  event: CalendarEvent
) {
  const key = dateKey(date);
  if (!map[key]) map[key] = [];
  map[key].push(event);
}

function inRange(d: Date, start: Date, end: Date): boolean {
  return d >= start && d < end;
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = Number(searchParams.get("year")) || now.getUTCFullYear();
  const month = Number(searchParams.get("month")) || now.getUTCMonth() + 1;

  if (year < 2020 || year > 2035 || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  try {
    const [bookings, payments, subscriptions, properties] = await Promise.all([
      prisma.booking.findMany({
        where: {
          OR: [
            { createdAt: { gte: start, lt: end } },
            { updatedAt: { gte: start, lt: end } },
            { checkIn: { gte: start, lt: end } },
            { checkOut: { gte: start, lt: end } },
          ],
        },
        select: {
          id: true,
          status: true,
          checkIn: true,
          checkOut: true,
          createdAt: true,
          updatedAt: true,
          propertyId: true,
          userId: true,
          property: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.payment.findMany({
        where: {
          OR: [
            { createdAt: { gte: start, lt: end } },
            { paidAt: { gte: start, lt: end } },
          ],
        },
        select: {
          id: true,
          paymentStatus: true,
          amount: true,
          currency: true,
          createdAt: true,
          paidAt: true,
          userId: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.subscription.findMany({
        where: {
          OR: [
            { renewalDate: { gte: start, lt: end } },
            { cancelledAt: { gte: start, lt: end } },
            { createdAt: { gte: start, lt: end } },
          ],
        },
        select: {
          id: true,
          status: true,
          renewalDate: true,
          cancelledAt: true,
          createdAt: true,
          userId: true,
          user: { select: { name: true, email: true } },
          plan: { select: { name: true } },
        },
      }),
      prisma.property.findMany({
        where: { createdAt: { gte: start, lt: end } },
        select: {
          id: true,
          name: true,
          createdAt: true,
          hostId: true,
          host: { select: { name: true, email: true } },
        },
      }),
    ]);

    const days: Record<string, CalendarEvent[]> = {};

    // ── Bookings ──────────────────────────────────────────────────────────────
    for (const b of bookings) {
      const guest = b.user?.name || b.user?.email || "Guest";
      const propName = b.property.name;

      if (inRange(b.createdAt, start, end)) {
        addEvent(days, b.createdAt, {
          id: `booking-created-${b.id}`,
          type: "BOOKING_CREATED",
          title: `New booking — ${propName}`,
          description: `by ${guest}`,
          date: b.createdAt.toISOString(),
          bookingId: b.id,
          propertyId: b.propertyId,
          userId: b.userId ?? undefined,
        });
      }

      if (b.status === "CANCELLED" && inRange(b.updatedAt, start, end)) {
        addEvent(days, b.updatedAt, {
          id: `booking-cancelled-${b.id}`,
          type: "BOOKING_CANCELLED",
          title: `Booking cancelled — ${propName}`,
          description: `by ${guest}`,
          date: b.updatedAt.toISOString(),
          bookingId: b.id,
          propertyId: b.propertyId,
          userId: b.userId ?? undefined,
        });
      }

      if (inRange(b.checkIn, start, end)) {
        addEvent(days, b.checkIn, {
          id: `check-in-${b.id}`,
          type: "CHECK_IN",
          title: `Check-in — ${propName}`,
          description: guest,
          date: b.checkIn.toISOString(),
          bookingId: b.id,
          propertyId: b.propertyId,
          userId: b.userId ?? undefined,
        });
      }

      if (inRange(b.checkOut, start, end)) {
        addEvent(days, b.checkOut, {
          id: `check-out-${b.id}`,
          type: "CHECK_OUT",
          title: `Check-out — ${propName}`,
          description: guest,
          date: b.checkOut.toISOString(),
          bookingId: b.id,
          propertyId: b.propertyId,
          userId: b.userId ?? undefined,
        });
      }
    }

    // ── Payments ──────────────────────────────────────────────────────────────
    for (const p of payments) {
      const payer = p.user?.name || p.user?.email || "User";

      if (p.paymentStatus === "PAID" && p.paidAt && inRange(p.paidAt, start, end)) {
        addEvent(days, p.paidAt, {
          id: `payment-paid-${p.id}`,
          type: "PAYMENT_PAID",
          title: "Payment received",
          description: `${payer} — ${p.currency} ${p.amount.toLocaleString()}`,
          date: p.paidAt.toISOString(),
          amount: p.amount,
          currency: p.currency,
          userId: p.userId,
        });
      } else if (p.paymentStatus === "FAILED" && inRange(p.createdAt, start, end)) {
        addEvent(days, p.createdAt, {
          id: `payment-failed-${p.id}`,
          type: "PAYMENT_FAILED",
          title: "Payment failed",
          description: `${payer} — ${p.currency} ${p.amount.toLocaleString()}`,
          date: p.createdAt.toISOString(),
          amount: p.amount,
          currency: p.currency,
          userId: p.userId,
        });
      }
    }

    // ── Subscriptions ─────────────────────────────────────────────────────────
    for (const s of subscriptions) {
      const holder = s.user?.name || s.user?.email || "Host";
      const planName = s.plan?.name ?? "Plan";

      if (s.renewalDate && inRange(s.renewalDate, start, end)) {
        addEvent(days, s.renewalDate, {
          id: `sub-renewal-${s.id}`,
          type: "SUBSCRIPTION_RENEWAL",
          title: "Subscription renewal",
          description: `${holder} — ${planName}`,
          date: s.renewalDate.toISOString(),
          userId: s.userId,
        });
      }

      if (s.cancelledAt && inRange(s.cancelledAt, start, end)) {
        addEvent(days, s.cancelledAt, {
          id: `sub-cancelled-${s.id}`,
          type: "SUBSCRIPTION_CANCELLED",
          title: "Subscription cancelled",
          description: `${holder} — ${planName}`,
          date: s.cancelledAt.toISOString(),
          userId: s.userId,
        });
      }
    }

    // ── Properties ────────────────────────────────────────────────────────────
    for (const prop of properties) {
      const host = prop.host?.name || prop.host?.email || "Host";
      addEvent(days, prop.createdAt, {
        id: `property-created-${prop.id}`,
        type: "PROPERTY_CREATED",
        title: "New property listed",
        description: `${prop.name} by ${host}`,
        date: prop.createdAt.toISOString(),
        propertyId: prop.id,
        userId: prop.hostId ?? undefined,
      });
    }

    return NextResponse.json({ year, month, days });
  } catch (err) {
    console.error("[CalendarAPI] Error:", err);
    return NextResponse.json({ error: "Failed to load calendar data." }, { status: 500 });
  }
}
