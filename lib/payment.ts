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
  async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResult> {
    // In a real integration, this would call Stripe/PayHere API
    // and return a redirect URL to the hosted checkout page.
    const sessionId = `mock_session_${Date.now()}_${params.userId.slice(-8)}`;
    const checkoutUrl = `/host/subscribe/confirm?session_id=${sessionId}&subscription_id=${params.subscriptionId}`;

    return { sessionId, checkoutUrl };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // In production: verify HMAC signature from provider
    // e.g. stripe.webhooks.constructEvent(payload, sig, endpointSecret)
    return true;
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
