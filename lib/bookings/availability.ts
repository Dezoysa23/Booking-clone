import { prisma } from "@/lib/prisma";

export type DateRange = { checkIn: Date; checkOut: Date };

// Active statuses that block date availability
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
 * Throws an error if the requested dates conflict with any active booking.
 * Call this before creating a booking to enforce server-side availability.
 *
 * Overlap rule: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
 */
export async function assertPropertyAvailable(
  propertyId: number,
  checkIn: Date,
  checkOut: Date
): Promise<void> {
  const conflict = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: [...ACTIVE_STATUSES] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true },
  });

  if (conflict) {
    throw new Error("These dates are not available. Please choose different dates.");
  }
}
