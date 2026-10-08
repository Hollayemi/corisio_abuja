import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  ListPublicStoresParams,
  PublicStoreDetail,
  PublicStoreList,
} from "../types";
import baseApi from "./baseApi";

/**
 * Public stores (the /stores map and store pages).
 *
 *  GET /catalog/stores          listPublicStores   filters: search, category, radiusKm, limit
 *  GET /catalog/stores/:slug    getPublicStore
 *
 * Neither endpoint takes coordinates as arguments: axiosBaseQuery adds the visitor's
 * location to every request as X-User-Lat / X-User-Lng headers. RTK Query doesn't know
 * about headers, so when the location changes, <LocationSync /> (redux/provider.tsx)
 * invalidates the "Stores" tag and anything on screen refetches in the new order.
 */
export const publicStoresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicStores: builder.query<ApiSuccess<PublicStoreList>, ListPublicStoresParams | void>({
      query: (params) => ({ url: API_ROUTES.catalog.stores, params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((s) => ({ type: "Stores" as const, id: s.slug })),
              { type: "Stores" as const, id: "LIST" },
            ]
          : [{ type: "Stores" as const, id: "LIST" }],
    }),

    getPublicStore: builder.query<ApiSuccess<PublicStoreDetail>, string>({
      query: (slug) => ({ url: API_ROUTES.catalog.store(slug) }),
      providesTags: (_result, _error, slug) => [{ type: "Stores", id: slug }],
    }),
  }),
});

export const { useListPublicStoresQuery, useGetPublicStoreQuery } = publicStoresApi;
