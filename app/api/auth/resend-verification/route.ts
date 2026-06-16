import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationCode } from "@/lib/verification";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/get-client-ip";
import { verifyCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`resend-verification:ip:${ip}`, 3, 15 * 60 * 1000);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many resend attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const userLimit = checkRateLimit(`resend-verification:user:${user.id}`, 3, 15 * 60 * 1000);
    if (!userLimit.success) {
      return NextResponse.json(
        { error: "Too many resend attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    await createAndSendVerificationCode(user.id, user.email, user.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification failed:", error);
    return NextResponse.json({ error: "Failed to resend code." }, { status: 500 });
  }
}
