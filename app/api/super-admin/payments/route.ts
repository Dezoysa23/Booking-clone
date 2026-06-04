import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isSuperAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments." }, { status: 500 });
  }
}
