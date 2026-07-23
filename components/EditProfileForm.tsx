"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

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
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-[0_4px_20px_rgba(11,31,58,0.06)]"
    >
      <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
        Edit Profile
      </h2>
      <p className="mt-1 text-sm text-slate-500">Update your display name.</p>

      {errorMessage ? (
        <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6">
        <Field label="Display Name" htmlFor="displayName">
          <Input
            id="displayName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </Field>
      </div>

      <Button type="submit" loading={isSaving} className="mt-6">
        {isSaving ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
