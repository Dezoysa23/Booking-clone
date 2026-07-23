import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import type { UserPropertyPhotoStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_STATUSES: UserPropertyPhotoStatus[] = ["APPROVED", "REJECTED"];

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isSuperAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const { id } = await params;
    const photo = await prisma.userPropertyPhoto.findUnique({ where: { id } });
    if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });

    const body = await request.json();
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or REJECTED." },
        { status: 400 }
      );
    }
    const status: UserPropertyPhotoStatus = body.status;

    const updated = await prisma.userPropertyPhoto.update({
      where: { id },
      data: {
        status,
        reviewedById: currentUser.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, photo: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update photo." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isSuperAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const { id } = await params;
    const photo = await prisma.userPropertyPhoto.findUnique({ where: { id } });
    if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });

    await prisma.userPropertyPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete photo." }, { status: 500 });
  }
}
