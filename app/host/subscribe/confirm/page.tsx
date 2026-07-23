import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export default function SubscribeConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#14213d]/20 border-t-[#14213d]" />
        </div>
      }
    >
      <ConfirmClient />
    </Suspense>
  );
}
