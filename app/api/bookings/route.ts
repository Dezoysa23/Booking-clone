import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertPropertyAvailable } from "@/lib/bookings/availability";
import { sendBookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";

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

    const limited = await enforceRateLimit(
      `booking:${userId}`,
      10,
      10 * 60 * 1000,
      "Too many booking attempts. Please try again later."
    );
    if (limited) return limited;

    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests } = body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Missing required booking fields." },
        { status: 400 }
      );
    }

    // Validate and parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid check-in or check-out date." },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past." },
        { status: 400 }
      );
    }

    // Cap how far out a booking can be made (guards against absurd/abuse dates)
    const maxFuture = new Date(today);
    maxFuture.setFullYear(maxFuture.getFullYear() + 2);
    if (checkInDate > maxFuture) {
      return NextResponse.json(
        { error: "Check-in date is too far in the future." },
        { status: 400 }
      );
    }

    // Validate guests
    const guestsNum = Number(guests);
    if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 20) {
      return NextResponse.json(
        { error: "Guests must be between 1 and 20." },
        { status: 400 }
      );
    }

    // Validate property ID
    const propertyIdNum = Number(propertyId);
    if (isNaN(propertyIdNum) || !Number.isInteger(propertyIdNum)) {
      return NextResponse.json(
        { error: "Invalid property ID." },
        { status: 400 }
      );
    }

    // Fetch property to get authoritative price (never trust client-sent price)
    const property = await prisma.property.findUnique({
      where: { id: propertyIdNum },
      select: { id: true, price: true, name: true, maxGuests: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 }
      );
    }

    // Enforce the property's guest capacity server-side
    if (property.maxGuests != null && guestsNum > property.maxGuests) {
      return NextResponse.json(
        { error: `This property allows a maximum of ${property.maxGuests} guests.` },
        { status: 400 }
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

    if (nightsNum > 365) {
      return NextResponse.json(
        { error: "Booking cannot exceed 365 nights." },
        { status: 400 }
      );
    }

    // Server-side availability check — prevents overlapping bookings even if
    // the client bypasses the frontend check
    try {
      await assertPropertyAvailable(propertyIdNum, checkInDate, checkOutDate);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "These dates are not available." },
        { status: 409 }
      );
    }

    const totalPrice = nightsNum * property.price;

    const booking = await prisma.booking.create({
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
