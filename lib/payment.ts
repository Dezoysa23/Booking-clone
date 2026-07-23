/**
 * Payment service abstraction layer.
 *
 * This module defines the interfaces and a mock implementation for payment processing.
 * Replace MockPaymentService with a real provider (e.g. Stripe, PayHere) by implementing
 * the PaymentService interface and swapping the export at the bottom.
 *
 * Real integration note:
 * - createCheckoutSession should return a redirect URL to the provider's hosted checkout
 * - handleWebhook should verify the webhook signature using the provider's SDK
 * - Never activate a subscription from the frontend alone
 */

import { timingSafeEqualStr } from "@/lib/security/secure-compare";

export interface CheckoutSessionParams {
  userId: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: "MONTHLY" | "YEARLY";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface WebhookPayload {
  type: string;
  sessionId: string;
  subscriptionId?: string;
  transactionReference?: string;
}

export interface PaymentService {
  /** True when this is the mock/dev provider (no real money moves). */
  readonly isMock: boolean;
  createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookPayload(payload: string): WebhookPayload;
}

/**
 * Mock payment service for development and demos.
 * Immediately confirms payment with a synthetic transaction reference.
 * Replace with a real implementation in production.
 */
class MockPaymentService implements PaymentService {
  readonly isMock = true;

  async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult> {
    // In a real integration, this would call Stripe/PayHere API
    // and return a redirect URL to the hosted checkout page.
    const sessionId = `mock_session_${Date.now()}_${params.userId.slice(-8)}`;
    const checkoutUrl = `/host/subscribe/confirm?session_id=${sessionId}&subscription_id=${params.subscriptionId}`;

    return { sessionId, checkoutUrl };
  }

  verifyWebhookSignature(_payload: string, signature: string): boolean {
    // Mock provider: authenticate the caller with a shared secret supplied in
    // the signature header. FAIL CLOSED if the secret is not configured.
    //
    // A real provider (Stripe/PayHere) would instead verify an HMAC of the raw
    // payload against the endpoint secret — swap that in here when you wire a
    // real provider (and set isMock to false).
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
      console.error(
        "[payment] PAYMENT_WEBHOOK_SECRET is not set — rejecting webhook (fail closed)."
      );
      return false;
    }
    return timingSafeEqualStr(signature, secret);
  }

  parseWebhookPayload(payload: string): WebhookPayload {
    try {
      return JSON.parse(payload) as WebhookPayload;
    } catch {
      throw new Error("Invalid webhook payload");
    }
  }
}

export const paymentService: PaymentService = new MockPaymentService();
