import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID." },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property." },
      { status: 500 }
    );
  }
}
