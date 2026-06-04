import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import type { NearbyHighlightCategory } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string; hid: string }> };

const VALID_CATEGORIES: NearbyHighlightCategory[] = [
  "VIEWPOINT", "BEACH", "NATURE", "RESTAURANT", "CAFE",
  "CULTURE", "HISTORY", "SHOPPING", "ACTIVITY", "TRANSPORT", "OTHER",
];

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

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

    const category: NearbyHighlightCategory = VALID_CATEGORIES.includes(body.category)
      ? body.category
      : auth.highlight.category;

    const updated = await prisma.nearbyHighlight.update({
      where: { id: hid },
      data: {
        title,
        description: safeString(body.description) || null,
        category,
        distance: body.distance != null ? Number(body.distance) : null,
        distanceUnit: safeString(body.distanceUnit) || "km",
        locationName: safeString(body.locationName) || null,
        imageUrl: safeString(body.imageUrl) || null,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder) || 0,
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
