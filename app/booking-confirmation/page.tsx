import Link from "next/link";
import BackButton from "@/components/BackButton";

type BookingConfirmationPageProps = {
  searchParams: Promise<{
    propertyName?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    nights?: string;
    totalPrice?: string;
  }>;
};

export default async function BookingConfirmationPage({
  searchParams,
}: BookingConfirmationPageProps) {
  const params = await searchParams;

  const propertyName = params.propertyName || "Unknown Property";
  const checkIn = params.checkIn || "Not selected";
  const checkOut = params.checkOut || "Not selected";
  const guests = params.guests || "0";
  const nights = params.nights || "0";
  const totalPrice = params.totalPrice || "0";

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-4xl font-bold text-gray-900">
          Booking Confirmation
        </h1>

        <p className="mt-3 text-gray-600">
          Your booking details are shown below.
        </p>

        <div className="mt-8 space-y-4">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Property:</span> {propertyName}
          </p>

          <p className="text-lg text-gray-700">
            <span className="font-semibold">Check-in:</span> {checkIn}
          </p>

          <p className="text-lg text-gray-700">
            <span className="font-semibold">Check-out:</span> {checkOut}
          </p>

          <p className="text-lg text-gray-700">
            <span className="font-semibold">Guests:</span> {guests}
          </p>

          <p className="text-lg text-gray-700">
            <span className="font-semibold">Nights:</span> {nights}
          </p>

          <p className="text-lg text-gray-700">
            <span className="font-semibold">Total Price:</span> LKR{" "}
            {Number(totalPrice).toLocaleString()}
          </p>
        </div>

        <div className="mt-8 rounded-xl bg-green-50 p-4 text-green-700">
          Demo success: your booking step is working correctly.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <BackButton label="Back" />

          <Link
            href="/"
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}