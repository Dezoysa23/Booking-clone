import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

type RouteParams = { params: Promise<{ id: string; roomId: string }> };

async function authorizeForRoom(propertyId: number, roomId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized.", status: 401 as const };
  if (!isHostOrAdmin(currentUser)) return { error: "Forbidden.", status: 403 as const };

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: { select: { id: true, hostId: true } } },
  });
  if (!room || room.propertyId !== propertyId) {
    return { error: "Room not found.", status: 404 as const };
  }
  if (!isSuperAdmin(currentUser) && room.property.hostId !== currentUser.id) {
    return { error: "You do not own this property.", status: 403 as const };
  }

  return { user: currentUser, room };
}

// PATCH /api/host/properties/[id]/rooms/[roomId]
export async function PATCH(req: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const { id, roomId } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });

    const auth = await authorizeForRoom(propertyId, roomId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    if (name !== undefined && !name) return NextResponse.json({ error: "Room name cannot be empty." }, { status: 400 });

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(name ? { name } : {}),
        ...(typeof body.description === "string" ? { description: body.description.trim() || null } : {}),
        ...(body.maxGuests != null ? { maxGuests: Number(body.maxGuests) || null } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      },
      select: { id: true, name: true, description: true, maxGuests: true, isActive: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, room: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update room." }, { status: 500 });
  }
}

// DELETE /api/host/properties/[id]/rooms/[roomId]
export async function DELETE(req: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const { id, roomId } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });

    const auth = await authorizeForRoom(propertyId, roomId);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await prisma.room.delete({ where: { id: roomId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete room." }, { status: 500 });
  }
}
