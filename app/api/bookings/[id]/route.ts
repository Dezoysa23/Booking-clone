import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/bookings/[id] — fetch a single booking (must own it)
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = Number(id);

    if (Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: "You are not allowed to view this booking." },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking." },
      { status: 500 }
    );
  }
}
