"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("New password must be different from your current password.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to change password.");
        return;
      }

      setSuccessMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10";

  return (
    <form
      onSubmit={handleChangePassword}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8"
    >
      <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
        Change Password
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Update your account password securely.
      </p>

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

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            placeholder="Enter current password"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
          />
          <p className="mt-1 text-xs text-gray-400">Minimum 8 characters.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}
