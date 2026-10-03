import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  CancelMembershipRequest,
  ChangeMembershipPlanRequest,
  MembershipOptions,
  MembershipPlan,
  MembershipProtein,
  MySubscription,
  SubscribeRequest,
  SubscribeResponse,
  UpdateMembershipMixRequest,
} from "../types";
import baseApi from "./baseApi";

/**
 * Membership (subscription), customer side. Same data staff manage in
 * adminMembershipApi.ts, so nothing on /subscription is hard-coded.
 *
 *  Catalogue (public)
 *  ── GET  /membership/plans                     listMembershipPlans   (active plans only)
 *  ── GET  /membership/plans/:slugOrId           getMembershipPlan
 *  ── GET  /membership/proteins                  listMembershipProteins (active proteins only)
 *  ── GET  /membership/options                   getMembershipOptions   (frequencies, days, windows)
 *
 *  Subscribing (signed in)
 *  ── POST /membership/subscriptions             subscribe   -> payment url
 *
 *  My subscription (signed in)
 *  ── GET  /membership/subscriptions/me                     getMySubscription
 *  ── POST /membership/subscriptions/:id/pause              pauseMembership
 *  ── POST /membership/subscriptions/:id/resume             resumeMembership
 *  ── POST /membership/subscriptions/:id/skip-delivery      skipNextDelivery
 *  ── PATCH /membership/subscriptions/:id/plan              changeMembershipPlan  (upgrade / downgrade)
 *  ── PATCH /membership/subscriptions/:id/mix               updateMembershipMix
 *  ── POST /membership/subscriptions/:id/cancel             cancelMembership
 *
 * Staying in step with admin: pages call the catalogue queries with
 * `refetchOnMountOrArgChange` (see MEMBERSHIP_CATALOGUE_REFETCH), so a plan
 * or protein edited by staff is picked up the next time a page opens after
 * the cache is a minute old. Every action returns the updated subscription
 * and refreshes "my subscription".
 */
export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMembershipPlans: builder.query<ApiSuccess<{ items: MembershipPlan[] }>, void>({
      query: () => ({ url: API_ROUTES.membership.plans }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((p) => ({ type: "MembershipPlan" as const, id: p.id })),
              { type: "MembershipPlan" as const, id: "LIST" },
            ]
          : [{ type: "MembershipPlan" as const, id: "LIST" }],
    }),

    /** By slug (the `?plan=` in the checkout URL) or id. */
    getMembershipPlan: builder.query<ApiSuccess<MembershipPlan>, string>({
      query: (slugOrId) => ({ url: API_ROUTES.membership.plan(slugOrId) }),
      providesTags: (result, _error, slugOrId) => [
        { type: "MembershipPlan", id: result?.data.id ?? slugOrId },
      ],
    }),

    listMembershipProteins: builder.query<ApiSuccess<{ items: MembershipProtein[] }>, void>({
      query: () => ({ url: API_ROUTES.membership.proteins }),
      providesTags: ["MembershipProtein"],
    }),

    getMembershipOptions: builder.query<ApiSuccess<MembershipOptions>, void>({
      query: () => ({ url: API_ROUTES.membership.options }),
      providesTags: ["MembershipOptions"],
    }),

    /** Creates the subscription and starts payment. Send the customer to `payment.authorizationUrl`. */
    subscribe: builder.mutation<ApiSuccess<SubscribeResponse>, SubscribeRequest>({
      query: (body) => ({
        url: API_ROUTES.membership.subscribe,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["MySubscription"],
    }),

    /** null when the signed-in customer has no subscription. */
    getMySubscription: builder.query<ApiSuccess<MySubscription | null>, void>({
      query: () => ({ url: API_ROUTES.membership.mine }),
      providesTags: ["MySubscription"],
    }),

    pauseMembership: builder.mutation<ApiSuccess<MySubscription>, string>({
      query: (id) => ({ url: API_ROUTES.membership.pause(id), method: "POST" }),
      invalidatesTags: ["MySubscription"],
    }),

    resumeMembership: builder.mutation<ApiSuccess<MySubscription>, string>({
      query: (id) => ({ url: API_ROUTES.membership.resume(id), method: "POST" }),
      invalidatesTags: ["MySubscription"],
    }),

    skipNextDelivery: builder.mutation<ApiSuccess<MySubscription>, string>({
      query: (id) => ({ url: API_ROUTES.membership.skipDelivery(id), method: "POST" }),
      invalidatesTags: ["MySubscription"],
    }),

    changeMembershipPlan: builder.mutation<ApiSuccess<MySubscription>, ChangeMembershipPlanRequest>({
      query: ({ id, planId }) => ({
        url: API_ROUTES.membership.changePlan(id),
        method: "PATCH",
        data: { planId },
      }),
      invalidatesTags: ["MySubscription"],
    }),

    updateMembershipMix: builder.mutation<ApiSuccess<MySubscription>, UpdateMembershipMixRequest>({
      query: ({ id, mix }) => ({
        url: API_ROUTES.membership.updateMix(id),
        method: "PATCH",
        data: { mix },
      }),
      invalidatesTags: ["MySubscription"],
    }),

    cancelMembership: builder.mutation<ApiSuccess<MySubscription>, CancelMembershipRequest>({
      query: ({ id, reason }) => ({
        url: API_ROUTES.membership.cancel(id),
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: ["MySubscription"],
    }),
  }),
});

/**
 * Pass as the 2nd argument to the catalogue queries so a page re-checks the
 * backend when its cached copy is older than a minute.
 */
export const MEMBERSHIP_CATALOGUE_REFETCH = { refetchOnMountOrArgChange: 60 } as const;

export const {
  useListMembershipPlansQuery,
  useGetMembershipPlanQuery,
  useListMembershipProteinsQuery,
  useGetMembershipOptionsQuery,
  useSubscribeMutation,
  useGetMySubscriptionQuery,
  usePauseMembershipMutation,
  useResumeMembershipMutation,
  useSkipNextDeliveryMutation,
  useChangeMembershipPlanMutation,
  useUpdateMembershipMixMutation,
  useCancelMembershipMutation,
} = membershipApi;
