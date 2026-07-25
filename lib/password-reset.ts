import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revokeAllUserSessions } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email/templates/password-reset";

const TOKEN_EXPIRY_MINUTES = 30;

/** SHA-256 is fine for a high-entropy random token — enables O(1) lookup by hash. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a single-use password-reset token and emails the link.
 * Callers MUST NOT reveal whether the account exists — always respond generically.
 */
export async function createAndSendPasswordReset(
  user: { id: string; email: string; name: string | null },
  baseUrl: string
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any previous unused tokens for this user, then issue a fresh one.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[DEV] Password reset link for ${user.email}:\n${resetUrl}\n`);
  }

  await sendPasswordResetEmail({
    toEmail: user.email,
    toName: user.name,
    resetUrl,
    expiryMinutes: TOKEN_EXPIRY_MINUTES,
  });
}

/**
 * Consumes a reset token and sets the new password. Generic result — never reveals
 * whether the token matched a real account.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      success: false,
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Set the password and consume the token atomically.
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  // Force re-login everywhere — a reset should invalidate any existing sessions.
  await revokeAllUserSessions(record.userId);

  return { success: true };
}
