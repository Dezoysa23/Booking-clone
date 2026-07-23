import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { isSafeImageUrl } from "@/lib/uploads/image-upload";
import { safeString } from "@/lib/validation/common";
import type { NearbyHighlightCategory } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string; hid: string }> };

const VALID_CATEGORIES: NearbyHighlightCategory[] = [
  "VIEWPOINT", "BEACH", "NATURE", "RESTAURANT", "CAFE",
  "CULTURE", "HISTORY", "SHOPPING", "ACTIVITY", "TRANSPORT", "OTHER",
];

async function authorizeHighlight(propertyId: number, highlightId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 as const };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 as const };

  const highlight = await prisma.nearbyHighlight.findUnique({
    where: { id: highlightId },
    include: { property: { select: { hostId: true } } },
  });
  if (!highlight || highlight.propertyId !== propertyId) {
    return { error: "Highlight not found.", status: 404 as const };
  }
  if (!isSuperAdmin(currentUser) && highlight.property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 as const };
  }

  return { user: currentUser, highlight };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id, hid } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeHighlight(propertyId, hid);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const title = safeString(body.title);
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "Title must be 200 characters or fewer." }, { status: 400 });

    const category: NearbyHighlightCategory = VALID_CATEGORIES.includes(body.category)
      ? body.category
      : auth.highlight.category;

    const description = safeString(body.description);
    if (description.length > 1000) {
      return NextResponse.json({ error: "Description must be 1000 characters or fewer." }, { status: 400 });
    }

    const locationName = safeString(body.locationName);
    if (locationName.length > 200) {
      return NextResponse.json({ error: "Location name must be 200 characters or fewer." }, { status: 400 });
    }

    const imageUrl = safeString(body.imageUrl);
    if (imageUrl && !isSafeImageUrl(imageUrl)) {
      return NextResponse.json({ error: "Image URL must be a local path or an https:// URL." }, { status: 400 });
    }

    let distance: number | null = null;
    if (body.distance != null && body.distance !== "") {
      const d = Number(body.distance);
      if (isNaN(d) || d < 0 || d > 100000) {
        return NextResponse.json({ error: "Distance must be between 0 and 100000." }, { status: 400 });
      }
      distance = d;
    }

    const updated = await prisma.nearbyHighlight.update({
      where: { id: hid },
      data: {
        title,
        description: description || null,
        category,
        distance,
        distanceUnit: safeString(body.distanceUnit).slice(0, 10) || "km",
        locationName: locationName || null,
        imageUrl: imageUrl || null,
        isActive: body.isActive !== false,
        sortOrder: Math.min(Math.max(0, Math.floor(Number(body.sortOrder) || 0)), 10000),
      },
    });

    return NextResponse.json({ success: true, highlight: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update highlight." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id, hid } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeHighlight(propertyId, hid);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await prisma.nearbyHighlight.delete({ where: { id: hid } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete highlight." }, { status: 500 });
  }
}
