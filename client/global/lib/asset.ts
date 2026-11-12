// Serene Booking is served under a base path (/booking) so it can live inside the Serene Heights
// Group site (sereneheightsgroup.com/booking). Next.js prefixes links and its own assets automatically,
// but not string image sources, metadata icons or fetch URLs — those go through here.

/** Base path baked in at build time by next.config.mjs (e.g. "/booking", or "" to run at the root). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a site-relative path ("/images/…") with the base path; leaves absolute URLs untouched. */
export function asset<T extends string | null | undefined>(src: T): T {
  if (!src || !src.startsWith("/") || src.startsWith("//")) return src;
  if (BASE_PATH && (src === BASE_PATH || src.startsWith(`${BASE_PATH}/`))) return src;
  return `${BASE_PATH}${src}` as T;
}
