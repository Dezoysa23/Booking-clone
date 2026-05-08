import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to create a booking." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      nights,
      totalPrice,
    } = body;

    if (
      !propertyId ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !nights ||
      !totalPrice
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId: Number(propertyId),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: Number(guests),
        nights: Number(nights),
        totalPrice: Number(totalPrice),
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Booking creation failed:", error);

    return NextResponse.json(
      { error: "Failed to create booking." },
      { status: 500 }
    );
  }
}