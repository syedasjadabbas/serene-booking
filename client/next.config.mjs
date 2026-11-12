/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || "http://localhost:4000";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a production build run beside `next dev` without clobbering its .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // The browser talks to /api/v1 on this origin; Next proxies to the Express API.
  // Same-origin keeps the httpOnly refresh cookie simple and avoids CORS in the browser.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_URL}/api/v1/:path*` }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
