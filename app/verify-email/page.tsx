import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F2E9]" />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
