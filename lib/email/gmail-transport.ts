import nodemailer from "nodemailer";
import type { EmailPayload } from "./send-email";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return _transporter;
}

export async function sendViaGmail(payload: EmailPayload): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  const from = `"Pearlora" <${process.env.GMAIL_USER}>`;
  try {
    await t.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.text ? { text: payload.text } : {}),
    });
    return true;
  } catch (err) {
    console.error("[Gmail] Send failed:", err);
    _transporter = null;
    return false;
  }
}
