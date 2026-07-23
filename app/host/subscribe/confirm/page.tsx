import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export default function SubscribeConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F2E9] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#14213D]/20 border-t-[#14213D]" />
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
