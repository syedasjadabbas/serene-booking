import { create } from "zustand";
import type { Booking } from "@/global/api/types";

// Holds bookings a guest just made or looked up (reference + email), so the
// confirmation / manage page can show them without an account. Memory only.
interface BookingStore {
  byRef: Record<string, { booking: Booking; email: string }>;
  remember: (booking: Booking) => void;
  forget: (reference: string) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  byRef: {},
  remember: (booking) => set((s) => ({ byRef: { ...s.byRef, [booking.reference]: { booking, email: booking.guest.email } } })),
  forget: (reference) =>
    set((s) => {
      const next = { ...s.byRef };
      delete next[reference];
      return { byRef: next };
    }),
}));
