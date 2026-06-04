import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

type RouteParams = { params: Promise<{ id: string }> };

function isValidImagePath(p: string): boolean {
  if (!p || p.length > 2048) return false;
  if (p.startsWith("http://") || p.startsWith("https://")) return true;
  if (p.startsWith("/uploads/properties/") && !p.includes("..") && !p.includes("\0")) return true;
  return false;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function authorizeOwner(propertyId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 };

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return { error: "Property not found.", status: 404 };

  if (!isSuperAdmin(currentUser) && property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 };
  }

  return { user: currentUser, property };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeOwner(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const name = safeString(body.name);
    const location = safeString(body.location);
    const image = safeString(body.image);
    const description = safeString(body.description);
    const amenities = typeof body.amenities === "string" ? body.amenities : "";
    const gallery: string[] = Array.isArray(body.gallery)
      ? body.gallery.map(safeString).filter(Boolean)
      : [];
    const maxGuests =
      body.maxGuests !== null && body.maxGuests !== undefined
        ? Number(body.maxGuests)
        : null;
    const facilities: string[] = Array.isArray(body.facilities)
      ? body.facilities.map(safeString).filter(Boolean)
      : [];
    const houseRules = body.houseRules && typeof body.houseRules === "object" ? body.houseRules : null;
    const areaInfo = body.areaInfo && typeof body.areaInfo === "object" ? body.areaInfo : null;

    if (!name || !location || !image || !description) {
      return NextResponse.json(
        { error: "Name, location, image, and description are required." },
        { status: 400 }
      );
    }

    if (!isValidImagePath(image)) {
      return NextResponse.json({ error: "Invalid main image." }, { status: 400 });
    }

    if (gallery.length > 10) {
      return NextResponse.json({ error: "Maximum 10 gallery images allowed." }, { status: 400 });
    }

    const invalidGallery = gallery.find((u) => !isValidImagePath(u));
    if (invalidGallery) {
      return NextResponse.json({ error: "One or more gallery images are invalid." }, { status: 400 });
    }

    const priceNum = Number(body.price);
    const ratingNum = Number(body.rating);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Price must be a positive number." }, { status: 400 });
    }
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return NextResponse.json({ error: "Rating must be between 1 and 10." }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name,
        location,
        price: Math.round(priceNum),
        rating: ratingNum,
        image,
        description,
        amenities: amenities ? amenities.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        gallery: gallery.length > 0 ? gallery : [image],
        maxGuests: maxGuests !== null && !isNaN(maxGuests) && maxGuests > 0 ? maxGuests : null,
        facilities,
        houseRules: houseRules,
        areaInfo: areaInfo,
      },
    });

    return NextResponse.json({ success: true, property: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update property." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeOwner(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await prisma.property.delete({ where: { id: propertyId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
  }
}
