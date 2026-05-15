import { redirect } from "next/navigation";

// The real confirmation page is at /booking-confirmation/[id]
// This root route is unused — redirect home to prevent confusion.
export default function BookingConfirmationRootPage() {
  redirect("/");
}