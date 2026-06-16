import { sendEmail } from "@/lib/email/send-email";

type EmailVerificationParams = {
  toEmail: string;
  toName?: string | null;
  code: string;
};

export async function sendVerificationEmail(params: EmailVerificationParams): Promise<void> {
  const { toEmail, toName, code } = params;
  const greeting = toName ? `Hi ${toName}` : "Hi there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email — Pearlora</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1f3d 0%,#071B63 60%,#1a3a6b 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#D8B45A;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-family:Arial,sans-serif;">Pearlora</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;font-family:Georgia,serif;">Verify Your Email</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.55);font-size:13px;font-family:Arial,sans-serif;">Secure your Pearlora account in one step</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${greeting},</p>
            <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
              Welcome to Pearlora! Enter the code below to verify your email address and activate your account.
            </p>

            <!-- Code box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f1f3d,#071B63);border-radius:16px;overflow:hidden;">
                    <tr>
                      <td style="padding:30px 56px;text-align:center;">
                        <p style="margin:0 0 10px;color:#D8B45A;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;font-family:Arial,sans-serif;">Your Verification Code</p>
                        <p style="margin:0;color:#ffffff;font-size:42px;font-weight:700;letter-spacing:0.35em;font-family:monospace,Arial,sans-serif;">${code}</p>
                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.45);font-size:12px;font-family:Arial,sans-serif;">Expires in 15 minutes</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;">
              Enter this code on the Pearlora verification page. If you didn't create an account, you can safely ignore this email — no action is needed.
            </p>

            <!-- Security tip -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;">
                  <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
                    <strong>Security tip:</strong> Pearlora will never ask you to share this code. Keep it private.
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
    subject: "Verify your Pearlora email address",
    html,
    text: `${greeting},\n\nYour Pearlora verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't create an account, ignore this email.\n\n— Pearlora`,
  });
}
