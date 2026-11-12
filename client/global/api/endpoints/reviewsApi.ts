import { baseApi } from "@/global/api/baseApi";
import { EP } from "@/global/constants/api";
import type { ReviewsResponse } from "@/global/api/types";

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    reviews: b.query<ReviewsResponse, { page: number; pageSize?: number }>({
      query: (params) => ({ url: EP.reviews.root, params }),
      providesTags: ["Reviews"],
    }),
    createReview: b.mutation<{ id: string }, { bookingReference: string; rating: number; title: string; body: string }>({
      query: (body) => ({ url: EP.reviews.root, method: "POST", body }),
      invalidatesTags: ["Reviews", "Bookings", "Property"],
    }),
  }),
});

export const { useReviewsQuery, useCreateReviewMutation } = reviewsApi;
