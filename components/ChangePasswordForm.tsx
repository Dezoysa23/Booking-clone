"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch("/api/account/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      alert("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="rounded-xl bg-white p-6 shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>

      <p className="mt-2 text-gray-600">
        Update your account password securely.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          placeholder="Enter current password"
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          placeholder="Enter new password"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
      >
        {isSaving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}