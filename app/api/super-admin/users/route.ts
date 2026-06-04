import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isSuperAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { bookings: true, properties: true } },
      },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
