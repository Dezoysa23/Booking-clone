import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { verifyEmailCode } from "@/lib/verification";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`verify-email:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Verification code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Constant-time response to prevent email enumeration
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json(
        { error: "Verification code is invalid or has expired." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      // Already verified — just create a session so they can log in
      const sessionToken = await createSessionToken(user.id, {
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") ?? undefined,
      });
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Per-user attempt rate limit
    const userLimit = checkRateLimit(`verify-email:user:${user.id}`, 10, 15 * 60 * 1000);
    if (!userLimit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 429 }
      );
    }

    const result = await verifyEmailCode(user.id, code);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Verification succeeded — create session
    const sessionToken = await createSessionToken(user.id, {
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Email verification failed:", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
