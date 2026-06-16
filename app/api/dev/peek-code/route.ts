import { NextResponse } from "next/server";
import { devPeekCode } from "@/lib/dev-code-store";

/**
 * DEV ONLY — returns the latest verification code for an email address.
 * Blocked unconditionally in production.
 *
 * GET /api/dev/peek-code?email=you@example.com
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json({ error: "email query param is required." }, { status: 400 });
  }

  const code = devPeekCode(email);

  if (!code) {
    return NextResponse.json(
      { error: "No active code found for this email. Sign up or resend to generate one." },
      { status: 404 }
    );
  }

  return NextResponse.json({ email, code });
}
