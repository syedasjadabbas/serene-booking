import { baseApi } from "@/global/api/baseApi";
import { EP } from "@/global/constants/api";
import type { AvailabilityResponse, RatesResponse, RoomType, RoomTypeDetail, Stay } from "@/global/api/types";

export const roomsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    roomTypes: b.query<RoomType[], void>({ query: () => EP.rooms.list, providesTags: ["Rooms"], keepUnusedDataFor: 300 }),
    availability: b.query<AvailabilityResponse, Stay>({
      query: (params) => ({ url: EP.rooms.availability, params }),
      providesTags: ["Availability"],
      keepUnusedDataFor: 30,
    }),
    roomType: b.query<RoomTypeDetail, string>({ query: (slug) => EP.rooms.detail(slug), providesTags: ["Rooms"], keepUnusedDataFor: 300 }),
    rates: b.query<RatesResponse, { slug: string } & Stay>({
      query: ({ slug, ...params }) => ({ url: EP.rooms.rates(slug), params }),
      providesTags: ["Availability"],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useRoomTypesQuery, useAvailabilityQuery, useRoomTypeQuery, useRatesQuery } = roomsApi;
