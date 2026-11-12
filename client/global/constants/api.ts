export const API_BASE = "/api/v1";

export const EP = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    changePassword: "/auth/change-password",
  },
  property: { root: "/property", config: "/property/config" },
  rooms: {
    list: "/rooms",
    availability: "/rooms/availability",
    calendar: "/rooms/calendar",
    detail: (slug: string) => `/rooms/${slug}`,
    rates: (slug: string) => `/rooms/${slug}/rates`,
  },
  bookings: {
    create: "/bookings",
    mine: "/bookings/mine",
    mineOne: (ref: string) => `/bookings/mine/${ref}`,
    lookup: "/bookings/lookup",
    cancel: (ref: string) => `/bookings/${ref}/cancel`,
  },
  reviews: { root: "/reviews" },
} as const;

export const TAGS = ["Me", "Property", "Rooms", "Availability", "Bookings", "Reviews"] as const;
