"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
      setErrorMessage(
        "New password must be different from your current password.",
      );
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

  return (
    <form
      onSubmit={handleChangePassword}
      className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-[0_4px_20px_rgba(11,31,58,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
            Change Password
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your account password securely.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-[#14213d]"
        >
          <span
            className="material-symbols-outlined text-base leading-none"
            aria-hidden="true"
          >
            {showPw ? "visibility_off" : "visibility"}
          </span>
          {showPw ? "Hide" : "Show"}
        </button>
      </div>

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

      <div className="mt-6 space-y-4">
        <Field label="Current Password" htmlFor="currentPassword">
          <Input
            id="currentPassword"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
        </Field>

        <Field
          label="New Password"
          htmlFor="newPassword"
          hint="Minimum 8 characters."
        >
          <Input
            id="newPassword"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
          />
        </Field>
      </div>

      <Button type="submit" loading={isSaving} className="mt-6">
        {isSaving ? "Updating…" : "Change Password"}
      </Button>
    </form>
  );
}
