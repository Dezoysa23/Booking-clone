"use client";

import { useState } from "react";
import Link from "next/link";
import { USER_PHOTO_CATEGORIES } from "@/lib/property-constants";

type Photo = {
  id: string;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  user: { name: string | null; email: string };
  property: { id: number; name: string };
};

type Props = {
  initialPhotos: Photo[];
};

export default function UserPhotoModerationClient({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const moderate = async (id: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/user-photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) throw new Error("Failed to update photo.");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to update. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("Permanently delete this photo?")) return;
    setProcessing(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/user-photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete photo.");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
          <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
        </div>
        <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#14213D]">
          All caught up!
        </h3>
        <p className="mt-2 text-sm text-gray-500">No pending photos to review.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const cat = USER_PHOTO_CATEGORIES.find((c) => c.value === photo.category);
          const busy = processing === photo.id;
          return (
            <div key={photo.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-52 bg-gray-50 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.caption ?? "Pending photo"} className="h-full w-full object-cover" />
                {cat && (
                  <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                    {cat.label}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                {photo.caption && (
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{photo.caption}</p>
                )}
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>
                    <span className="font-medium text-gray-600">Property: </span>
                    <Link href={`/properties/${photo.property.id}`} className="text-[#14213D] hover:underline" target="_blank">
                      {photo.property.name}
                    </Link>
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Submitted by: </span>
                    {photo.user.name ?? photo.user.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Date: </span>
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => moderate(photo.id, "APPROVED")}
                    disabled={busy}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => moderate(photo.id, "REJECTED")}
                    disabled={busy}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePhoto(photo.id)}
                    disabled={busy}
                    title="Delete permanently"
                    className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
