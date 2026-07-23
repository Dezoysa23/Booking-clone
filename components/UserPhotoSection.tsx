"use client";

import { useRef, useState } from "react";
import { USER_PHOTO_CATEGORIES } from "@/lib/property-constants";

type ApprovedPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  createdAt: Date;
};

type Props = {
  propertyId: number;
  propertyName: string;
  approvedPhotos: ApprovedPhoto[];
  isLoggedIn: boolean;
};

export default function UserPhotoSection({ propertyId, propertyName, approvedPhotos, isLoggedIn }: Props) {
  const [photos] = useState(approvedPhotos);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) { setError("Please select an image."); return; }
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      if (caption.trim()) fd.append("caption", caption.trim());
      if (category) fd.append("category", category);

      const res = await fetch(`/api/properties/${propertyId}/user-photos`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit photo.");

      setSuccess("Your photo has been submitted and is pending review. Thank you!");
      setShowForm(false);
      setSelectedFile(null);
      setPreviewUrl("");
      setCaption("");
      setCategory("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit photo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="h-px w-6 bg-[#D9A94D]" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D9A94D]">Community</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
            Guest Photos
          </h2>
        </div>
        {isLoggedIn && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#14213D]/20 bg-white px-4 py-2 text-sm font-medium text-[#14213D] hover:bg-[#14213D]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_photo_alternate</span>
            Share a photo
          </button>
        )}
        {!isLoggedIn && (
          <a href="/login" className="text-xs text-[#14213D] hover:underline font-medium">Sign in to share a photo</a>
        )}
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#14213D]">Share your photo</h3>
          <p className="text-xs text-[#5B6472]">Your photo will be reviewed before it appears publicly.</p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover rounded-xl border border-gray-100" />
                <button type="button" onClick={() => { setPreviewUrl(""); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center hover:border-[#14213D]/30 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-gray-300 text-4xl">add_photo_alternate</span>
                <span className="text-sm font-medium text-[#3B4658]">Click to select an image</span>
                <span className="text-xs text-[#7C879B]">JPG, PNG, or WebP · Max 5 MB</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#7C879B]">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#14213D] focus:bg-white">
              <option value="">Select a category</option>
              {USER_PHOTO_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#7C879B]">Caption (optional)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300}
              placeholder={`A view from ${propertyName}...`}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#14213D] focus:bg-white" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting || !selectedFile}
              className="rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#3B4658] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {photos.length > 0 ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {photos.map((photo) => {
            const cat = USER_PHOTO_CATEGORIES.find((c) => c.value === photo.category);
            return (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.caption ?? "Guest photo"} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {(photo.caption || cat) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    {cat && <p className="text-xs text-white/70 font-medium">{cat.label}</p>}
                    {photo.caption && <p className="text-xs text-white leading-relaxed line-clamp-2">{photo.caption}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <div className="rounded-xl bg-white border border-gray-100 p-8 text-center">
            <span className="material-symbols-outlined text-gray-200 text-4xl">photo_library</span>
            <p className="mt-2 text-sm text-[#7C879B]">No guest photos yet. Be the first to share!</p>
          </div>
        )
      )}
    </section>
  );
}
