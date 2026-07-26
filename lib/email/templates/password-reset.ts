import { sendEmail } from "@/lib/email/send-email";

type PasswordResetParams = {
  toEmail: string;
  toName?: string | null;
  resetUrl: string;
  expiryMinutes: number;
};

export async function sendPasswordResetEmail(params: PasswordResetParams): Promise<void> {
  const { toEmail, toName, resetUrl, expiryMinutes } = params;
  const greeting = toName ? `Hi ${toName}` : "Hi there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password — Pearlora</title>
</head>
<body style="margin:0;padding:0;background:#F8F2E9;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F2E9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#101A30 0%,#14213D 60%,#16233F 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#D9A94D;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,sans-serif;">Pearlora</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;font-family:Georgia,serif;">Reset Your Password</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.55);font-size:13px;font-family:Arial,sans-serif;">A request was made to reset your Pearlora password</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${greeting},</p>
            <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
              We received a request to reset the password for your Pearlora account. Click the button
              below to choose a new password. This link expires in ${expiryMinutes} minutes and can be used once.
            </p>

            <!-- Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:linear-gradient(135deg,#14213D,#16233F);color:#ffffff;text-decoration:none;padding:15px 44px;border-radius:12px;font-size:15px;font-weight:600;font-family:Arial,sans-serif;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
              Or paste this link into your browser:
            </p>
            <p style="margin:0 0 24px;word-break:break-all;color:#14213D;font-size:12px;font-family:monospace,Arial,sans-serif;">
              ${resetUrl}
            </p>

            <!-- Security tip -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;">
                  <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
                    <strong>Didn't request this?</strong> You can safely ignore this email — your password
                    will not change unless you use the link above.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;font-family:Arial,sans-serif;">
              &copy; ${new Date().getFullYear()} Pearlora &middot; Sri Lanka&apos;s Premier Booking Platform
            </p>
            <p style="margin:0;color:#d1d5db;font-size:10px;font-family:Arial,sans-serif;">
              Sent from gopearlora@gmail.com
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
    subject: "Reset your Pearlora password",
    html,
    text: `${greeting},\n\nWe received a request to reset your Pearlora password. Use this link (expires in ${expiryMinutes} minutes, single use):\n${resetUrl}\n\nIf you didn't request this, ignore this email — your password won't change.\n\n— Pearlora`,
  });
}
