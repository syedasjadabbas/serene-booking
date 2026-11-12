import { NextResponse, type NextRequest } from "next/server";

// Runs only for /api/v1/* (which next.config rewrites to the Express API). Adds the visitor's real IP
// plus a shared secret, so the API can rate-limit and audit per visitor instead of per proxy.
// The API trusts x-sb-client-ip only when x-sb-proxy-key matches its PROXY_SECRET.
export function middleware(req: NextRequest) {
  const secret = process.env.PROXY_SECRET;
  const headers = new Headers(req.headers);
  // Never pass through values a browser might have set itself.
  headers.delete("x-sb-proxy-key");
  headers.delete("x-sb-client-ip");

  if (secret) {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
    headers.set("x-sb-proxy-key", secret);
    if (ip) headers.set("x-sb-client-ip", ip);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/v1/:path*" };
