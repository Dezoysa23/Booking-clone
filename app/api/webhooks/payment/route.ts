import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/lib/payment";
import { activateSubscription } from "@/lib/subscription";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(
      `webhook:payment:${getClientIp(request)}`,
      60,
      60 * 1000
    );
    if (limited) return limited;

    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") ?? "";

    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = paymentService.parseWebhookPayload(rawBody);
    if (typeof payload.type !== "string") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    if (
      payload.type === "payment.success" &&
      typeof payload.subscriptionId === "string" &&
      payload.subscriptionId
    ) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: payload.subscriptionId },
      });

      if (!subscription) {
        return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
      }

      // Mark payment as paid
      await prisma.payment.updateMany({
        where: { subscriptionId: payload.subscriptionId, paymentStatus: "PENDING" },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          transactionReference:
            typeof payload.transactionReference === "string"
              ? payload.transactionReference
              : null,
          providerSessionId:
            typeof payload.sessionId === "string" ? payload.sessionId : null,
        },
      });

      // Activate subscription + promote user to HOST
      await activateSubscription(payload.subscriptionId, subscription.billingCycle);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
