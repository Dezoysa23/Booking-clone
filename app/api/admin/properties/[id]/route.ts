import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

function parseGallery(galleryText: string | undefined, fallbackImage: string): string[] {
  if (!galleryText) return [fallbackImage];
  const urls = galleryText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return urls.length > 0 ? urls : [fallbackImage];
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function authorizeAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { response: NextResponse.json({ error: "You must be logged in." }, { status: 401 }) };
  }
  if (currentUser.role !== "ADMIN") {
    return { response: NextResponse.json({ error: "You are not allowed to do this." }, { status: 403 }) };
  }
  return { user: currentUser };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authorizeAdmin();
    if ("response" in auth) return auth.response;

    const { id } = await params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    const body = await request.json();

    const name = safeString(body.name);
    const location = safeString(body.location);
    const image = safeString(body.image);
    const description = safeString(body.description);
    const amenities = typeof body.amenities === "string" ? body.amenities : "";
    const galleryText = typeof body.galleryText === "string" ? body.galleryText : "";

    if (!name || !location || !image || !description) {
      return NextResponse.json(
        { error: "Name, location, image URL, and description are required." },
        { status: 400 }
      );
    }

    if (name.length > 200) {
      return NextResponse.json(
        { error: "Property name must be 200 characters or fewer." },
        { status: 400 }
      );
    }

    if (location.length > 200) {
      return NextResponse.json(
        { error: "Location must be 200 characters or fewer." },
        { status: 400 }
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { error: "Description must be 5000 characters or fewer." },
        { status: 400 }
      );
    }

    if (!image.startsWith("https://") && !image.startsWith("http://")) {
      return NextResponse.json(
        { error: "Image URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    if (image.length > 2048) {
      return NextResponse.json(
        { error: "Image URL is too long." },
        { status: 400 }
      );
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
        amenities: amenities
          ? amenities.split(",").map((item: string) => item.trim()).filter(Boolean)
          : [],
        gallery: parseGallery(galleryText, image),
      },
    });

    return NextResponse.json({ success: true, property: updated });
  } catch (error) {
    console.error("Update property failed:", error);
    return NextResponse.json({ error: "Failed to update property." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await authorizeAdmin();
    if ("response" in auth) return auth.response;

    const { id } = await params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
    }

    const existing = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    await prisma.property.delete({ where: { id: propertyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete property failed:", error);
    return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
  }
}
