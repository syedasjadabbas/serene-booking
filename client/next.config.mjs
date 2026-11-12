/** @type {import('next').NextConfig} */

// Where the Express API lives. On Vercel this must be the API project's URL, e.g. https://serene-booking-api.vercel.app
const API_URL = process.env.API_URL || "http://localhost:4000";

// Fail the Vercel build early instead of shipping a site that proxies to localhost.
if (process.env.VERCEL && !process.env.API_URL) {
  throw new Error("API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables (the API project's URL).");
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a production build run beside `next dev` without clobbering its .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The browser talks to /api/v1 on this origin; Next proxies to the Express API.
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
