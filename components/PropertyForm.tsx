"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FACILITY_OPTIONS, FACILITY_GROUPS, NEARBY_CATEGORIES } from "@/lib/property-constants";
import NearbyHighlightManager from "@/components/NearbyHighlightManager";
import type { NearbyCategoryValue } from "@/lib/property-constants";

// ─── Types ───────────────────────────────────────────────────────────────────

type HouseRules = {
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
  cancellationPolicy?: string;
  prepaymentPolicy?: string;
  petsPolicy?: string;
  childrenPolicy?: string;
  cribsAvailable?: boolean;
  extraBedsAvailable?: boolean;
  ageRestriction?: string;
  smokingPolicy?: string;
  partiesPolicy?: string;
  quietHours?: string;
};

type AreaItem = { name: string; type?: string; distance?: string | number; distanceUnit?: string };

type AreaInfo = {
  attractions?: AreaItem[];
  restaurants?: AreaItem[];
  transit?: AreaItem[];
  airports?: AreaItem[];
  naturalBeauty?: AreaItem[];
};

type NearbyHighlightForm = {
  id?: string;
  title: string;
  description: string;
  category: NearbyCategoryValue;
  distance: string;
  distanceUnit: string;
  locationName: string;
  imageUrl: string;
  isActive: boolean;
};

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
  maxGuests: number | null;
  facilities?: string[];
  houseRules?: unknown;
  areaInfo?: unknown;
};

type Props =
  | { mode: "create"; apiBase?: string; cancelPath?: string; successPath?: string }
  | { mode: "edit"; initialValues: InitialValues; apiBase?: string; cancelPath?: string; successPath?: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_API = "/api/uploads/property-images";
const MAX_GALLERY = 10;

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(UPLOAD_API, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  return data.url as string;
}

function emptyAreaItem(): AreaItem {
  return { name: "", type: "", distance: "", distanceUnit: "km" };
}

function emptyHighlight(): NearbyHighlightForm {
  return { title: "", description: "", category: "OTHER", distance: "", distanceUnit: "km", locationName: "", imageUrl: "", isActive: true };
}

// ─── Section Accordion ───────────────────────────────────────────────────────

function Section({ title, icon, badge, children }: { title: string; icon: string; badge?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#071B63] text-xl">{icon}</span>
          <span className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#0f1f3d] text-base">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-[#071B63] text-white text-xs font-bold px-1.5">{badge}</span>
          )}
        </div>
        <span className="material-symbols-outlined text-gray-400 text-xl transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>expand_more</span>
      </button>
      {open && <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-50">{children}</div>}
    </div>
  );
}

// ─── Area Info Row Editor ─────────────────────────────────────────────────────

function AreaItemRow({
  item,
  onUpdate,
  onRemove,
  showType,
  placeholder,
}: {
  item: AreaItem;
  onUpdate: (updated: AreaItem) => void;
  onRemove: () => void;
  showType?: boolean;
  placeholder?: string;
}) {
  const inputClass = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10";
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        placeholder={placeholder ?? "Name"}
        className={`${inputClass} flex-1 min-w-32`}
      />
      {showType && (
        <input
          type="text"
          value={item.type ?? ""}
          onChange={(e) => onUpdate({ ...item, type: e.target.value })}
          placeholder="Type"
          className={`${inputClass} w-28`}
        />
      )}
      <input
        type="number"
        value={item.distance ?? ""}
        onChange={(e) => onUpdate({ ...item, distance: e.target.value })}
        placeholder="Dist"
        min="0"
        step="0.1"
        className={`${inputClass} w-20`}
      />
      <select
        value={item.distanceUnit ?? "km"}
        onChange={(e) => onUpdate({ ...item, distanceUnit: e.target.value })}
        className={`${inputClass} w-16`}
      >
        <option value="m">m</option>
        <option value="km">km</option>
      </select>
      <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

// ─── Nearby Highlight Editor ──────────────────────────────────────────────────

function NearbyHighlightEditor({
  highlight,
  onUpdate,
  onRemove,
  onUploadImage,
  uploading,
}: {
  highlight: NearbyHighlightForm;
  onUpdate: (h: NearbyHighlightForm) => void;
  onRemove: () => void;
  onUploadImage: (file: File) => Promise<string>;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10";
  const category = NEARBY_CATEGORIES.find((c) => c.value === highlight.category);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {highlight.imageUrl ? (
            <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={highlight.imageUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onUpdate({ ...highlight, imageUrl: "" })}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="h-14 w-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-[#071B63]/30 transition-colors shrink-0 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">{uploading ? "sync" : "add_photo_alternate"}</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await onUploadImage(f);
              onUpdate({ ...highlight, imageUrl: url });
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={highlight.title}
              onChange={(e) => onUpdate({ ...highlight, title: e.target.value })}
              placeholder="Place name *"
              className={inputClass}
            />
          </div>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={highlight.category}
          onChange={(e) => onUpdate({ ...highlight, category: e.target.value as NearbyCategoryValue })}
          className={inputClass}
          style={{ color: category?.color }}
        >
          {NEARBY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={highlight.locationName}
          onChange={(e) => onUpdate({ ...highlight, locationName: e.target.value })}
          placeholder="Location name"
          className={inputClass}
        />
        <input
          type="number"
          value={highlight.distance}
          onChange={(e) => onUpdate({ ...highlight, distance: e.target.value })}
          placeholder="Distance"
          min="0"
          step="0.1"
          className={inputClass}
        />
        <select
          value={highlight.distanceUnit}
          onChange={(e) => onUpdate({ ...highlight, distanceUnit: e.target.value })}
          className={inputClass}
        >
          <option value="m">metres</option>
          <option value="km">km</option>
        </select>
      </div>

      <textarea
        value={highlight.description}
        onChange={(e) => onUpdate({ ...highlight, description: e.target.value })}
        rows={2}
        placeholder="Short description (optional)"
        className={inputClass}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initialValues : null;
  const apiBase = props.apiBase ?? "/api/admin/properties";
  const cancelPath = props.cancelPath ?? "/admin/properties";
  const successPath = props.successPath ?? "/admin/properties";

  // ── Basic fields
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [rating, setRating] = useState(initial ? String(initial.rating) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amenities, setAmenities] = useState(initial?.amenities.join(", ") ?? "");
  const [maxGuests, setMaxGuests] = useState(initial?.maxGuests != null ? String(initial.maxGuests) : "");

  // ── Images
  const [mainImageUrl, setMainImageUrl] = useState(initial?.image ?? "");
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initial?.gallery ?? []);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(initial?.facilities ?? []);

  // ── House Rules
  const [houseRules, setHouseRules] = useState<HouseRules>((initial?.houseRules as HouseRules | null) ?? {});

  // ── Area Info
  const [areaInfo, setAreaInfo] = useState<AreaInfo>(() => {
    const ai = (initial?.areaInfo as AreaInfo | null) ?? {};
    return {
      attractions: ai.attractions ?? [],
      restaurants: ai.restaurants ?? [],
      transit: ai.transit ?? [],
      airports: ai.airports ?? [],
      naturalBeauty: ai.naturalBeauty ?? [],
    };
  });

  // ── Nearby Highlights (manage separately via API on edit, inline on create)
  const [highlights, setHighlights] = useState<NearbyHighlightForm[]>([]);
  const [highlightUploading, setHighlightUploading] = useState(false);

  // ── Status
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ─── Upload helpers ──────────────────────────────────────────────────────

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage("");
    setMainImageUploading(true);
    try {
      setMainImageUrl(await uploadFile(file));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Main image upload failed.");
    } finally {
      setMainImageUploading(false);
      if (mainInputRef.current) mainInputRef.current.value = "";
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const slots = MAX_GALLERY - galleryUrls.length;
    if (files.length > slots) {
      setErrorMessage(`You can only add ${slots} more image${slots === 1 ? "" : "s"} (max ${MAX_GALLERY}).`);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }
    setErrorMessage("");
    setGalleryUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) uploaded.push(await uploadFile(file));
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gallery upload failed.");
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const uploadHighlightImage = async (file: File): Promise<string> => {
    setHighlightUploading(true);
    try {
      return await uploadFile(file);
    } finally {
      setHighlightUploading(false);
    }
  };

  // ─── Area info helpers ───────────────────────────────────────────────────

  function addAreaItem(section: keyof AreaInfo) {
    setAreaInfo((prev) => ({ ...prev, [section]: [...(prev[section] ?? []), emptyAreaItem()] }));
  }

  function updateAreaItem(section: keyof AreaInfo, index: number, updated: AreaItem) {
    setAreaInfo((prev) => ({
      ...prev,
      [section]: prev[section]?.map((item, i) => (i === index ? updated : item)) ?? [],
    }));
  }

  function removeAreaItem(section: keyof AreaInfo, index: number) {
    setAreaInfo((prev) => ({
      ...prev,
      [section]: prev[section]?.filter((_, i) => i !== index) ?? [],
    }));
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedLocation || !trimmedDescription) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (!mainImageUrl) {
      setErrorMessage("Please upload a main property image.");
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

    try {
      setIsSaving(true);
      const url = isEdit ? `${apiBase}/${initial!.id}` : apiBase;

      // Strip empty strings from houseRules (time fields left blank, cleared selects)
      const cleanHouseRules = Object.fromEntries(
        Object.entries(houseRules).filter(([, v]) =>
          typeof v === "boolean" || (typeof v === "string" && v.trim() !== "")
        )
      );

      // Convert distance strings to numbers and filter empty-name rows
      function cleanItems(arr: AreaItem[] | undefined) {
        return (arr ?? [])
          .filter((i) => i.name.trim())
          .map((i) => ({ ...i, distance: i.distance ? Number(i.distance) : undefined }));
      }
      const cleanAreaInfo: AreaInfo = {
        attractions: cleanItems(areaInfo.attractions),
        restaurants: cleanItems(areaInfo.restaurants),
        transit: cleanItems(areaInfo.transit),
        airports: cleanItems(areaInfo.airports),
        naturalBeauty: cleanItems(areaInfo.naturalBeauty),
      };
      const hasAreaInfo = Object.values(cleanAreaInfo).some((arr) => arr.length > 0);

      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          location: trimmedLocation,
          price,
          rating,
          image: mainImageUrl,
          description: trimmedDescription,
          amenities,
          gallery: galleryUrls,
          maxGuests: maxGuests ? Number(maxGuests) : null,
          facilities: selectedFacilities,
          houseRules: Object.keys(cleanHouseRules).length > 0 ? cleanHouseRules : null,
          areaInfo: hasAreaInfo ? cleanAreaInfo : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? (isEdit ? "Failed to update property." : "Failed to create property."));
        return;
      }

      const propertyId = data.property?.id as number | undefined;

      // Save nearby highlights (create flow only — edit manages them inline)
      if (!isEdit && propertyId && highlights.length > 0) {
        const highlightBase = `/api/host/properties/${propertyId}/nearby-highlights`;
        for (const h of highlights) {
          if (!h.title.trim()) continue;
          await fetch(highlightBase, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: h.title.trim(),
              description: h.description.trim() || null,
              category: h.category,
              distance: h.distance ? Number(h.distance) : null,
              distanceUnit: h.distanceUnit,
              locationName: h.locationName.trim() || null,
              imageUrl: h.imageUrl || null,
            }),
          });
        }
      }

      router.push(`${successPath}?success=${isEdit ? "updated" : "created"}`);
    } catch {
      setErrorMessage(isEdit ? "Failed to update property." : "Failed to create property.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400";
  const uploadZoneBase =
    "w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 px-4 text-center transition-colors cursor-pointer hover:border-[#071B63]/30 hover:bg-gray-100";

  const facilitiesCount = selectedFacilities.length;
  const rulesCount = Object.values(houseRules).filter(Boolean).length;
  const areaCount = Object.values(areaInfo).reduce((acc, arr) => acc + (arr?.filter((i) => i.name.trim())?.length ?? 0), 0);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="admin-header-gradient px-8 py-7">
        <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-white">
          {isEdit ? "Edit Property" : "Create Property"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isEdit ? "Update the details for this property listing." : "Add a new property listing to the Pearlora platform."}
        </p>
      </div>

      <div className="p-8 space-y-6">
        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ── Section 1: Basic Details ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#071B63] text-lg">info</span>
            <h2 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#0f1f3d]">Basic Details</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Property Name <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ocean Breeze Resort" required />
            </div>
            <div>
              <label className={labelClass}>Location <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Colombo, Sri Lanka" required />
            </div>
            <div>
              <label className={labelClass}>Price (LKR / night) <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="25000" min="1" required />
            </div>
            <div>
              <label className={labelClass}>Rating <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <input type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} placeholder="8.9" min="1" max="10" required />
              <p className="mt-1 text-xs text-gray-400">Between 1.0 and 10.0</p>
            </div>
            <div>
              <label className={labelClass}>Max Guests</label>
              <input type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={inputClass} placeholder="e.g. 6" min="1" max="100" />
              <p className="mt-1 text-xs text-gray-400">Leave blank for no guest limit.</p>
            </div>
            <div className="hidden md:block" />

            {/* Main Image */}
            <div className="md:col-span-2">
              <label className={labelClass}>Main Property Image <span className="text-red-400 normal-case tracking-normal">*</span></label>
              {mainImageUrl ? (
                <div>
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mainImageUrl} alt="Main property preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => mainInputRef.current?.click()} disabled={mainImageUploading} className="text-xs font-medium text-[#071B63] hover:underline disabled:opacity-50">
                      {mainImageUploading ? "Uploading…" : "Replace image"}
                    </button>
                    <span className="text-gray-300 text-xs">·</span>
                    <button type="button" onClick={() => setMainImageUrl("")} disabled={mainImageUploading} className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50">Remove</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => mainInputRef.current?.click()} disabled={mainImageUploading} className={`${uploadZoneBase} ${mainImageUploading ? "opacity-60 cursor-not-allowed" : ""}`}>
                  {mainImageUploading ? <span className="text-sm text-gray-400">Uploading…</span> : (
                    <>
                      <span className="material-symbols-outlined text-gray-300 text-4xl">upload</span>
                      <span className="text-sm font-medium text-gray-600">Click to upload main image</span>
                      <span className="text-xs text-gray-400">JPG, PNG, or WebP · Max 5 MB</span>
                    </>
                  )}
                </button>
              )}
              <input ref={mainInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleMainImageChange} />
            </div>

            {/* Gallery */}
            <div className="md:col-span-2">
              <label className={labelClass}>Gallery Images</label>
              {galleryUrls.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setGalleryUrls((p) => p.filter((_, idx) => idx !== i))} aria-label="Remove" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: "14px" }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {galleryUrls.length < MAX_GALLERY ? (
                <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={galleryUploading} className={`${uploadZoneBase} ${galleryUploading ? "opacity-60 cursor-not-allowed" : ""}`}>
                  {galleryUploading ? <span className="text-sm text-gray-400">Uploading…</span> : (
                    <>
                      <span className="material-symbols-outlined text-gray-300 text-4xl">add_photo_alternate</span>
                      <span className="text-sm font-medium text-gray-600">Click to add gallery images</span>
                      <span className="text-xs text-gray-400">{galleryUrls.length}/{MAX_GALLERY} · JPG, PNG, or WebP · Max 5 MB each</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="mt-1 text-xs text-amber-600">Maximum {MAX_GALLERY} gallery images reached.</p>
              )}
              <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleGalleryChange} />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelClass}>Description <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} placeholder="Describe the property, its surroundings, and what makes it special..." required />
            </div>

            {/* Amenities (free text, legacy) */}
            <div className="md:col-span-2">
              <label className={labelClass}>Custom Amenities</label>
              <input type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} className={inputClass} placeholder="e.g. Rooftop terrace, Private chef, Helipad" />
              <p className="mt-1 text-xs text-gray-400">Separate with commas. Use structured facilities below for filtering.</p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Facilities ── */}
        <Section title="Facilities & Amenities" icon="checklist" badge={facilitiesCount}>
          <p className="text-xs text-gray-500 mb-4">Select all facilities available at this property. These power the guest facility filters.</p>
          <div className="space-y-5">
            {FACILITY_GROUPS.map((group) => {
              const groupFacilities = FACILITY_OPTIONS.filter((f) => f.group === group);
              return (
                <div key={group}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {groupFacilities.map((f) => {
                      const checked = selectedFacilities.includes(f.key);
                      return (
                        <label key={f.key} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-all text-sm ${checked ? "border-[#071B63] bg-[#071B63]/5 text-[#071B63] font-medium" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedFacilities((prev) => checked ? prev.filter((k) => k !== f.key) : [...prev, f.key])}
                            className="sr-only"
                          />
                          <span className="material-symbols-outlined text-base" style={{ color: checked ? "#071B63" : "#9ca3af" }}>{f.icon}</span>
                          {f.label}
                          {checked && <span className="material-symbols-outlined text-sm ml-auto text-[#071B63]">check</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Section 3: House Rules ── */}
        <Section title="House Rules" icon="rule" badge={rulesCount}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Check-in From</label>
              <input type="time" value={houseRules.checkInFrom ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, checkInFrom: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-in To</label>
              <input type="time" value={houseRules.checkInTo ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, checkInTo: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-out From</label>
              <input type="time" value={houseRules.checkOutFrom ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, checkOutFrom: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-out To</label>
              <input type="time" value={houseRules.checkOutTo ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, checkOutTo: e.target.value }))} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Pets Policy</label>
              <select value={houseRules.petsPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, petsPolicy: e.target.value }))} className={inputClass}>
                <option value="">Not specified</option>
                <option value="allowed">Pets allowed</option>
                <option value="not_allowed">Pets not allowed</option>
                <option value="on_request">On request</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Children Policy</label>
              <select value={houseRules.childrenPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, childrenPolicy: e.target.value }))} className={inputClass}>
                <option value="">Not specified</option>
                <option value="welcome">Children welcome</option>
                <option value="not_allowed">Children not allowed</option>
                <option value="on_request">On request</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Smoking Policy</label>
              <select value={houseRules.smokingPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, smokingPolicy: e.target.value }))} className={inputClass}>
                <option value="">Not specified</option>
                <option value="non_smoking">Non-smoking property</option>
                <option value="designated_areas">Designated smoking areas</option>
                <option value="allowed">Smoking allowed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Parties / Events</label>
              <select value={houseRules.partiesPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, partiesPolicy: e.target.value }))} className={inputClass}>
                <option value="">Not specified</option>
                <option value="not_allowed">Not allowed</option>
                <option value="allowed">Allowed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Age Restriction</label>
              <select value={houseRules.ageRestriction ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, ageRestriction: e.target.value }))} className={inputClass}>
                <option value="">No restriction</option>
                <option value="18_plus">18+ only</option>
                <option value="25_plus">25+ only</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quiet Hours</label>
              <input type="text" value={houseRules.quietHours ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, quietHours: e.target.value }))} className={inputClass} placeholder="e.g. 22:00 – 08:00" />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!houseRules.cribsAvailable} onChange={(e) => setHouseRules((p) => ({ ...p, cribsAvailable: e.target.checked }))} className="rounded border-gray-300 text-[#071B63] focus:ring-[#071B63]" />
                Cribs available
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!houseRules.extraBedsAvailable} onChange={(e) => setHouseRules((p) => ({ ...p, extraBedsAvailable: e.target.checked }))} className="rounded border-gray-300 text-[#071B63] focus:ring-[#071B63]" />
                Extra beds available
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Cancellation Policy</label>
              <textarea value={houseRules.cancellationPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, cancellationPolicy: e.target.value }))} rows={2} className={inputClass} placeholder="e.g. Free cancellation up to 48 hours before check-in." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Prepayment Policy</label>
              <textarea value={houseRules.prepaymentPolicy ?? ""} onChange={(e) => setHouseRules((p) => ({ ...p, prepaymentPolicy: e.target.value }))} rows={2} className={inputClass} placeholder="e.g. No prepayment needed – pay at the property." />
            </div>
          </div>
        </Section>

        {/* ── Section 4: Area Info ── */}
        <Section title="Hotel Area Information" icon="location_on" badge={areaCount}>
          <p className="text-xs text-gray-500 mb-5">Add nearby places to help guests understand the location. Leave distance blank if unknown.</p>

          {(["attractions", "restaurants", "transit", "airports", "naturalBeauty"] as const).map((section) => {
            const labels: Record<string, { label: string; placeholder: string; showType: boolean }> = {
              attractions: { label: "Top Attractions", placeholder: "Attraction name", showType: true },
              restaurants: { label: "Restaurants & Cafes", placeholder: "Restaurant name", showType: true },
              transit: { label: "Public Transit", placeholder: "Station / stop name", showType: true },
              airports: { label: "Closest Airports", placeholder: "Airport name", showType: false },
              naturalBeauty: { label: "Natural Beauty", placeholder: "Place name", showType: true },
            };
            const cfg = labels[section];
            return (
              <div key={section} className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{cfg.label}</p>
                  <button type="button" onClick={() => addAreaItem(section)} className="text-xs font-semibold text-[#071B63] hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(areaInfo[section] ?? []).map((item, i) => (
                    <AreaItemRow
                      key={i}
                      item={item}
                      onUpdate={(updated) => updateAreaItem(section, i, updated)}
                      onRemove={() => removeAreaItem(section, i)}
                      showType={cfg.showType}
                      placeholder={cfg.placeholder}
                    />
                  ))}
                  {(areaInfo[section] ?? []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">No entries yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </Section>

        {/* ── Section 5: Nearby Highlights ── */}
        <Section title="Nearby Highlights" icon="auto_awesome" badge={isEdit ? undefined : highlights.length}>
          <p className="text-xs text-gray-500 mb-5">
            {isEdit
              ? "Add or edit captivating nearby places. Changes are saved immediately."
              : "Add captivating nearby places that make this property special. Images optional."}
          </p>
          {isEdit ? (
            <NearbyHighlightManager propertyId={initial!.id} />
          ) : (
            <>
              <div className="space-y-4">
                {highlights.map((h, i) => (
                  <NearbyHighlightEditor
                    key={i}
                    highlight={h}
                    onUpdate={(updated) => setHighlights((prev) => prev.map((x, idx) => idx === i ? updated : x))}
                    onRemove={() => setHighlights((prev) => prev.filter((_, idx) => idx !== i))}
                    onUploadImage={uploadHighlightImage}
                    uploading={highlightUploading}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHighlights((prev) => [...prev, emptyHighlight()])}
                className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[#071B63]/30 px-4 py-3 text-sm font-medium text-[#071B63] hover:bg-[#071B63]/5 transition-colors w-full justify-center"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Nearby Highlight
              </button>
            </>
          )}
        </Section>

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={isSaving || mainImageUploading || galleryUploading} className="rounded-lg bg-[#071B63] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {isSaving ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Property")}
          </button>
          <button type="button" disabled={isSaving} onClick={() => router.push(cancelPath)} className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
