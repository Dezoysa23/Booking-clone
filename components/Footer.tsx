export default function Footer() {
  return (
    <footer className="mt-16 bg-blue-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold">Booking Clone</h3>
            <p className="mt-3 text-sm text-blue-100">
              A hotel booking MVP inspired by Booking.com, built step by step.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-blue-100">
              <li>Stays</li>
              <li>Flights</li>
              <li>Car Rentals</li>
              <li>Attractions</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold">Contact</h4>
            <p className="mt-3 text-sm text-blue-100">
              Email: hello@bookingclone.com
            </p>
            <p className="mt-1 text-sm text-blue-100">
              Phone: +94 77 123 4567
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-blue-800 pt-4 text-sm text-blue-200">
          © 2025 Booking Clone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}