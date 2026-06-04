import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
    }

    const highlights = await prisma.nearbyHighlight.findMany({
      where: { propertyId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ highlights });
  } catch {
    return NextResponse.json({ error: "Failed to fetch nearby highlights." }, { status: 500 });
  }
}
