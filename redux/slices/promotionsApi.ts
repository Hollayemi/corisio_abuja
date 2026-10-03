import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  CreatePromotionRequest,
  ListPromotionsParams,
  Paginated,
  Promotion,
  PromotionDetail,
  PromotionStats,
  UpdatePromotionRequest,
} from "../types";
import baseApi from "../slices/baseApi";

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The four stat cards at the top of the Promotions page. */
    getPromotionStats: builder.query<ApiSuccess<PromotionStats>, void>({
      query: () => ({ url: API_ROUTES.promotions.stats }),
      providesTags: ["PromotionStats"],
    }),

    /** The promotions table: search, filters and pagination. */
    listPromotions: builder.query<ApiSuccess<Paginated<Promotion>>, ListPromotionsParams | void>({
      query: (params) => ({ url: API_ROUTES.promotions.list, params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((p) => ({ type: "Promotion" as const, id: p.id })),
              { type: "Promotion" as const, id: "LIST" },
            ]
          : [{ type: "Promotion" as const, id: "LIST" }],
    }),

    /** The promotion detail drawer: summary numbers + affected products. */
    getPromotion: builder.query<ApiSuccess<PromotionDetail>, string>({
      query: (id) => ({ url: API_ROUTES.promotions.detail(id) }),
      providesTags: (_result, _error, id) => [{ type: "Promotion", id }],
    }),

    createPromotion: builder.mutation<ApiSuccess<Promotion>, CreatePromotionRequest>({
      query: (body) => ({ url: API_ROUTES.promotions.list, method: "POST", data: body }),
      invalidatesTags: [{ type: "Promotion", id: "LIST" }, "PromotionStats"],
    }),

    updatePromotion: builder.mutation<ApiSuccess<Promotion>, UpdatePromotionRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.promotions.detail(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Promotion", id },
        { type: "Promotion", id: "LIST" },
        "PromotionStats",
      ],
    }),

    pausePromotion: builder.mutation<ApiSuccess<Promotion>, string>({
      query: (id) => ({ url: API_ROUTES.promotions.pause(id), method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Promotion", id },
        { type: "Promotion", id: "LIST" },
        "PromotionStats",
      ],
    }),

    resumePromotion: builder.mutation<ApiSuccess<Promotion>, string>({
      query: (id) => ({ url: API_ROUTES.promotions.resume(id), method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Promotion", id },
        { type: "Promotion", id: "LIST" },
        "PromotionStats",
      ],
    }),

    deletePromotion: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.promotions.detail(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Promotion", id },
        { type: "Promotion", id: "LIST" },
        "PromotionStats",
      ],
    }),
  }),
});

export const {
  useGetPromotionStatsQuery,
  useListPromotionsQuery,
  useGetPromotionQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  usePausePromotionMutation,
  useResumePromotionMutation,
  useDeletePromotionMutation,
} = promotionsApi;
