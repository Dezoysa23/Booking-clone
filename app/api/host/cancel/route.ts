import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: currentUser.id },
    });

    if (!subscription) return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    if (subscription.status === "CANCELLED") return NextResponse.json({ error: "Subscription is already cancelled." }, { status: 400 });

    await prisma.subscription.update({
      where: { userId: currentUser.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel subscription." }, { status: 500 });
  }
}
