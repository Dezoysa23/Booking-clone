import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export default function SubscribeConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#071B63]/20 border-t-[#071B63]" />
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
