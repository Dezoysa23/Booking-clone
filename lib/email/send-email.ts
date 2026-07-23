/**
 * Provider-agnostic email sender using Resend.
 * To swap providers: replace the fetch logic below with your provider's API call.
 * Required env vars: RESEND_API_KEY, RESEND_FROM_EMAIL
 */

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Email is a live dependency in production — surface misconfiguration loudly
    // instead of silently dropping mail. Callers wrap sendEmail in try/catch.
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    console.warn("[Email] RESEND_API_KEY not configured — skipping email send (dev only).");
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Pearlora <noreply@pearlora.lk>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.text ? { text: payload.text } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
