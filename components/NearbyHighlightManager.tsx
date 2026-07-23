"use client";

import { useEffect, useRef, useState } from "react";
import { NEARBY_CATEGORIES } from "@/lib/property-constants";
import type { NearbyCategoryValue } from "@/lib/property-constants";

type Highlight = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  distance: number | null;
  distanceUnit: string | null;
  locationName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type FormState = {
  title: string;
  description: string;
  category: NearbyCategoryValue;
  distance: string;
  distanceUnit: string;
  locationName: string;
  imageUrl: string;
  isActive: boolean;
};

type Props = {
  propertyId: number;
};

const UPLOAD_API = "/api/uploads/property-images";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(UPLOAD_API, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  return data.url as string;
}

function emptyForm(): FormState {
  return { title: "", description: "", category: "OTHER", distance: "", distanceUnit: "km", locationName: "", imageUrl: "", isActive: true };
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#14213d] focus:bg-white focus:ring-2 focus:ring-[#14213d]/10";

function HighlightForm({
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange({ ...form, imageUrl: url });
    } catch {
      // silently ignore upload errors in inline form
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const cat = NEARBY_CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="rounded-xl border border-[#14213d]/20 bg-[#14213d]/3 p-4 space-y-3">
      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex items-center gap-3">
        {form.imageUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ ...form, imageUrl: "" })}
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
            className="h-16 w-16 shrink-0 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-[#14213d]/30 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">{uploading ? "sync" : "add_photo_alternate"}</span>
            <span className="text-xs mt-0.5">Photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleImage} />
        <div className="flex-1">
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            placeholder="Place name *"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select
          value={form.category}
          onChange={(e) => onChange({ ...form, category: e.target.value as NearbyCategoryValue })}
          className={inputClass}
          style={{ color: cat?.color }}
        >
          {NEARBY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={form.locationName}
          onChange={(e) => onChange({ ...form, locationName: e.target.value })}
          placeholder="Location name"
          className={inputClass}
        />
        <input
          type="number"
          value={form.distance}
          onChange={(e) => onChange({ ...form, distance: e.target.value })}
          placeholder="Distance"
          min="0"
          step="0.1"
          className={inputClass}
        />
        <select
          value={form.distanceUnit}
          onChange={(e) => onChange({ ...form, distanceUnit: e.target.value })}
          className={inputClass}
        >
          <option value="m">metres</option>
          <option value="km">km</option>
        </select>
      </div>

      <textarea
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
        rows={2}
        placeholder="Short description (optional)"
        className={inputClass}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !form.title.trim()}
          className="rounded-lg bg-[#14213d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#14213d] transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-500 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
            className="rounded border-slate-300"
          />
          Active
        </label>
      </div>
    </div>
  );
}

export default function NearbyHighlightManager({ propertyId }: Props) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<FormState>(emptyForm());
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const base = `/api/host/properties/${propertyId}/nearby-highlights`;

  useEffect(() => {
    fetch(base)
      .then((r) => r.json())
      .then((d) => setHighlights(d.highlights ?? []))
      .catch(() => setFetchError("Failed to load highlights."))
      .finally(() => setLoading(false));
  }, [base]);

  const startEdit = (h: Highlight) => {
    setEditingId(h.id);
    setEditForm({
      title: h.title,
      description: h.description ?? "",
      category: (h.category as NearbyCategoryValue) ?? "OTHER",
      distance: h.distance != null ? String(h.distance) : "",
      distanceUnit: h.distanceUnit ?? "km",
      locationName: h.locationName ?? "",
      imageUrl: h.imageUrl ?? "",
      isActive: h.isActive,
    });
    setEditError("");
  };

  const saveNew = async () => {
    if (!newForm.title.trim()) { setAddError("Title is required."); return; }
    setAddError("");
    setAddSaving(true);
    try {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newForm.title.trim(),
          description: newForm.description.trim() || null,
          category: newForm.category,
          distance: newForm.distance ? Number(newForm.distance) : null,
          distanceUnit: newForm.distanceUnit,
          locationName: newForm.locationName.trim() || null,
          imageUrl: newForm.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create.");
      setHighlights((prev) => [...prev, data.highlight]);
      setNewForm(emptyForm());
      setAddingNew(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to create highlight.");
    } finally {
      setAddSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editingId) return;
    setEditError("");
    setEditSaving(true);
    try {
      const res = await fetch(`${base}/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          category: editForm.category,
          distance: editForm.distance ? Number(editForm.distance) : null,
          distanceUnit: editForm.distanceUnit,
          locationName: editForm.locationName.trim() || null,
          imageUrl: editForm.imageUrl || null,
          isActive: editForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update.");
      setHighlights((prev) => prev.map((h) => (h.id === editingId ? data.highlight : h)));
      setEditingId(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update highlight.");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm("Delete this nearby highlight?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${base}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete.");
      setHighlights((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // silently ignore — user can retry
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="h-20 rounded-xl bg-slate-50 animate-pulse" />;
  }

  if (fetchError) {
    return <p className="text-sm text-rose-600">{fetchError}</p>;
  }

  return (
    <div className="space-y-3">
      {highlights.map((h) => {
        const cat = NEARBY_CATEGORIES.find((c) => c.value === h.category);
        if (editingId === h.id) {
          return (
            <HighlightForm
              key={h.id}
              form={editForm}
              onChange={setEditForm}
              onSave={saveEdit}
              onCancel={() => setEditingId(null)}
              saving={editSaving}
              error={editError}
            />
          );
        }
        return (
          <div
            key={h.id}
            className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 ${h.isActive ? "border-slate-100" : "border-slate-100 opacity-50"}`}
          >
            {h.imageUrl && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-[#14213d] truncate">{h.title}</p>
                {cat && (
                  <span className="text-xs font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    {cat.label}
                  </span>
                )}
                {!h.isActive && (
                  <span className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">Hidden</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                {h.locationName && <span>{h.locationName}</span>}
                {h.distance != null && <span>{h.distance} {h.distanceUnit ?? "km"}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(h)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-[#14213d] hover:bg-[#14213d]/5 transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
              <button
                type="button"
                onClick={() => deleteHighlight(h.id)}
                disabled={deletingId === h.id}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        );
      })}

      {highlights.length === 0 && !addingNew && (
        <p className="text-xs text-slate-400 italic">No highlights yet.</p>
      )}

      {addingNew ? (
        <HighlightForm
          form={newForm}
          onChange={setNewForm}
          onSave={saveNew}
          onCancel={() => { setAddingNew(false); setNewForm(emptyForm()); setAddError(""); }}
          saving={addSaving}
          error={addError}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-[#14213d]/30 px-4 py-3 text-sm font-medium text-[#14213d] hover:bg-[#14213d]/5 transition-colors w-full justify-center"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Nearby Highlight
        </button>
      )}
    </div>
  );
}
