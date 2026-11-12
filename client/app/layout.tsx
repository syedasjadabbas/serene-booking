import type { Metadata, Viewport } from "next";
import { Inter, Jost } from "next/font/google";
import "react-day-picker/style.css";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/global/components/SiteHeader";
import SiteFooter from "@/global/components/SiteFooter";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Jost({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "Serene Heights Nathia Gali | Book your mountain stay", template: "%s | Serene Heights Nathia Gali" },
  description:
    "Book fully furnished one-bedroom hotel apartments at Serene Heights, Nathia Gali: 7,906 ft, heated infinity pool, rooftop dining and 50+ resort facilities.",
  icons: { icon: "/brand/mark-green.png" },
};

export const viewport: Viewport = { themeColor: "#36564f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
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
