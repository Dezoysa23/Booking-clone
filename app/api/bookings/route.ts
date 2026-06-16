import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { assertPropertyAvailable } from "@/lib/bookings/availability";
import { sendBookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";
import { createBookingSchema, firstError } from "@/lib/validation/schemas";

// GET /api/bookings — returns all bookings for the logged-in user
export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view bookings." },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create a new booking
// nights and totalPrice are computed server-side from the property's actual price.
// Never trust these values from the client.
export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to create a booking." },
        { status: 401 }
      );
    }

    const raw = await request.json();
    const parsed = createBookingSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { propertyId: propertyIdNum, checkIn, checkOut, guests: guestsNum } = parsed.data;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past." },
        { status: 400 }
      );
    }

    // Fetch property to get authoritative price (never trust client-sent price)
    const property = await prisma.property.findUnique({
      where: { id: propertyIdNum },
      select: { id: true, price: true, name: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 }
      );
    }

    // Compute nights and total server-side
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const nightsNum = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (nightsNum < 1) {
      return NextResponse.json(
        { error: "Booking must be for at least 1 night." },
        { status: 400 }
      );
    }

    const totalPrice = nightsNum * property.price;

    // Availability check and booking creation run inside a SERIALIZABLE transaction
    // so concurrent requests cannot both pass the overlap check and create a double-booking.
    // Prisma P2034 = transaction serialization failure — treat as 409, same as a conflict.
    let booking;
    try {
      booking = await prisma.$transaction(
        async (tx) => {
          await assertPropertyAvailable(propertyIdNum, checkInDate, checkOutDate, tx);
          return tx.booking.create({
            data: {
              userId,
              propertyId: propertyIdNum,
              checkIn: checkInDate,
              checkOut: checkOutDate,
              guests: guestsNum,
              nights: nightsNum,
              totalPrice,
              status: "CONFIRMED",
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2034"
      ) {
        return NextResponse.json(
          { error: "These dates are not available. Please try again." },
          { status: 409 }
        );
      }
      if (err instanceof Error && err.message.includes("not available")) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err; // unexpected error — propagates to the outer catch → 500
    }

    // Send confirmation email — fire-and-forget, never fail the booking on email error
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }).catch(() => null);

    if (userRecord) {
      sendBookingConfirmationEmail({
        toEmail: userRecord.email,
        toName: userRecord.name ?? undefined,
        bookingId: booking.id,
        propertyName: property.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestsNum,
        nights: nightsNum,
        totalPrice,
      }).catch((err) => console.error("[Email] Confirmation send failed:", err));
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create booking." },
      { status: 500 }
    );
  }
}
