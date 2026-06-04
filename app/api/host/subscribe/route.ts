import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { paymentService } from "@/lib/payment";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await request.json();
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    const billingCycle = body.billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY";

    if (!planId) return NextResponse.json({ error: "planId is required." }, { status: 400 });

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId, isActive: true } });
    if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

    const amount = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

    // Upsert subscription record (INACTIVE until payment confirmed)
    const subscription = await prisma.subscription.upsert({
      where: { userId: currentUser.id },
      create: {
        userId: currentUser.id,
        planId,
        status: "INACTIVE",
        billingCycle,
      },
      update: {
        planId,
        billingCycle,
        status: "INACTIVE",
        cancelledAt: null,
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId: currentUser.id,
        amount,
        currency: "LKR",
        paymentStatus: "PENDING",
      },
    });

    const origin = request.headers.get("origin") ?? "";
    const { checkoutUrl } = await paymentService.createCheckoutSession({
      userId: currentUser.id,
      subscriptionId: subscription.id,
      planName: plan.name,
      amount,
      currency: "LKR",
      billingCycle,
      successUrl: `${origin}/host/subscribe/confirm?session_id=MOCK&subscription_id=${subscription.id}`,
      cancelUrl: `${origin}/pricing`,
    });

    return NextResponse.json({ checkoutUrl, paymentId: payment.id });
  } catch {
    return NextResponse.json({ error: "Failed to initiate subscription." }, { status: 500 });
  }
}
