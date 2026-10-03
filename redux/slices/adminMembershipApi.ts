import { toFormData } from "@/app/utils/to-form-data";
import { API_ROUTES } from "../config/apiRoutes";
import type {
  AdminMembershipPlan,
  AdminMembershipStats,
  AdminProtein,
  AdminSubscriber,
  ApiSuccess,
  CreateAdminMembershipPlanRequest,
  CreateAdminProteinRequest,
  ListAdminMembershipPlansParams,
  ListAdminProteinsParams,
  ListAdminSubscribersParams,
  Paginated,
  UpdateAdminMembershipPlanRequest,
  UpdateAdminProteinRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Admin Membership (a membership is a subscription).
 *
 *  Stats
 *  ── GET    /admin/membership/stats            getAdminMembershipStats
 *
 *  Plans (Overview tab, dialog CRUD)
 *  ── GET    /admin/membership/plans            listAdminMembershipPlans
 *  ── POST   /admin/membership/plans            createAdminMembershipPlan
 *  ── PATCH  /admin/membership/plans/:id        updateAdminMembershipPlan  (also used to activate / deactivate)
 *  ── DELETE /admin/membership/plans/:id        deleteAdminMembershipPlan
 *
 *  Subscribers (Subscribers / Deliveries tab)
 *  ── GET    /admin/membership/subscribers      listAdminSubscribers
 *
 *  Proteins (Proteins tab, dialog CRUD, image upload, % sold)
 *  ── GET    /admin/membership/proteins         listAdminProteins
 *  ── POST   /admin/membership/proteins         createAdminProtein         (multipart/form-data)
 *  ── PATCH  /admin/membership/proteins/:id     updateAdminProtein         (multipart/form-data)
 *  ── DELETE /admin/membership/proteins/:id     deleteAdminProtein
 *
 * Plan changes also refresh the subscribers table and the stats (price and
 * member counts move), so every number on the page stays in step.
 */
export const adminMembershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminMembershipStats: builder.query<ApiSuccess<AdminMembershipStats>, void>({
      query: () => ({ url: API_ROUTES.adminMembership.stats }),
      providesTags: ["AdminMembershipStats"],
    }),

    /* ---------------------------- Plans ---------------------------- */

    listAdminMembershipPlans: builder.query<
      ApiSuccess<{ items: AdminMembershipPlan[] }>,
      ListAdminMembershipPlansParams | void
    >({
      query: (params) => ({
        url: API_ROUTES.adminMembership.plans,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((p) => ({ type: "AdminMembershipPlan" as const, id: p.id })),
              { type: "AdminMembershipPlan" as const, id: "LIST" },
            ]
          : [{ type: "AdminMembershipPlan" as const, id: "LIST" }],
    }),

    createAdminMembershipPlan: builder.mutation<
      ApiSuccess<AdminMembershipPlan>,
      CreateAdminMembershipPlanRequest
    >({
      query: (body) => ({
        url: API_ROUTES.adminMembership.plans,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "AdminMembershipPlan", id: "LIST" }, "AdminMembershipStats"],
    }),

    updateAdminMembershipPlan: builder.mutation<
      ApiSuccess<AdminMembershipPlan>,
      UpdateAdminMembershipPlanRequest
    >({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMembership.plan(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminMembershipPlan", id },
        { type: "AdminMembershipPlan", id: "LIST" },
        { type: "AdminSubscriber", id: "LIST" },
        "AdminMembershipStats",
      ],
    }),

    /** The backend should refuse to delete a plan that still has members. */
    deleteAdminMembershipPlan: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.adminMembership.plan(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminMembershipPlan", id },
        { type: "AdminMembershipPlan", id: "LIST" },
        { type: "AdminSubscriber", id: "LIST" },
        "AdminMembershipStats",
      ],
    }),

    /* ------------------------- Subscribers ------------------------- */

    listAdminSubscribers: builder.query<
      ApiSuccess<Paginated<AdminSubscriber>>,
      ListAdminSubscribersParams | void
    >({
      query: (params) => ({
        url: API_ROUTES.adminMembership.subscribers,
        params: params ?? undefined,
      }),
      providesTags: [{ type: "AdminSubscriber", id: "LIST" }],
    }),

    /* -------------------------- Proteins --------------------------- */

    /** Sorted by soldPercentage, highest first (backend default). */
    listAdminProteins: builder.query<
      ApiSuccess<{ items: AdminProtein[] }>,
      ListAdminProteinsParams | void
    >({
      query: (params) => ({
        url: API_ROUTES.adminMembership.proteins,
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((p) => ({ type: "AdminProtein" as const, id: p.id })),
              { type: "AdminProtein" as const, id: "LIST" },
            ]
          : [{ type: "AdminProtein" as const, id: "LIST" }],
    }),

    createAdminProtein: builder.mutation<ApiSuccess<AdminProtein>, CreateAdminProteinRequest>({
      query: (body) => ({
        url: API_ROUTES.adminMembership.proteins,
        method: "POST",
        data: toFormData(body),
        formData: true,
      }),
      invalidatesTags: [{ type: "AdminProtein", id: "LIST" }],
    }),

    updateAdminProtein: builder.mutation<ApiSuccess<AdminProtein>, UpdateAdminProteinRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.adminMembership.protein(id),
        method: "PATCH",
        data: toFormData(body),
        formData: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminProtein", id },
        { type: "AdminProtein", id: "LIST" },
      ],
    }),

    deleteAdminProtein: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.adminMembership.protein(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminProtein", id },
        { type: "AdminProtein", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminMembershipStatsQuery,
  useListAdminMembershipPlansQuery,
  useCreateAdminMembershipPlanMutation,
  useUpdateAdminMembershipPlanMutation,
  useDeleteAdminMembershipPlanMutation,
  useListAdminSubscribersQuery,
  useListAdminProteinsQuery,
  useCreateAdminProteinMutation,
  useUpdateAdminProteinMutation,
  useDeleteAdminProteinMutation,
} = adminMembershipApi;
