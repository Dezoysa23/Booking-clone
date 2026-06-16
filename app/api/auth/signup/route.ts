import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationCode } from "@/lib/verification";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { signupSchema, firstError } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);

  // Rate limit: 5 signups per 10 min per IP
  const ipLimit = checkRateLimit(`signup:ip:${ip}`, 5, 10 * 60 * 1000);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
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
    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Unverified account — resend the code and guide them to verify
        await createAndSendVerificationCode(existingUser.id, existingUser.email, existingUser.name);
        return NextResponse.json(
          { needsVerification: true, email: existingUser.email },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Send verification code — no session until email is verified
    await createAndSendVerificationCode(user.id, user.email, user.name);

    return NextResponse.json({ success: true, needsVerification: true, email: user.email });
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
