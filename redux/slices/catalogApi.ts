import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  ListRelatedProductsParams,
  ListStorefrontProductsParams,
  Paginated,
  StorefrontCategory,
  StorefrontProduct,
} from "../types";
import baseApi from "./baseApi";

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiSuccess<StorefrontCategory[]>, void>({
      query: () => ({ url: API_ROUTES.catalog.categories }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.map((c) => ({ type: "Category" as const, id: c.id })),
            { type: "Category" as const, id: "LIST" },
          ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    listStorefrontProducts: builder.query<
      ApiSuccess<Paginated<StorefrontProduct>>,
      ListStorefrontProductsParams | void
    >({
      query: (params) => ({ url: API_ROUTES.catalog.products, params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.items.map((p) => ({ type: "Product" as const, id: p.id })),
            { type: "Product" as const, id: "LIST" },
          ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    /** The product detail page. */
    getStorefrontProduct: builder.query<ApiSuccess<StorefrontProduct>, string>({
      query: (slug) => ({ url: API_ROUTES.catalog.product(slug) }),
      providesTags: (_result, _error, slug) => [{ type: "Product", id: slug }],
    }),

    /** "Explore Related Products" on the product detail page. */
    getRelatedProducts: builder.query<
      ApiSuccess<{ items: StorefrontProduct[] }>,
      ListRelatedProductsParams
    >({
      query: ({ slug, limit }) => ({
        url: API_ROUTES.catalog.related(slug),
        params: limit ? { limit } : undefined,
      }),
      providesTags: (result) =>
        result
          ? result.data.items.map((p) => ({ type: "Product" as const, id: p.id }))
          : [],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useListStorefrontProductsQuery,
  useGetStorefrontProductQuery,
  useGetRelatedProductsQuery,
} = catalogApi;
