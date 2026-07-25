import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "properties");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Saves an uploaded image and returns its public URL.
 *
 * - **Production / any env with `BLOB_READ_WRITE_TOKEN`:** uploads to Vercel Blob
 *   and returns a persistent https URL (`*.public.blob.vercel-storage.com`).
 *   Vercel's serverless filesystem is ephemeral/read-only, so object storage is
 *   required in production.
 * - **Local dev (no token):** writes to `public/uploads/properties/` and returns
 *   a `/uploads/...` path.
 *
 * To use a different provider (Cloudinary, S3, UploadThing), replace the storage
 * block below — keep the `(file) => Promise<publicUrl>` contract so callers and
 * `isValidImagePath` (which accepts https URLs) stay unchanged.
 */
export async function savePropertyImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be 5 MB or less.");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  // Persistent object storage — used whenever a Blob token is configured.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(`properties/${filename}`, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return url;
  }

  // No token in production = misconfiguration. Fail with a clear message instead
  // of writing to a disk that won't persist (and is read-only on Vercel).
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads."
    );
  }

  // Local-dev fallback only.
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));
  return `/uploads/properties/${filename}`;
}
