import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { isSafeImageUrl } from "@/lib/uploads/image-upload";
import { safeString } from "@/lib/validation/common";
import type { NearbyHighlightCategory } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_CATEGORIES: NearbyHighlightCategory[] = [
  "VIEWPOINT", "BEACH", "NATURE", "RESTAURANT", "CAFE",
  "CULTURE", "HISTORY", "SHOPPING", "ACTIVITY", "TRANSPORT", "OTHER",
];

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

    const descriptionRaw = safeString(body.description);
    if (descriptionRaw.length > 1000) {
      return NextResponse.json({ error: "Description must be 1000 characters or fewer." }, { status: 400 });
    }
    const description = descriptionRaw || undefined;

    const locationNameRaw = safeString(body.locationName);
    if (locationNameRaw.length > 200) {
      return NextResponse.json({ error: "Location name must be 200 characters or fewer." }, { status: 400 });
    }
    const locationName = locationNameRaw || undefined;

    const imageUrlRaw = safeString(body.imageUrl);
    if (imageUrlRaw && !isSafeImageUrl(imageUrlRaw)) {
      return NextResponse.json({ error: "Image URL must be a local path or an https:// URL." }, { status: 400 });
    }
    const imageUrl = imageUrlRaw || undefined;

    let distance: number | undefined;
    if (body.distance != null && body.distance !== "") {
      const d = Number(body.distance);
      if (isNaN(d) || d < 0 || d > 100000) {
        return NextResponse.json({ error: "Distance must be between 0 and 100000." }, { status: 400 });
      }
      distance = d;
    }
    const distanceUnit = safeString(body.distanceUnit).slice(0, 10) || "km";
    const sortOrder = Math.min(Math.max(0, Math.floor(Number(body.sortOrder) || 0)), 10000);

    const highlight = await prisma.nearbyHighlight.create({
      data: {
        propertyId,
        title,
        description,
        category,
        distance,
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
