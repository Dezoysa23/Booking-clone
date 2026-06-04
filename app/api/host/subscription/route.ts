import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!isHostOrAdmin(currentUser)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const subscription = await getSubscription(currentUser.id);
    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscription." }, { status: 500 });
  }
}
