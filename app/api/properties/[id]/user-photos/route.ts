import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { savePropertyImage } from "@/lib/uploads/image-upload";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
    }

    const photos = await prisma.userPropertyPhoto.findMany({
      where: { propertyId, status: "APPROVED" },
      select: { id: true, imageUrl: true, caption: true, category: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ error: "Failed to fetch photos." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "You must be logged in to submit a photo." }, { status: 401 });
    }

    const limited = await enforceRateLimit(
      `upload:user-photo:${currentUser.id}`,
      20,
      10 * 60 * 1000,
      "Too many photo submissions. Please try again later."
    );
    if (limited) return limited;

    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } });
    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const caption = typeof formData.get("caption") === "string"
      ? (formData.get("caption") as string).trim().slice(0, 300)
      : undefined;
    const category = typeof formData.get("category") === "string"
      ? (formData.get("category") as string).trim().slice(0, 50)
      : undefined;

    const imageUrl = await savePropertyImage(file);

    const photo = await prisma.userPropertyPhoto.create({
      data: {
        propertyId,
        userId: currentUser.id,
        imageUrl,
        caption: caption || null,
        category: category || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      photo,
      message: "Your photo has been submitted and is pending review.",
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit photo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
