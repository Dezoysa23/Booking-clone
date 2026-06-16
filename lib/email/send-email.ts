/**
 * Multi-provider email sender.
 * Priority: Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) → Resend (RESEND_API_KEY) → console log (dev only).
 *
 * Gmail setup: enable 2FA on the Google account, then generate an App Password at
 * https://myaccount.google.com/apppasswords — use that 16-char password as GMAIL_APP_PASSWORD.
 */

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // 1. Try Gmail SMTP
  const { sendViaGmail } = await import("./gmail-transport");
  const sentViaGmail = await sendViaGmail(payload);
  if (sentViaGmail) return;

  // 2. Try Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.RESEND_FROM_EMAIL || "Pearlora <noreply@pearlora.lk>";
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
      console.error(`[Email] Resend API error ${res.status}: ${body}`);
    }
    return;
  }

  // 3. No provider configured — log in dev, warn in prod
  if (process.env.NODE_ENV === "production") {
    console.error("[Email] No email provider configured. Set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY.");
  } else {
    console.warn(`[Email:DEV] No provider configured — email not sent. Subject: "${payload.subject}" To: ${payload.to}`);
  }
}
