import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { activateSubscription } from "@/lib/subscription";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { paymentService } from "@/lib/payment";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const limited = await enforceRateLimit(
      `subscribe-confirm:${currentUser.id}`,
      10,
      10 * 60 * 1000
    );
    if (limited) return limited;

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

    if (paymentService.isMock) {
      // MOCK/DEV ONLY: no real payment provider is wired, so this confirm step
      // stands in for a completed checkout. When a real provider is configured
      // (paymentService.isMock === false), activation must come only from the
      // verified payment webhook — never from this client-called route.
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
    }

    // Real provider: do not trust the client to confirm payment. Only activate
    // once the provider's webhook has already marked the payment PAID.
    const paidPayment = await prisma.payment.findFirst({
      where: { subscriptionId, paymentStatus: "PAID" },
    });

    if (!paidPayment) {
      return NextResponse.json(
        { success: false, pending: true, error: "Payment not yet confirmed." },
        { status: 402 }
      );
    }

    await activateSubscription(subscriptionId, subscription.billingCycle);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription confirmation failed:", error);
    return NextResponse.json({ error: "Failed to activate subscription." }, { status: 500 });
  }
}
