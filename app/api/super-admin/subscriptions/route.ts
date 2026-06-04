import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isSuperAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscriptions." }, { status: 500 });
  }
}
