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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      alert("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>

      <p className="mt-2 text-gray-600">
        Update your profile information.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          placeholder="Enter your name"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}