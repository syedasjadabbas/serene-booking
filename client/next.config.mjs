/** @type {import('next').NextConfig} */

// Where the Express API lives. On Vercel this must be the API project's URL, e.g. https://serene-booking-api.vercel.app
const API_URL = process.env.API_URL || "http://localhost:4000";

// Fail the Vercel build early instead of shipping a site that proxies to localhost.
if (process.env.VERCEL && !process.env.API_URL) {
  throw new Error("API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables (the API project's URL).");
}

// Serene Booking lives inside the Serene Heights Group site at /booking (Next.js Multi-Zones):
// sereneheightsgroup.com/booking/* is rewritten by the group site to this deployment.
// Set NEXT_PUBLIC_BASE_PATH="" to run at the root instead.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/booking";

const nextConfig = {
  reactStrictMode: true,
  basePath: BASE_PATH || undefined,
  // Same value for client code (global/lib/asset.ts) so image, icon and API paths match the base path.
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  // On this app's own domain, the bare root forwards to /booking (the group site owns "/" on its domain).
  async redirects() {
    return BASE_PATH ? [{ source: "/", destination: BASE_PATH, basePath: false, permanent: false }] : [];
  },
  poweredByHeader: false,
  // Lets a production build run beside `next dev` without clobbering its .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The browser talks to {basePath}/api/v1 on this origin; Next proxies to the Express API
  // (rewrite sources are prefixed with basePath automatically).
  // Same-origin keeps the httpOnly refresh cookie first-party (no third-party cookie problems).
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL.replace(/\/$/, "")}/api/v1/:path*` }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // optimised images cached for 30 days
  },
  async headers() {
    return [
      {
        // Static brand/photo assets never change in place; let browsers and the CDN cache them.
        source: "/(images|brand)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
