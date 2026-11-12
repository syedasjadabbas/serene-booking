import { baseApi } from "@/global/api/baseApi";
import { EP } from "@/global/constants/api";
import type { Booking, CreateBookingInput, Paginated } from "@/global/api/types";

export type BookingTab = "upcoming" | "past" | "cancelled";

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    createBooking: b.mutation<Booking, CreateBookingInput>({
      query: (body) => ({ url: EP.bookings.create, method: "POST", body }),
      invalidatesTags: ["Bookings", "Availability", "Property"],
    }),
    myBookings: b.query<Paginated<Booking>, { status: BookingTab; page: number }>({
      query: (params) => ({ url: EP.bookings.mine, params }),
      providesTags: ["Bookings"],
    }),
    myBooking: b.query<Booking, string>({
      query: (ref) => EP.bookings.mineOne(ref),
      providesTags: (_r, _e, ref) => [{ type: "Bookings", id: ref }],
    }),
    lookupBooking: b.mutation<Booking, { reference: string; email: string }>({
      query: (body) => ({ url: EP.bookings.lookup, method: "POST", body }),
    }),
    cancelBooking: b.mutation<Booking, { reference: string; email?: string; reason?: string }>({
      query: ({ reference, ...body }) => ({ url: EP.bookings.cancel(reference), method: "POST", body }),
      invalidatesTags: ["Bookings", "Availability"],
    }),
  }),
});

export const { useCreateBookingMutation, useMyBookingsQuery, useMyBookingQuery, useLookupBookingMutation, useCancelBookingMutation } = bookingsApi;
