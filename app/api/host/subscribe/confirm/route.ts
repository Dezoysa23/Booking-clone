import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { activateSubscription } from "@/lib/subscription";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const subscriptionId = typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId is required." }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    // Only the subscription owner can confirm it
    if (subscription.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({ success: true, alreadyActive: true });
    }

    // Mark pending payment as paid
    await prisma.payment.updateMany({
      where: { subscriptionId, paymentStatus: "PENDING" },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
        transactionReference: `MOCK_TXN_${Date.now()}`,
        providerSessionId: sessionId || null,
      },
    });

    await activateSubscription(subscriptionId, subscription.billingCycle);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription confirmation failed:", error);
    return NextResponse.json({ error: "Failed to activate subscription." }, { status: 500 });
  }
}
