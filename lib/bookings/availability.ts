import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type DateRange = { checkIn: Date; checkOut: Date };

// Active booking statuses that block date availability
const ACTIVE_STATUSES = ["CONFIRMED", "PENDING"] as const;

export async function getBookedDateRanges(propertyId: number): Promise<DateRange[]> {
  return prisma.booking.findMany({
    where: {
      propertyId,
      status: { in: [...ACTIVE_STATUSES] },
    },
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: "asc" },
  });
}

/**
 * Throws an error if the requested dates conflict with any active booking OR
 * any manual RoomAvailabilityBlock on any room belonging to the property.
 *
 * Overlap rule: newStart < existingEnd AND newEnd > existingStart
 *
 * Pass a Prisma transaction client (`tx`) when calling from inside a
 * `prisma.$transaction` block — this makes the check and the subsequent
 * booking creation atomic and prevents double-booking under concurrent requests.
 */
export async function assertPropertyAvailable(
  propertyId: number,
  checkIn: Date,
  checkOut: Date,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;

  // 1 — Check existing bookings
  const bookingConflict = await db.booking.findFirst({
    where: {
      propertyId,
      status: { in: [...ACTIVE_STATUSES] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true },
  });

  if (bookingConflict) {
    throw new Error("These dates are not available. Please choose different dates.");
  }

  // 2 — Check manual room availability blocks for any room on this property
  const blockConflict = await db.roomAvailabilityBlock.findFirst({
    where: {
      room: { propertyId },
      startDate: { lt: checkOut },
      endDate: { gt: checkIn },
    },
    select: { id: true, reason: true },
  });

  if (blockConflict) {
    throw new Error(
      "These dates are not available — the property is temporarily blocked (e.g. maintenance or closure). Please choose different dates."
    );
  }
}
