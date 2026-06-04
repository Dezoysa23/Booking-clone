import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";
import { canCreateProperty } from "@/lib/subscription";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

function isValidImagePath(p: string): boolean {
  if (!p || p.length > 2048) return false;
  if (p.startsWith("http://") || p.startsWith("https://")) return true;
  if (p.startsWith("/uploads/properties/") && !p.includes("..") && !p.includes("\0")) return true;
  return false;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const properties = await prisma.property.findMany({
      where: { hostId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    });

    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json({ error: "Failed to fetch properties." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const gate = await canCreateProperty(currentUser.id);
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason, upgradeRequired: gate.upgradeRequired }, { status: 403 });
    }

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

    const property = await prisma.property.create({
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
        reviews: 0,
        hostId: currentUser.id,
      },
    });

    return NextResponse.json({ success: true, property });
  } catch {
    return NextResponse.json({ error: "Failed to create property." }, { status: 500 });
  }
}
