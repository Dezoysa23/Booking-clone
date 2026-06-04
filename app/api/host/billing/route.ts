import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const payments = await prisma.payment.findMany({
      where: { userId: currentUser.id },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch billing history." }, { status: 500 });
  }
}
