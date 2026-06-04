import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "booking_clone_session";
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is not set.");
    }
    console.warn(
      "[auth] SESSION_SECRET is not set. Using an insecure dev fallback. Set SESSION_SECRET in your .env file."
    );
    return "dev-fallback-secret-do-not-use-in-production";
  }
  return secret;
}

// Token format: userId.sessionId.hexSig
// sig = HMAC-SHA256(secret, "userId.sessionId")
// Neither userId (cuid) nor sessionId (uuid without dashes) contain dots,
// so splitting on "." always produces exactly 3 parts.
function signSession(userId: string, sessionId: string): string {
  const payload = `${userId}.${sessionId}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

interface ParsedToken {
  userId: string;
  sessionId: string;
  sig: string;
}

function parseToken(token: string): ParsedToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, sessionId, sig] = parts;
  if (!userId || !sessionId || !sig) return null;
  return { userId, sessionId, sig };
}

function verifyHmac({ userId, sessionId, sig }: ParsedToken): boolean {
  const payload = `${userId}.${sessionId}`;
  const expected = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export async function createSessionToken(
  userId: string,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  // UUID without dashes = 32 hex chars, no dots — safe for dot-delimited token format
  const sessionId = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  await prisma.userSession.create({
    data: {
      userId,
      sessionId,
      ipAddress: options?.ipAddress ?? null,
      userAgent: options?.userAgent?.slice(0, 512) ?? null,
      expiresAt,
    },
  });

  return signSession(userId, sessionId);
}

export async function revokeSessionByToken(token: string): Promise<void> {
  const parsed = parseToken(token);
  if (!parsed || !verifyHmac(parsed)) return;

  await prisma.userSession
    .update({
      where: { sessionId: parsed.sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    })
    .catch(() => {
      // Session may not exist in DB — safe to ignore
    });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const parsed = parseToken(sessionCookie.value);
  if (!parsed || !verifyHmac(parsed)) return null;

  try {
    const session = await prisma.userSession.findUnique({
      where: { sessionId: parsed.sessionId },
      select: { userId: true, isRevoked: true, expiresAt: true },
    });

    if (!session) return null;
    if (session.isRevoked) return null;
    if (session.expiresAt < new Date()) return null;
    if (session.userId !== parsed.userId) return null;

    return parsed.userId;
  } catch {
    // Fail closed on DB errors — treat as unauthenticated
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch (error) {
    console.error("[auth] Failed to fetch current user:", error);
    return null;
  }
}
