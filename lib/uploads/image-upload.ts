import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "properties");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Saves an uploaded image file to public/uploads/properties/ and returns
 * the public path (e.g. /uploads/properties/abc.jpg).
 *
 * Replace this function body to swap in Cloudinary, S3, UploadThing, etc.
 */
export async function savePropertyImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be 5 MB or less.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));

  return `/uploads/properties/${filename}`;
}
