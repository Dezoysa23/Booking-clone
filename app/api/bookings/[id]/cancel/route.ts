import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to cancel a booking." },
        { status: 401 }
      );
    }

    const resolvedParams = await context.params;
    const bookingId = Number(resolvedParams.id);

    if (Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (existingBooking.userId !== userId) {
      return NextResponse.json(
        { error: "You are not allowed to cancel this booking." },
        { status: 403 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking cancellation failed:", error);

    return NextResponse.json(
      { error: "Failed to cancel booking." },
      { status: 500 }
    );
  }
}