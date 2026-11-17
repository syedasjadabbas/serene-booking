import type { Metadata, Viewport } from "next";
import { Jost, Marcellus } from "next/font/google";
import "react-day-picker/style.css";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/global/components/SiteHeader";
import SiteFooter from "@/global/components/SiteFooter";
import Cursor from "@/global/components/Cursor";

import { asset } from "@/global/lib/asset";
// Jost for text (the Serene Heights logo lettering) and Marcellus, a classic inscriptional serif, for headings.
const sans = Jost({ subsets: ["latin"], variable: "--font-sans", display: "swap", weight: ["300", "400", "500", "600", "700"] });
const serif = Marcellus({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: "400" });

export const metadata: Metadata = {
  // Absolute base for Open Graph images and canonical URLs. Set SITE_URL in production.
  metadataBase: new URL(
    process.env.SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ),
  title: { default: "Serene Heights Nathia Gali | Book your mountain stay", template: "%s | Serene Heights Nathia Gali" },
  description:
    "Book fully furnished one-bedroom hotel apartments at Serene Heights, Nathia Gali: 7,906 ft, heated infinity pool, rooftop dining and 50+ resort facilities.",
  icons: { icon: asset("/brand/mark-green.png") },
};

export const viewport: Viewport = { themeColor: "#18332a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <Cursor />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
