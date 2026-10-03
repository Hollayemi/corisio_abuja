import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  CancelOrderRequest,
  ListOrdersRequest,
  ListOrdersResponse,
  OrderDetail,
  OrderRating,
  OrderTracking,
  RateOrderRequest,
  ReorderResponse,
  RequestReturnRequest,
  RequestReturnResponse,
  ReturnEligibility,
} from "../types";
import baseApi from "./baseApi";

/**
 * Orders — Return / Track / Query.
 *
 *  Query
 *  ── GET  /orders                        listOrders    (paginated, filterable)
 *  ── GET  /orders/:id                    getOrder      (full detail)
 *
 *  Track
 *  ── GET  /orders/:id/tracking           getOrderTracking (cheap to poll)
 *  ── POST /orders/:id/rating             rateOrder     (completed + unrated only)
 *
 *  Return
 *  ── POST /orders/:id/cancel             cancelOrder   (before it ships)
 *  ── GET  /orders/:id/return/eligibility getReturnEligibility
 *  ── POST /orders/:id/return             requestReturn
 *  ── POST /orders/:id/reorder            reorder       (bonus: repeat an order)
 *
 * All routes are scoped server-side to the signed-in user's own orders —
 * axiosBaseQuery already attaches the bearer token from the session.
 */
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listOrders: builder.query<ApiSuccess<ListOrdersResponse>, ListOrdersRequest | void>({
      query: (params) => ({
        url: API_ROUTES.orders.list,
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.orders.map((o) => ({ type: "Orders" as const, id: o.id })),
              { type: "Orders" as const, id: "LIST" },
            ]
          : [{ type: "Orders" as const, id: "LIST" }],
    }),

    getOrder: builder.query<ApiSuccess<OrderDetail>, string>({
      query: (id) => ({
        url: API_ROUTES.orders.detail(id),
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    getOrderTracking: builder.query<ApiSuccess<OrderTracking>, string>({
      query: (id) => ({
        url: API_ROUTES.orders.tracking(id),
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    rateOrder: builder.mutation<ApiSuccess<OrderRating>, RateOrderRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.orders.rating(id),
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Orders", id }],
    }),

    cancelOrder: builder.mutation<ApiSuccess<OrderDetail>, CancelOrderRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.orders.cancel(id),
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    getReturnEligibility: builder.query<ApiSuccess<ReturnEligibility>, string>({
      query: (id) => ({
        url: API_ROUTES.orders.returnEligibility(id),
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    requestReturn: builder.mutation<ApiSuccess<RequestReturnResponse>, RequestReturnRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.orders.requestReturn(id),
        method: "POST",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    reorder: builder.mutation<ApiSuccess<ReorderResponse>, string>({
      query: (id) => ({
        url: API_ROUTES.orders.reorder(id),
        method: "POST",
      }),
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useGetOrderTrackingQuery,
  useRateOrderMutation,
  useCancelOrderMutation,
  useGetReturnEligibilityQuery,
  useRequestReturnMutation,
  useReorderMutation,
} = ordersApi;