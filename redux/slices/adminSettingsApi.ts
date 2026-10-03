import { toFormData } from "@/app/utils/to-form-data";
import type { ApiSuccess } from "../types/api";
import type {
  AdminLoginActivityList,
  AdminNotificationGroup,
  AdminNotificationSettings,
  AdminProfile,
  AdminRoleList,
  AdminSecurity,
  AdminSessionList,
  AdminTeamList,
  AdminTeamMember,
  ChangeAdminPasswordRequest,
  InviteAdminUserRequest,
  ListAdminLoginActivityParams,
  SetAdminTwoFactorRequest,
  UpdateAdminNotificationSettingsRequest,
  UpdateAdminProfileRequest,
  UpdateAdminTeamMemberStatusRequest,
} from "../types/adminSettings";
import baseApi from "./baseApi";

/** Endpoints for the admin Settings page. */
export const ADMIN_SETTINGS_ROUTES = {
  profile: "/admin/settings/profile",
  roles: "/admin/settings/roles",
  security: "/admin/settings/security",
  password: "/admin/settings/security/password",
  twoFactor: "/admin/settings/security/two-factor",
  sessions: "/admin/settings/security/sessions",
  session: (id: string) => `/admin/settings/security/sessions/${id}`,
  loginActivity: "/admin/settings/security/login-activity",
  notifications: "/admin/settings/notifications",
  team: "/admin/settings/team",
  teamMember: (id: string) => `/admin/settings/team/${id}`,
  teamMemberStatus: (id: string) => `/admin/settings/team/${id}/status`,
  /** Same invitations module the invite-accept page already uses. */
  invitations: "/admin/invitations",
  resendInvitation: (id: string) => `/admin/invitations/${id}/resend`,
} as const;

/**
 * Admin Settings.
 *
 *  Profile
 *  ── GET    /admin/settings/profile                        getAdminProfile
 *  ── PATCH  /admin/settings/profile        (multipart)      updateAdminProfile
 *  ── GET    /admin/settings/roles                          listAdminRoles   (profile role + invite role)
 *
 *  Security
 *  ── GET    /admin/settings/security                       getAdminSecurity
 *  ── POST   /admin/settings/security/password               changeAdminPassword
 *  ── PATCH  /admin/settings/security/two-factor             setAdminTwoFactor       (optimistic)
 *  ── GET    /admin/settings/security/sessions              listAdminSessions
 *  ── DELETE /admin/settings/security/sessions/:id           revokeAdminSession
 *  ── GET    /admin/settings/security/login-activity        listAdminLoginActivity
 *
 *  Notifications
 *  ── GET    /admin/settings/notifications                  getAdminNotificationSettings
 *  ── PATCH  /admin/settings/notifications                  updateAdminNotificationSettings (optimistic)
 *
 *  Admin users & permissions
 *  ── GET    /admin/settings/team                           listAdminTeam
 *  ── POST   /admin/invitations                             inviteAdminUser
 *  ── POST   /admin/invitations/:id/resend                  resendAdminInvite
 *  ── PATCH  /admin/settings/team/:id/status                 updateAdminTeamMemberStatus
 *  ── DELETE /admin/settings/team/:id                        removeAdminTeamMember
 *
 * The tags are added here with enhanceEndpoints, so this file needs no change
 * to baseApi.ts. The two switches that save as you click (two-factor and
 * notifications) update the screen straight away and roll back if the save
 * fails, so they never feel slow.
 */
const api = baseApi.enhanceEndpoints({
  addTagTypes: [
    "AdminProfile",
    "AdminRoles",
    "AdminSecurity",
    "AdminSessions",
    "AdminLoginActivity",
    "AdminNotificationSettings",
    "AdminTeam",
  ],
});

export const adminSettingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ----------------------------- Profile ----------------------------- */

    getAdminProfile: builder.query<ApiSuccess<AdminProfile>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.profile }),
      providesTags: ["AdminProfile"],
    }),

    updateAdminProfile: builder.mutation<ApiSuccess<AdminProfile>, UpdateAdminProfileRequest>({
      query: (body) => ({
        url: ADMIN_SETTINGS_ROUTES.profile,
        method: "PATCH",
        // An empty bio must still be sent, so people can clear it
        data: toFormData(body, { includeNullish: false }),
        formData: true,
      }),
      // Name, role and photo also show in the team list
      invalidatesTags: ["AdminProfile", "AdminTeam"],
    }),

    listAdminRoles: builder.query<ApiSuccess<AdminRoleList>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.roles }),
      providesTags: ["AdminRoles"],
    }),

    /* ----------------------------- Security ---------------------------- */

    getAdminSecurity: builder.query<ApiSuccess<AdminSecurity>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.security }),
      providesTags: ["AdminSecurity"],
    }),

    changeAdminPassword: builder.mutation<ApiSuccess<{ passwordChangedAt: string }>, ChangeAdminPasswordRequest>({
      query: (body) => ({
        url: ADMIN_SETTINGS_ROUTES.password,
        method: "POST",
        data: body,
      }),
      // Refreshes "Last changed ..." and the sessions list (other devices may be signed out)
      invalidatesTags: ["AdminSecurity", "AdminSessions"],
    }),

    setAdminTwoFactor: builder.mutation<ApiSuccess<AdminSecurity>, SetAdminTwoFactorRequest>({
      query: (body) => ({
        url: ADMIN_SETTINGS_ROUTES.twoFactor,
        method: "PATCH",
        data: body,
      }),
      async onQueryStarted({ enabled }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          adminSettingsApi.util.updateQueryData("getAdminSecurity", undefined, (draft) => {
            draft.data.twoFactorEnabled = enabled;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    listAdminSessions: builder.query<ApiSuccess<AdminSessionList>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.sessions }),
      providesTags: ["AdminSessions"],
    }),

    /** Signs that device out. Revoking the current device signs this browser out too. */
    revokeAdminSession: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: ADMIN_SETTINGS_ROUTES.session(id), method: "DELETE" }),
      invalidatesTags: ["AdminSessions"],
    }),

    listAdminLoginActivity: builder.query<
      ApiSuccess<AdminLoginActivityList>,
      ListAdminLoginActivityParams | void
    >({
      query: (params) => ({
        url: ADMIN_SETTINGS_ROUTES.loginActivity,
        params: params ?? undefined,
      }),
      providesTags: ["AdminLoginActivity"],
    }),

    /* -------------------------- Notifications -------------------------- */

    getAdminNotificationSettings: builder.query<ApiSuccess<AdminNotificationSettings>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.notifications }),
      providesTags: ["AdminNotificationSettings"],
    }),

    updateAdminNotificationSettings: builder.mutation<
      ApiSuccess<AdminNotificationSettings>,
      UpdateAdminNotificationSettingsRequest
    >({
      query: (body) => ({
        url: ADMIN_SETTINGS_ROUTES.notifications,
        method: "PATCH",
        data: body,
      }),
      // No tag invalidation on purpose: refetching after every click would
      // overwrite switches the person has already flipped since.
      async onQueryStarted(patchBody, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          adminSettingsApi.util.updateQueryData("getAdminNotificationSettings", undefined, (draft) => {
            const settings = draft.data;
            if (patchBody.quietHours) Object.assign(settings.quietHours, patchBody.quietHours);
            if (patchBody.sound !== undefined) settings.sound = patchBody.sound;
            for (const pref of patchBody.preferences ?? []) {
              const item = settings.groups
                .flatMap((g: AdminNotificationGroup) => g.items)
                .find((i) => i.key === pref.key);
              if (!item) continue;
              if (pref.email !== undefined) item.email = pref.email;
              if (pref.push !== undefined) item.push = pref.push;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    /* ------------------------------ Team ------------------------------- */

    listAdminTeam: builder.query<ApiSuccess<AdminTeamList>, void>({
      query: () => ({ url: ADMIN_SETTINGS_ROUTES.team }),
      providesTags: ["AdminTeam"],
    }),

    inviteAdminUser: builder.mutation<ApiSuccess<AdminTeamMember>, InviteAdminUserRequest>({
      query: (body) => ({
        url: ADMIN_SETTINGS_ROUTES.invitations,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["AdminTeam"],
    }),

    resendAdminInvite: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: ADMIN_SETTINGS_ROUTES.resendInvitation(id), method: "POST" }),
    }),

    updateAdminTeamMemberStatus: builder.mutation<
      ApiSuccess<AdminTeamMember>,
      UpdateAdminTeamMemberStatusRequest
    >({
      query: ({ id, status }) => ({
        url: ADMIN_SETTINGS_ROUTES.teamMemberStatus(id),
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["AdminTeam"],
    }),

    removeAdminTeamMember: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: ADMIN_SETTINGS_ROUTES.teamMember(id), method: "DELETE" }),
      invalidatesTags: ["AdminTeam"],
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useListAdminRolesQuery,
  useGetAdminSecurityQuery,
  useChangeAdminPasswordMutation,
  useSetAdminTwoFactorMutation,
  useListAdminSessionsQuery,
  useRevokeAdminSessionMutation,
  useListAdminLoginActivityQuery,
  useGetAdminNotificationSettingsQuery,
  useUpdateAdminNotificationSettingsMutation,
  useListAdminTeamQuery,
  useInviteAdminUserMutation,
  useResendAdminInviteMutation,
  useUpdateAdminTeamMemberStatusMutation,
  useRemoveAdminTeamMemberMutation,
} = adminSettingsApi;
