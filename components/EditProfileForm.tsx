"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialName: string;
};

export default function EditProfileForm({ initialName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update profile.");
        return;
      }

      setSuccessMessage("Profile updated successfully.");
      router.refresh();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
      <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
        Edit Profile
      </h2>
      <p className="mt-1 text-sm text-[#5B6472]">Update your display name.</p>

      {errorMessage && (
        <div className="mt-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-5 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#7C879B]">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10"
          placeholder="Enter your name"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
