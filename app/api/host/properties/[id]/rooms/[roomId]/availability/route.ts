import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import type { AvailabilityBlockReason } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string; roomId: string }> };

const VALID_REASONS: AvailabilityBlockReason[] = [
  "MAINTENANCE", "PERSONAL_USE", "RENOVATION", "CLEANING", "SEASONAL_CLOSURE", "OTHER",
];

const ACTIVE_STATUSES = ["CONFIRMED", "PENDING"] as const;
const MAX_RANGE_DAYS = 365;

async function authorizeForRoom(propertyId: number, roomId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 as const };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 as const };

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: { select: { id: true, hostId: true, name: true } } },
  });
  if (!room || room.propertyId !== propertyId) {
    return { error: "Room not found.", status: 404 as const };
  }
  if (!isSuperAdmin(currentUser) && room.property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 as const };
  }

  return { user: currentUser, room };
}

/**
 * GET /api/host/properties/[id]/rooms/[roomId]/availability?year=Y&month=M
 * Returns bookings for the property and availability blocks for the room
 * within the requested month (±7 day buffer for calendar filler cells).
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id, roomId } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });

    const auth = await authorizeForRoom(propertyId, roomId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(req.url);
    const now = new Date();
    const year = Number(url.searchParams.get("year")) || now.getUTCFullYear();
    const month = Number(url.searchParams.get("month")) || now.getUTCMonth() + 1;

    if (month < 1 || month > 12 || year < 2020 || year > 2050) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    }

    const rangeStart = new Date(Date.UTC(year, month - 1, 1));
    rangeStart.setUTCDate(rangeStart.getUTCDate() - 7);
    const rangeEnd = new Date(Date.UTC(year, month, 1));
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 7);

    const [bookings, blocks] = await Promise.all([
      prisma.booking.findMany({
        where: {
          propertyId,
          status: { in: [...ACTIVE_STATUSES] },
          checkIn: { lt: rangeEnd },
          checkOut: { gt: rangeStart },
        },
        select: { id: true, checkIn: true, checkOut: true, status: true, guests: true },
        orderBy: { checkIn: "asc" },
      }),
      prisma.roomAvailabilityBlock.findMany({
        where: {
          roomId,
          startDate: { lt: rangeEnd },
          endDate: { gt: rangeStart },
        },
        select: { id: true, startDate: true, endDate: true, reason: true, note: true },
        orderBy: { startDate: "asc" },
      }),
    ]);

    return NextResponse.json({ bookings, blocks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch availability." }, { status: 500 });
  }
}

/**
 * POST /api/host/properties/[id]/rooms/[roomId]/availability
 * Creates a manual availability block.
 * Body: { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD", reason, note? }
 * Rejected if any active booking overlaps the requested dates.
 */
export async function POST(req: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const { id, roomId } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });

    const auth = await authorizeForRoom(propertyId, roomId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { startDate: startStr, endDate: endStr } = body;

    if (!startStr || !endStr) {
      return NextResponse.json({ error: "startDate and endDate are required." }, { status: 400 });
    }

    const startDate = new Date(startStr + "T00:00:00.000Z");
    const endDate = new Date(endStr + "T00:00:00.000Z");

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    if (endDate <= startDate) {
      return NextResponse.json({ error: "endDate must be after startDate." }, { status: 400 });
    }

    const diffDays = (endDate.getTime() - startDate.getTime()) / 86_400_000;
    if (diffDays > MAX_RANGE_DAYS) {
      return NextResponse.json(
        { error: `Cannot block more than ${MAX_RANGE_DAYS} days at once.` },
        { status: 400 }
      );
    }

    const reason: AvailabilityBlockReason = VALID_REASONS.includes(body.reason)
      ? body.reason
      : "OTHER";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;

    // Prevent blocking over existing active bookings
    const bookingConflict = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: [...ACTIVE_STATUSES] },
        checkIn: { lt: endDate },
        checkOut: { gt: startDate },
      },
      select: { id: true, checkIn: true, checkOut: true },
    });

    if (bookingConflict) {
      return NextResponse.json(
        {
          error:
            "Cannot block these dates — an active booking already overlaps this period. Cancel the booking first if needed.",
        },
        { status: 409 }
      );
    }

    const block = await prisma.roomAvailabilityBlock.create({
      data: { roomId, startDate, endDate, reason, note },
      select: { id: true, startDate: true, endDate: true, reason: true, note: true },
    });

    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create availability block." }, { status: 500 });
  }
}
