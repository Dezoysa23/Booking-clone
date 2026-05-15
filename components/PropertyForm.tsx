"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InitialValues = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  gallery: string[];
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; initialValues: InitialValues };

export default function PropertyForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initialValues : null;

  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [rating, setRating] = useState(initial ? String(initial.rating) : "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amenities, setAmenities] = useState(initial?.amenities.join(", ") ?? "");
  const [galleryText, setGalleryText] = useState(
    initial?.gallery && initial.gallery.length > 0
      ? initial.gallery.join("\n")
      : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const trimmedImage = image.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedLocation || !trimmedImage || !trimmedDescription) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (
      !trimmedImage.startsWith("https://") &&
      !trimmedImage.startsWith("http://")
    ) {
      setErrorMessage("Image URL must start with https:// or http://");
      return;
    }

    const priceNum = Number(price);
    const ratingNum = Number(rating);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage("Price must be a positive number.");
      return;
    }

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      setErrorMessage("Rating must be between 1 and 10.");
      return;
    }

    const galleryLines = galleryText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const invalidGalleryUrl = galleryLines.find(
      (l) => !l.startsWith("https://") && !l.startsWith("http://")
    );
    if (invalidGalleryUrl) {
      setErrorMessage("Each gallery URL must start with https:// or http://");
      return;
    }

    try {
      setIsSaving(true);

      const url = isEdit
        ? `/api/admin/properties/${initial!.id}`
        : "/api/admin/properties";

      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          location: trimmedLocation,
          price,
          rating,
          image: trimmedImage,
          description: trimmedDescription,
          amenities,
          galleryText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            (isEdit ? "Failed to update property." : "Failed to create property.")
        );
        return;
      }

      router.push(
        `/admin/properties?success=${isEdit ? "updated" : "created"}`
      );
    } catch {
      setErrorMessage(
        isEdit ? "Failed to update property." : "Failed to create property."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10";

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400";

  const imageIsPreviewable =
    image.startsWith("https://") || image.startsWith("http://");

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="admin-header-gradient px-8 py-7">
        <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-white">
          {isEdit ? "Edit Property" : "Create Property"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isEdit
            ? "Update the details for this property listing."
            : "Add a new property listing to the Pearlora platform."}
        </p>
      </div>

      <div className="p-8">
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className={labelClass}>
              Property Name{" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ocean Breeze Resort"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>
              Location{" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="Colombo, Sri Lanka"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>
              Price (LKR / night){" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="25000"
              min="1"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className={labelClass}>
              Rating{" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={inputClass}
              placeholder="8.9"
              min="1"
              max="10"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Between 1.0 and 10.0</p>
          </div>

          {/* Main Image */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              Main Image URL{" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={inputClass}
              placeholder="https://images.unsplash.com/..."
              required
            />
            {imageIsPreviewable && (
              <div className="mt-2 h-36 w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Image preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "";
                  }}
                />
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="md:col-span-2">
            <label className={labelClass}>Gallery Images</label>
            <textarea
              value={galleryText}
              onChange={(e) => setGalleryText(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder={
                "https://images.unsplash.com/photo-1\nhttps://images.unsplash.com/photo-2"
              }
            />
            <p className="mt-1 text-xs text-gray-400">
              One URL per line. Leave blank to use the main image only.
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              Description{" "}
              <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="Describe the property, its surroundings, and what makes it special..."
              required
            />
          </div>

          {/* Amenities */}
          <div className="md:col-span-2">
            <label className={labelClass}>Amenities</label>
            <input
              type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className={inputClass}
              placeholder="Free WiFi, Pool, Parking, Breakfast Included"
            />
            <p className="mt-1 text-xs text-gray-400">Separate with commas.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-[#071B63] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Property"}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => router.push("/admin/properties")}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
