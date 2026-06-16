/**
 * Gmail SMTP diagnostic script.
 * Run with: npx tsx scripts/test-gmail.ts
 *
 * Reads GMAIL_USER and GMAIL_APP_PASSWORD from .env and attempts a real send.
 */
import nodemailer from "nodemailer";
import * as fs from "node:fs";
import * as path from "node:path";

// Manually load .env (tsx doesn't auto-load it)
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = process.env[key] ?? val;
  }
}

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

console.log("\n=== Pearlora Gmail SMTP Diagnostic ===\n");

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error("❌ Missing env vars:");
  if (!GMAIL_USER) console.error("   GMAIL_USER is not set");
  if (!GMAIL_APP_PASSWORD) console.error("   GMAIL_APP_PASSWORD is not set");
  process.exit(1);
}

console.log(`✓  GMAIL_USER         = ${GMAIL_USER}`);
console.log(`✓  GMAIL_APP_PASSWORD = ${"*".repeat(GMAIL_APP_PASSWORD.length)} (${GMAIL_APP_PASSWORD.length} chars)`);
console.log("");

const TO = process.argv[2] ?? GMAIL_USER;
console.log(`📧 Sending test email to: ${TO}`);
console.log("   Connecting to Gmail SMTP…\n");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

async function run() {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified — credentials are valid!\n");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ SMTP connection FAILED:");
    console.error(`   ${msg}\n`);
    console.error("Common causes:");
    console.error("  • 2-Step Verification not enabled on the Google account");
    console.error("  • App Password was generated for a different account");
    console.error("  • 'Less secure app access' or Google security policy blocking SMTP");
    console.error("  • Typo in GMAIL_APP_PASSWORD (should be 16 chars without spaces)\n");
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `"Pearlora Test" <${GMAIL_USER}>`,
      to: TO,
      subject: "✅ Pearlora SMTP test — it works!",
      html: `
        <div style="font-family:Arial,sans-serif;padding:32px;max-width:500px;">
          <h2 style="color:#0f1f3d;">Pearlora SMTP Test</h2>
          <p>If you received this email, Gmail SMTP is configured correctly.</p>
          <p style="color:#6b7280;font-size:13px;">Sent from: ${GMAIL_USER}</p>
        </div>
      `,
      text: "Pearlora SMTP test — Gmail is configured correctly.",
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID : ${info.messageId}`);
    console.log(`   Response   : ${info.response}`);
    console.log(`\n   Check inbox at: ${TO}\n`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Send failed: ${msg}\n`);
    process.exit(1);
  }
}

run();
