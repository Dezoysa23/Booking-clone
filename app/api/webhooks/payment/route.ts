import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/lib/payment";
import { activateSubscription } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") ?? "";

    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = paymentService.parseWebhookPayload(rawBody);

    if (payload.type === "payment.success" && payload.subscriptionId) {
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
          transactionReference: payload.transactionReference ?? null,
          providerSessionId: payload.sessionId,
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
