import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminCustomerDetail,
  AdminCustomerStats,
  AdminCustomerSummary,
  ApiSuccess,
  GetAdminCustomerStatsParams,
  ListAdminCustomersParams,
  Paginated,
  UpdateAdminCustomerStatusRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Admin Customers (the staff Customers pages).
 *
 *  Query
 *  ── GET   /admin/customers/stats       getAdminCustomerStats  (the 4 stat cards)
 *  ── GET   /admin/customers             listAdminCustomers     (table: search, status, period, pagination)
 *  ── GET   /admin/customers/:id         getAdminCustomer       (customer page)
 *
 *  Action
 *  ── PATCH /admin/customers/:id/status  updateAdminCustomerStatus  ("Suspend / Reactivate Account")
 *
 * A customer's Order History is not here: it's useListAdminOrdersQuery({ customerId })
 * from adminOrdersApi.
 */
export const adminCustomersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCustomerStats: builder.query<ApiSuccess<AdminCustomerStats>, GetAdminCustomerStatsParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminCustomers.stats,
        params: params ?? undefined,
      }),
      providesTags: ["AdminCustomerStats"],
    }),

    listAdminCustomers: builder.query<ApiSuccess<Paginated<AdminCustomerSummary>>, ListAdminCustomersParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminCustomers.list,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((c) => ({ type: "AdminCustomer" as const, id: c.id })),
              { type: "AdminCustomer" as const, id: "LIST" },
            ]
          : [{ type: "AdminCustomer" as const, id: "LIST" }],
    }),

    getAdminCustomer: builder.query<ApiSuccess<AdminCustomerDetail>, string>({
      query: (id) => ({ url: API_ROUTES.adminCustomers.detail(id) }),
      providesTags: (_result, _error, id) => [{ type: "AdminCustomer", id }],
    }),

    /** Suspend or reactivate an account. Refreshes the page, the table and the stats. */
    updateAdminCustomerStatus: builder.mutation<ApiSuccess<AdminCustomerDetail>, UpdateAdminCustomerStatusRequest>({
      query: ({ id, status }) => ({
        url: API_ROUTES.adminCustomers.status(id),
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminCustomer", id },
        { type: "AdminCustomer", id: "LIST" },
        "AdminCustomerStats",
      ],
    }),
  }),
});

export const {
  useGetAdminCustomerStatsQuery,
  useListAdminCustomersQuery,
  useGetAdminCustomerQuery,
  useUpdateAdminCustomerStatusMutation,
} = adminCustomersApi;
