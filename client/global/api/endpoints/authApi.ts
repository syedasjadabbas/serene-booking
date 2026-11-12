import { baseApi } from "@/global/api/baseApi";
import { EP } from "@/global/constants/api";
import { useAuthStore } from "@/global/stores/authStore";
import type { AuthPayload, Customer } from "@/global/api/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    register: b.mutation<AuthPayload, { firstName: string; lastName: string; email: string; phone?: string; password: string }>({
      query: (body) => ({ url: EP.auth.register, method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        useAuthStore.getState().setSession(data.accessToken, data.customer);
      },
      invalidatesTags: ["Me", "Bookings"],
    }),
    login: b.mutation<AuthPayload, { email: string; password: string }>({
      query: (body) => ({ url: EP.auth.login, method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        useAuthStore.getState().setSession(data.accessToken, data.customer);
      },
      invalidatesTags: ["Me", "Bookings"],
    }),
    logout: b.mutation<null, void>({
      query: () => ({ url: EP.auth.logout, method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          useAuthStore.getState().clear(null);
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    me: b.query<Customer, void>({
      query: () => EP.auth.me,
      providesTags: ["Me"],
    }),
    updateProfile: b.mutation<Customer, Partial<Pick<Customer, "firstName" | "lastName" | "phone" | "country">>>({
      query: (body) => ({ url: EP.auth.me, method: "PATCH", body }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        useAuthStore.getState().setCustomer(data);
      },
      invalidatesTags: ["Me"],
    }),
    changePassword: b.mutation<{ accessToken: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: EP.auth.changePassword, method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        useAuthStore.getState().setSession(data.accessToken);
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useMeQuery, useUpdateProfileMutation, useChangePasswordMutation } = authApi;
