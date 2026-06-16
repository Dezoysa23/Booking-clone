import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

type RouteParams = { params: Promise<{ id: string }> };

async function authorizeForProperty(propertyId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 as const };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 as const };

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, hostId: true, name: true },
  });
  if (!property) return { error: "Property not found.", status: 404 as const };

  if (!isSuperAdmin(currentUser) && property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 as const };
  }

  return { user: currentUser, property };
}

// GET /api/host/properties/[id]/rooms
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeForProperty(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const rooms = await prisma.room.findMany({
      where: { propertyId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, description: true, maxGuests: true, isActive: true, sortOrder: true },
    });

    return NextResponse.json({ rooms });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rooms." }, { status: 500 });
  }
}

// POST /api/host/properties/[id]/rooms
export async function POST(req: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const { id } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid ID." }, { status: 400 });

    const auth = await authorizeForProperty(propertyId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const name = (typeof body.name === "string" ? body.name.trim() : "");
    if (!name) return NextResponse.json({ error: "Room name is required." }, { status: 400 });
    if (name.length > 100) return NextResponse.json({ error: "Room name must be 100 characters or fewer." }, { status: 400 });

    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const maxGuests = body.maxGuests != null ? Number(body.maxGuests) : null;
    if (maxGuests !== null && (isNaN(maxGuests) || maxGuests < 1)) {
      return NextResponse.json({ error: "Max guests must be a positive number." }, { status: 400 });
    }

    const existing = await prisma.room.count({ where: { propertyId } });
    if (existing >= 50) return NextResponse.json({ error: "Maximum 50 rooms per property." }, { status: 400 });

    const room = await prisma.room.create({
      data: { propertyId, name, description, maxGuests, sortOrder: existing },
      select: { id: true, name: true, description: true, maxGuests: true, isActive: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create room." }, { status: 500 });
  }
}
