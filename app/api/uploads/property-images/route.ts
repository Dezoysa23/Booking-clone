import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";
import { savePropertyImage } from "@/lib/uploads/image-upload";
import { verifyCsrfOrigin } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!isHostOrAdmin(currentUser)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const rl = await checkRateLimit(`upload:image:${currentUser.id}`, 40, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many uploads. Please slow down." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const url = await savePropertyImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
