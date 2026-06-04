import { prisma } from "@/lib/prisma";
import type { Subscription, SubscriptionPlan } from "@prisma/client";

export type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan };

/**
 * Returns the active subscription for a host, or null.
 * Only returns subscriptions with status ACTIVE.
 */
export async function getActiveSubscription(
  userId: string
): Promise<SubscriptionWithPlan | null> {
  return prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
  });
}

/**
 * Returns the subscription for a host regardless of status.
 */
export async function getSubscription(
  userId: string
): Promise<SubscriptionWithPlan | null> {
  return prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
}

/**
 * Checks whether a host can create a new property based on their subscription plan.
 * Returns an object with `allowed: true` or `allowed: false` with a reason message.
 */
export async function canCreateProperty(userId: string): Promise<
  | { allowed: true }
  | { allowed: false; reason: string; upgradeRequired: boolean }
> {
  const subscription = await getActiveSubscription(userId);

  if (!subscription) {
    return {
      allowed: false,
      reason: "You need an active subscription to list properties on Pearlora.",
      upgradeRequired: false,
    };
  }

  const plan = subscription.plan;

  // -1 means unlimited
  if (plan.propertyLimit === -1) {
    return { allowed: true };
  }

  const propertyCount = await prisma.property.count({
    where: { hostId: userId },
  });

  if (propertyCount >= plan.propertyLimit) {
    return {
      allowed: false,
      reason: `Your ${plan.name} plan allows up to ${plan.propertyLimit} ${plan.propertyLimit === 1 ? "property" : "properties"}. Upgrade your plan to add more.`,
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Activates a subscription after payment confirmation.
 * Called from the payment webhook or manual activation.
 */
export async function activateSubscription(
  subscriptionId: string,
  billingCycle: "MONTHLY" | "YEARLY"
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date(now);

  if (billingCycle === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate,
        renewalDate: endDate,
        cancelledAt: null,
      },
    });

    await tx.user.update({
      where: { id: subscription.userId },
      data: { role: "HOST" },
    });

    return subscription;
  });
}
