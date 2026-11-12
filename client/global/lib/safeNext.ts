// Only allow same-site relative redirects after sign-in (no open redirects).
export const safeNext = (next: string | null | undefined, fallback = "/account") =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
