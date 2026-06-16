import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/templates/email-verification";

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 15;

export function generateVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(CODE_LENGTH, "0");
}

export async function createAndSendVerificationCode(
  userId: string,
  email: string,
  name?: string | null,
): Promise<void> {
  const code = generateVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any existing unused codes for this user
  await prisma.emailVerification.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.emailVerification.create({
    data: { userId, codeHash, expiresAt },
  });

  // In dev: always log the code to console AND save to the in-memory peek store
  if (process.env.NODE_ENV !== "production") {
    const { devStoreCode } = await import("@/lib/dev-code-store");
    devStoreCode(email, code);
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  [DEV] EMAIL VERIFICATION CODE               ║`);
    console.log(`║  Email : ${email.padEnd(36)}║`);
    console.log(`║  Code  : ${code.padEnd(36)}║`);
    console.log(`║  GET /api/dev/peek-code?email=<email>        ║`);
    console.log(`╚══════════════════════════════════════════════╝\n`);
  }

  await sendVerificationEmail({ toEmail: email, toName: name, code });
}

export async function verifyEmailCode(
  userId: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  const verification = await prisma.emailVerification.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    return {
      success: false,
      error: "Verification code has expired or been used. Please request a new one.",
    };
  }

  const isValid = await bcrypt.compare(code, verification.codeHash);
  if (!isValid) {
    return { success: false, error: "Incorrect verification code. Please try again." };
  }

  // Mark code as used and set emailVerified in parallel
  await Promise.all([
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    }),
  ]);

  return { success: true };
}

export async function hasPendingVerification(userId: string): Promise<boolean> {
  const record = await prisma.emailVerification.findFirst({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  return record !== null;
}
