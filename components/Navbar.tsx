import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  return (
    <header className="bg-blue-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          Booking Clone
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/" className="text-sm hover:text-blue-200">
            Stays
          </Link>ss
          <Link href="/bookings" className="text-sm hover:text-blue-200">
            Bookings
          </Link>
          <a href="#" className="text-sm hover:text-blue-200">
            Flights
          </a>
          <a href="#" className="text-sm hover:text-blue-200">
            Car Rentals
          </a>
          <a href="#" className="text-sm hover:text-blue-200">
            Attractions
          </a>
        </nav>

        <div className="flex items-center gap-3">
         {currentUser ? (
  <>
    <Link
      href="/account"
      className="rounded-md bg-blue-800 px-3 py-2 text-sm text-white hover:bg-blue-700"
    >
      {currentUser.name
        ? `Hi, ${currentUser.name}`
        : currentUser.email
        ? currentUser.email
        : "Account"}
    </Link>
{currentUser.role === "ADMIN" && (
  <Link
    href="/admin"
    className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-400"
  >
    Admin
  </Link>
)}
    <LogoutButton />
  </>
) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-blue-900"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}