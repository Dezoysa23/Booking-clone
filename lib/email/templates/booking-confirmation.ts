import { sendEmail } from "@/lib/email/send-email";

type BookingConfirmationParams = {
  toEmail: string;
  toName?: string;
  bookingId: number;
  propertyName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  totalPrice: number;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendBookingConfirmationEmail(
  params: BookingConfirmationParams
): Promise<void> {
  const {
    toEmail,
    toName,
    bookingId,
    propertyName,
    checkIn,
    checkOut,
    guests,
    nights,
    totalPrice,
  } = params;

  const greeting = toName ? `Hi ${toName}` : "Hi there";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const bookingUrl = `${baseUrl}/booking-confirmation/${bookingId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed — Pearlora</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1f3d,#1a3a6b);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 4px;color:#D8B45A;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-family:Arial,sans-serif;">Pearlora</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;">Booking Confirmed</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;font-family:Arial,sans-serif;">Your reservation is all set.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">${greeting},</p>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
              Great news — your stay at <strong style="color:#0f1f3d;">${propertyName}</strong> has been confirmed. Here are your reservation details:
            </p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr style="background:#faf8f5;">
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;width:40%;">Booking ID</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;">#${bookingId}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">Property</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${propertyName}</td>
              </tr>
              <tr style="background:#faf8f5;">
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">Check-in</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${formatDate(checkIn)}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">Check-out</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${formatDate(checkOut)}</td>
              </tr>
              <tr style="background:#faf8f5;">
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">Guests</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${guests}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">Nights</td>
                <td style="padding:12px 20px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${nights}</td>
              </tr>
              <tr style="background:#0f1f3d;">
                <td style="padding:14px 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#D8B45A;font-family:Arial,sans-serif;border-top:1px solid #1a3a6b;">Total Paid</td>
                <td style="padding:14px 20px;font-size:18px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;border-top:1px solid #1a3a6b;">LKR ${totalPrice.toLocaleString()}</td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${bookingUrl}" style="display:inline-block;background:#0f1f3d;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.04em;">
                    View Booking Details
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;text-align:center;">
              If you have any questions, please contact us at <a href="mailto:support@pearlora.lk" style="color:#0f1f3d;">support@pearlora.lk</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;font-family:Arial,sans-serif;">
              © ${new Date().getFullYear()} Pearlora · Sri Lanka&apos;s Premier Booking Platform
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: toEmail,
    subject: `Booking Confirmed — ${propertyName} (#${bookingId})`,
    html,
  });
}
