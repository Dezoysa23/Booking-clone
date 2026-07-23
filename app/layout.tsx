import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FooterTopDecoration } from "@/components/ui/FooterTopDecoration";

/* Body / UI face — Manrope (variable). Keeps the legacy CSS-var name so every
   existing `var(--font-plus-jakarta-sans)` reference re-renders in Manrope. */
const manrope = Manrope({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

/* Display face — Cormorant Garamond (serif, with italic for accent glyphs).
   Reuses the legacy `--font-playfair-display` var so all heading usages switch
   faces without touching a single component. */
const cormorant = Cormorant_Garamond({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pearlora — From Coastlines to Hilltops",
  description:
    "Pearlora curates extraordinary stays across Sri Lanka's most breathtaking destinations. From coastal retreats to hilltop escapes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} ${cormorant.variable} min-h-screen antialiased bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container flex flex-col`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#14213D] focus:shadow-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <FooterTopDecoration />
        <Footer />
      </body>
    </html>
  );
}
