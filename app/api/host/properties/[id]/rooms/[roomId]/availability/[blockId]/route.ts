import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

type RouteParams = { params: Promise<{ id: string; roomId: string; blockId: string }> };

// DELETE /api/host/properties/[id]/rooms/[roomId]/availability/[blockId]
export async function DELETE(req: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const { id, roomId, blockId } = await params;
    const propertyId = Number(id);
    if (Number.isNaN(propertyId)) return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });

    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    // Verify the block exists and belongs to the correct room + property
    const block = await prisma.roomAvailabilityBlock.findUnique({
      where: { id: blockId },
      include: {
        room: {
          select: { propertyId: true, property: { select: { hostId: true } } },
        },
      },
    });

    if (!block || block.roomId !== roomId || block.room.propertyId !== propertyId) {
      return NextResponse.json({ error: "Block not found." }, { status: 404 });
    }

    if (!isSuperAdmin(currentUser) && block.room.property.hostId !== currentUser.id) {
      return NextResponse.json({ error: "You do not own this property." }, { status: 403 });
    }

    await prisma.roomAvailabilityBlock.delete({ where: { id: blockId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete availability block." }, { status: 500 });
  }
}
