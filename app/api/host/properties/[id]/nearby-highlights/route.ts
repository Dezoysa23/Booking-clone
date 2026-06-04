import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import type { NearbyHighlightCategory } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_CATEGORIES: NearbyHighlightCategory[] = [
  "VIEWPOINT", "BEACH", "NATURE", "RESTAURANT", "CAFE",
  "CULTURE", "HISTORY", "SHOPPING", "ACTIVITY", "TRANSPORT", "OTHER",
];

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function authorizeForProperty(propertyId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 as const };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 as const };

  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true, hostId: true } });
  if (!property) return { error: "Property not found.", status: 404 as const };

  if (!isSuperAdmin(currentUser) && property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 as const };
  }

  return { user: currentUser };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeForProperty(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const highlights = await prisma.nearbyHighlight.findMany({
      where: { propertyId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ highlights });
  } catch {
    return NextResponse.json({ error: "Failed to fetch highlights." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeForProperty(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const title = safeString(body.title);
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "Title must be 200 characters or fewer." }, { status: 400 });

    const category: NearbyHighlightCategory = VALID_CATEGORIES.includes(body.category)
      ? body.category
      : "OTHER";

    const description = safeString(body.description) || undefined;
    const locationName = safeString(body.locationName) || undefined;
    const imageUrl = safeString(body.imageUrl) || undefined;
    const distance = body.distance != null ? Number(body.distance) : undefined;
    const distanceUnit = safeString(body.distanceUnit) || "km";
    const sortOrder = Number(body.sortOrder) || 0;

    const highlight = await prisma.nearbyHighlight.create({
      data: {
        propertyId,
        title,
        description,
        category,
        distance: distance !== undefined && !isNaN(distance) ? distance : undefined,
        distanceUnit,
        locationName,
        imageUrl,
        sortOrder,
      },
    });

    return NextResponse.json({ success: true, highlight }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create highlight." }, { status: 500 });
  }
}
