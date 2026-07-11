import type { Metadata } from "next";
import { Zilla_Slab, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// T7 (chosen 2026-07-11): Zilla Slab headings — sturdy craft-workshop warmth —
// with Source Sans 3 body. Replaced Fraunces + Nunito Sans (the Fraunces
// pairing had become the signature of AI-built wellness apps).
const zillaSlab = Zilla_Slab({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hearth: a warm home for our community’s practitioners",
  description:
    "Find healers, facilitators, and conscious businesses in a warm, phone-friendly directory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${zillaSlab.variable} ${sourceSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* AODA: keyboard users can jump straight past the navigation. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
