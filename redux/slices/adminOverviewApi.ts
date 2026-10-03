import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminOverview,
  AdminTopProducts,
  ApiSuccess,
  GetAdminTopProductsParams,
} from "../types";
import baseApi from "./baseApi";

/**
 * Admin Overview (the "Business Overview" landing page).
 *
 *  Query
 *  ── GET /admin/overview                getAdminOverview     (ring + week bars, the four stats,
 *                                                              the four service cards, Needs your attention)
 *  ── GET /admin/overview/top-products   getAdminTopProducts  (Top Selling Products, follows its period select)
 *
 * They are separate so changing the period select only refetches the product list.
 * Updating or cancelling an order (adminOrdersApi) invalidates "AdminOverview",
 * so the numbers here refresh as staff work through the list.
 */
export const adminOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<ApiSuccess<AdminOverview>, void>({
      query: () => ({ url: API_ROUTES.adminOverview.summary }),
      providesTags: ["AdminOverview"],
    }),

    getAdminTopProducts: builder.query<ApiSuccess<AdminTopProducts>, GetAdminTopProductsParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminOverview.topProducts,
        params: params ?? undefined,
      }),
      providesTags: ["AdminTopProducts"],
    }),
  }),
});

export const { useGetAdminOverviewQuery, useGetAdminTopProductsQuery } = adminOverviewApi;
