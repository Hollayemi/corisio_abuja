import type {
  AdminDelivery,
  AdminDeliveryCalendar,
  AdminDeliveryList,
  GetAdminDeliveryCalendarParams,
  ListAdminDeliveriesParams,
  UpdateAdminDeliveryStatusRequest,
} from "../types/adminDeliveries";
import type { ApiSuccess } from "../types/api";
import baseApi from "./baseApi";

/** Endpoints for the admin Delivery & Schedule page. */
export const ADMIN_DELIVERY_ROUTES = {
  calendar: "/admin/deliveries/calendar",
  list: "/admin/deliveries",
  status: (id: string) => `/admin/deliveries/${id}/status`,
} as const;

/**
 * Admin Delivery & Schedule.
 *
 *  Query
 *  ── GET   /admin/deliveries/calendar    getAdminDeliveryCalendar  (the month grid: chips + "+N more")
 *  ── GET   /admin/deliveries             listAdminDeliveries       (a day's cards; a range for Export)
 *
 *  Action
 *  ── PATCH /admin/deliveries/:id/status  updateAdminDeliveryStatus (out for delivery / delivered / missed)
 *
 * The delivery tag is added here with enhanceEndpoints, so this file needs no
 * change to baseApi.ts. Updating a status refreshes both the calendar and the
 * day list.
 */
// const api = baseApi.enhanceEndpoints({ addTagTypes: ["AdminDelivery"] });

export const adminDeliveriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDeliveryCalendar: builder.query<
      ApiSuccess<AdminDeliveryCalendar>,
      GetAdminDeliveryCalendarParams
    >({
      query: (params) => ({ url: ADMIN_DELIVERY_ROUTES.calendar, params }),
      providesTags: [{ type: "AdminDelivery", id: "CALENDAR" }],
    }),

    listAdminDeliveries: builder.query<
      ApiSuccess<AdminDeliveryList>,
      ListAdminDeliveriesParams | void
    >({
      query: (params) => ({
        url: ADMIN_DELIVERY_ROUTES.list,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((d) => ({ type: "AdminDelivery" as const, id: d.id })),
              { type: "AdminDelivery" as const, id: "LIST" },
            ]
          : [{ type: "AdminDelivery" as const, id: "LIST" }],
    }),

    updateAdminDeliveryStatus: builder.mutation<
      ApiSuccess<AdminDelivery>,
      UpdateAdminDeliveryStatusRequest
    >({
      query: ({ id, status }) => ({
        url: ADMIN_DELIVERY_ROUTES.status(id),
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminDelivery", id },
        { type: "AdminDelivery", id: "LIST" },
        { type: "AdminDelivery", id: "CALENDAR" },
      ],
    }),
  }),
});

export const {
  useGetAdminDeliveryCalendarQuery,
  useListAdminDeliveriesQuery,
  useLazyListAdminDeliveriesQuery,
  useUpdateAdminDeliveryStatusMutation,
} = adminDeliveriesApi;
