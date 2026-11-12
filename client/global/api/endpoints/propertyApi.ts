import { baseApi } from "@/global/api/baseApi";
import { EP } from "@/global/constants/api";
import type { Property, PublicConfig } from "@/global/api/types";

export const propertyApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    property: b.query<Property, void>({ query: () => EP.property.root, providesTags: ["Property"], keepUnusedDataFor: 600 }),
    publicConfig: b.query<PublicConfig, void>({ query: () => EP.property.config, keepUnusedDataFor: 600 }),
  }),
});

export const { usePropertyQuery, usePublicConfigQuery } = propertyApi;
