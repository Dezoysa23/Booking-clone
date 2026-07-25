import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { forgotPasswordSchema, firstError } from "@/lib/validation/schemas";
import { createAndSendPasswordReset } from "@/lib/password-reset";

// Uniform response so an attacker can't tell whether an email is registered.
const GENERIC = {
  success: true,
  message: "If an account exists for that email, a password reset link has been sent.",
};

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const ipLimit = await checkRateLimit(`forgot-password:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!ipLimit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const raw = await request.json();
    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { email } = parsed.data;

    // Per-email limit bounds spam/enumeration attempts on a single address.
    const emailLimit = await checkRateLimit(`forgot-password:email:${email}`, 5, 15 * 60 * 1000);
    if (!emailLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    // Only issue a token for real, password-based accounts — but ALWAYS return GENERIC.
    if (user && user.password) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
      await createAndSendPasswordReset(
        { id: user.id, email: user.email, name: user.name },
        baseUrl
      ).catch((err) => console.error("[ForgotPassword] send failed:", err));
    }

    return NextResponse.json(GENERIC);
  } catch (error) {
    console.error("[ForgotPassword] error:", error);
    // Uniform error (not email-specific) so it can't be used to enumerate accounts.
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
