import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safePositiveNumber(value: string | null): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
}

function safePositiveInt(value: string | null): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const n = Number(value);
  return isNaN(n) || !Number.isInteger(n) || n < 1 ? undefined : n;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const destination = searchParams.get("destination")?.trim() || "";
    const minPrice = safePositiveNumber(searchParams.get("minPrice"));
    const maxPrice = safePositiveNumber(searchParams.get("maxPrice"));
    const minRating = safePositiveNumber(searchParams.get("minRating"));
    const sortBy = searchParams.get("sortBy") || "";
    const limit = safePositiveInt(searchParams.get("limit"));

    type OrderBy =
      | { price: "asc" | "desc" }
      | { rating: "asc" | "desc" }
      | Array<{ rating: "desc" } | { price: "asc" }>;

    let orderBy: OrderBy = [{ rating: "desc" }, { price: "asc" }];
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    else if (sortBy === "price_desc") orderBy = { price: "desc" };
    else if (sortBy === "rating_desc") orderBy = { rating: "desc" };
    else if (sortBy === "rating_asc") orderBy = { rating: "asc" };

    const properties = await prisma.property.findMany({
      where: {
        ...(destination
          ? { location: { contains: destination, mode: "insensitive" } }
          : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
              },
            }
          : {}),
        ...(minRating !== undefined ? { rating: { gte: minRating } } : {}),
      },
      orderBy,
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({ properties, total: properties.length });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties." },
      { status: 500 }
    );
  }
}
