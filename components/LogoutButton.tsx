"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await fetch("/api/auth/logout", { method: "POST" });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {isLoggingOut ? <Spinner className="h-3.5 w-3.5" /> : null}
      {isLoggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
