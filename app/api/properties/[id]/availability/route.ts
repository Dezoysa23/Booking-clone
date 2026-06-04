import { NextResponse } from "next/server";
import { getBookedDateRanges } from "@/lib/bookings/availability";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const propertyId = Number(id);

  if (Number.isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }

  try {
    const ranges = await getBookedDateRanges(propertyId);
    return NextResponse.json({
      ranges: ranges.map((r) => ({
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load availability." }, { status: 500 });
  }
}
