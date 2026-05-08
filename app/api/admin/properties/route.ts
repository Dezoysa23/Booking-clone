import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not allowed to do this." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      location,
      price,
      rating,
      image,
      description,
      amenities,
    } = body;

    if (
      !name ||
      !location ||
      !price ||
      !rating ||
      !image ||
      !description
    ) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        name,
        location,
        price: Number(price),
        rating: Number(rating),
        image,
        description,
        amenities: amenities
          ? amenities.split(",").map((item: string) => item.trim())
          : [],
        gallery: [image],
        reviews: 0,
      },
    });

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Create property failed:", error);

    return NextResponse.json(
      { error: "Failed to create property." },
      { status: 500 }
    );
  }
}