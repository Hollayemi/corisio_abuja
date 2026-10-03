import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminOrderDetail,
  AdminOrderStats,
  AdminOrderSummary,
  ApiSuccess,
  CancelAdminOrderRequest,
  GetAdminOrderStatsParams,
  ListAdminOrdersParams,
  Paginated,
  UpdateAdminOrderStatusRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Admin Orders (the staff Orders page).
 *
 *  Query
 *  ── GET   /admin/orders/stats          getAdminOrderStats  (stat strip + tab counts)
 *  ── GET   /admin/orders                listAdminOrders     (tabs, search, status, period, pagination)
 *  ── GET   /admin/orders/:id            getAdminOrder       (Order Details drawer)
 *
 *  Actions
 *  ── PATCH /admin/orders/:id/status     updateAdminOrderStatus  ("Update Order Status")
 *  ── POST  /admin/orders/:id/cancel     cancelAdminOrder        ("Cancel Order")
 *
 * Kept separate from ordersApi.ts, which is the customer's own "My Orders".
 * Every action invalidates the order, the list and the stats, so the table,
 * the drawer and the numbers on top refresh together.
 */
export const adminOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The five stat cards, plus the counts on the three tabs. */
    getAdminOrderStats: builder.query<ApiSuccess<AdminOrderStats>, GetAdminOrderStatsParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminOrders.stats,
        params: params ?? undefined,
      }),
      providesTags: ["AdminOrderStats"],
    }),

    /** The orders table. */
    listAdminOrders: builder.query<ApiSuccess<Paginated<AdminOrderSummary>>, ListAdminOrdersParams | void>({
      query: (params) => ({
        url: API_ROUTES.adminOrders.list,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((o) => ({ type: "AdminOrder" as const, id: o.id })),
              { type: "AdminOrder" as const, id: "LIST" },
            ]
          : [{ type: "AdminOrder" as const, id: "LIST" }],
    }),

    /** The Order Details drawer: customer, timeline, items, payment summary. */
    getAdminOrder: builder.query<ApiSuccess<AdminOrderDetail>, string>({
      query: (id) => ({ url: API_ROUTES.adminOrders.detail(id) }),
      providesTags: (_result, _error, id) => [{ type: "AdminOrder", id }],
    }),

    /** "Update Order Status": move an order along the workflow. */
    updateAdminOrderStatus: builder.mutation<ApiSuccess<AdminOrderDetail>, UpdateAdminOrderStatusRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminOrders.status(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminOrder", id },
        { type: "AdminOrder", id: "LIST" },
        "AdminOrderStats",
      ],
    }),

    /** "Cancel Order": a reason is required so the timeline has an audit trail. */
    cancelAdminOrder: builder.mutation<ApiSuccess<AdminOrderDetail>, CancelAdminOrderRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminOrders.cancel(id),
        method: "POST",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminOrder", id },
        { type: "AdminOrder", id: "LIST" },
        "AdminOrderStats",
      ],
    }),
  }),
});

export const {
  useGetAdminOrderStatsQuery,
  useListAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateAdminOrderStatusMutation,
  useCancelAdminOrderMutation,
} = adminOrdersApi;
