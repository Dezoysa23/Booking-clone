import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
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
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: "You are not allowed to cancel this booking." },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking failed:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking." },
      { status: 500 }
    );
  }
}