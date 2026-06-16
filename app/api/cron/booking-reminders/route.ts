import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/email/templates/booking-reminder";

/**
 * GET /api/cron/booking-reminders
 *
 * Finds confirmed bookings with check-in within the next 24 hours that have not
 * yet received a reminder email, sends them, and marks reminderEmailSentAt.
 *
 * Call this endpoint from a cron service (e.g. Vercel Cron, GitHub Actions,
 * Upstash QStash) on a schedule — e.g. every hour or once daily.
 *
 * Protect with CRON_SECRET: set the env var and send it as ?secret=...
 * CRON_SECRET is REQUIRED in production — the endpoint returns 503 if not set.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed in production — an unconfigured cron endpoint lets anyone trigger emails
  if (process.env.NODE_ENV === "production" && !cronSecret) {
    console.error("[Cron] CRON_SECRET is not set. Endpoint is disabled until it is configured.");
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  if (cronSecret) {
    const { searchParams } = new URL(request.url);
    const provided = searchParams.get("secret") ?? "";

    // Timing-safe comparison prevents timing-based enumeration of the secret
    let isValid = false;
    try {
      const providedBuf = Buffer.from(provided, "utf8");
      const secretBuf = Buffer.from(cronSecret, "utf8");
      isValid =
        providedBuf.length === secretBuf.length &&
        timingSafeEqual(providedBuf, secretBuf);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminderEmailSentAt: null,
        checkIn: {
          gte: now,
          lte: in24h,
        },
      },
      include: {
        user: { select: { email: true, name: true } },
        property: { select: { name: true } },
      },
    });

    let sent = 0;
    let failed = 0;

    for (const booking of bookings) {
      if (!booking.user) continue;

      try {
        await sendBookingReminderEmail({
          toEmail: booking.user.email,
          toName: booking.user.name ?? undefined,
          bookingId: booking.id,
          propertyName: booking.property.name,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderEmailSentAt: new Date() },
        });

        sent++;
      } catch (err) {
        console.error(`[Cron] Failed reminder for booking #${booking.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      checked: bookings.length,
    });
  } catch (err) {
    console.error("[Cron] booking-reminders failed:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
