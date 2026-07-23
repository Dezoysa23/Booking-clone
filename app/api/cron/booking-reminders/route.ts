import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/email/templates/booking-reminder";
import { timingSafeEqualStr } from "@/lib/security/secure-compare";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

/**
 * GET /api/cron/booking-reminders
 *
 * Finds confirmed bookings with check-in within the next 24 hours that have not
 * yet received a reminder email, sends them, and marks reminderEmailSentAt.
 *
 * Call this endpoint from a cron service (e.g. Vercel Cron, GitHub Actions,
 * Upstash QStash) on a schedule — e.g. every hour or once daily.
 *
 * Protect with CRON_SECRET: set the env var and send it as
 * `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically).
 */
export async function GET(request: Request) {
  // Fail closed: without a configured secret the endpoint must not run.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Cron not configured." }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";
  if (!timingSafeEqualStr(provided, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = await enforceRateLimit(
    `cron:booking-reminders:${getClientIp(request)}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

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
