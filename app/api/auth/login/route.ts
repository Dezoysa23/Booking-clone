import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { hasPendingVerification } from "@/lib/verification";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { loginSchema, firstError } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);

  // Rate limit: 5 attempts per 10 min per IP
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 5, 10 * 60 * 1000);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipLimit.resetAt - Math.floor(Date.now() / 1000)),
        },
      }
    );
  }

  try {
    const raw = await request.json();
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { email, password } = parsed.data;

    // Rate limit: 5 attempts per 10 min per email (catches distributed IP attacks)
    const emailLimit = checkRateLimit(`login:email:${email}`, 5, 10 * 60 * 1000);
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailLimit.resetAt - Math.floor(Date.now() / 1000)),
          },
        }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Block login for accounts with an active pending verification code.
    // Users who signed up before this feature was added have no verification record
    // and are not blocked (backward-compatible grandfather clause).
    if (!user.emailVerified) {
      const pending = await hasPendingVerification(user.id);
      if (pending) {
        return NextResponse.json(
          {
            error: "Please verify your email before signing in.",
            needsVerification: true,
            email: user.email,
          },
          { status: 403 }
        );
      }
    }

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
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
