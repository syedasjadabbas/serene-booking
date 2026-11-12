import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { API_BASE, EP, TAGS } from "@/global/constants/api";
import { useAuthStore } from "@/global/stores/authStore";
import { refreshSession } from "@/global/api/refresh";
import type { ApiError } from "@/global/api/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const urlOf = (args: string | FetchArgs) => (typeof args === "string" ? args : args.url);
const NO_REFRESH = [EP.auth.login, EP.auth.register, EP.auth.refresh];

// Wraps fetchBaseQuery: refresh-on-401 (single in-flight), retry once on 429/503,
// and unwraps the { success, message, data } envelope into data / ApiError.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);

  if (result.error && (result.error.status === 429 || result.error.status === 503)) {
    await sleep(800);
    result = await rawBaseQuery(args, api, extra);
  }

  if (result.error?.status === 401 && !NO_REFRESH.includes(urlOf(args) as never) && useAuthStore.getState().accessToken) {
    if (await refreshSession()) result = await rawBaseQuery(args, api, extra);
  }

  if (result.error) return { error: toApiError(result.error) };
  const body = result.data as { success?: boolean; data?: unknown; message?: string };
  return { data: body && "data" in body ? body.data : body, meta: result.meta };
};

function toApiError(err: FetchBaseQueryError): ApiError {
  const data = "data" in err ? (err.data as { message?: string; code?: string } | undefined) : undefined;
  if (err.status === "FETCH_ERROR") return { status: err.status, message: "We can't reach the server. Check your connection and try again." };
  return {
    status: err.status,
    message: data?.message || "Something went wrong. Please try again.",
    code: data?.code,
  };
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: TAGS,
  endpoints: () => ({}),
});

export const errorMessage = (err: unknown) =>
  (err as ApiError | undefined)?.message ?? "Something went wrong. Please try again.";
