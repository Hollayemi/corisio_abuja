import { API_ROUTES } from "../config/apiRoutes";
import type { AcceptInviteRequest, ApiSuccess, InviteInfo, User } from "../types";
import baseApi from "./baseApi";

/**
 * Staff invitations. Neither call needs a signed-in user: the token in the
 * emailed link is the credential. Signing in afterwards goes through next-auth.
 */
export const adminAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Checks the link and returns who it was sent to, and for which role. */
    verifyInvite: builder.query<ApiSuccess<InviteInfo>, string>({
      query: (token) => ({
        url: API_ROUTES.admin.verifyInvite,
        params: { token },
      }),
    }),

    /** Creates the staff account from the invitation. */
    acceptInvite: builder.mutation<ApiSuccess<User>, AcceptInviteRequest>({
      query: (body) => ({
        url: API_ROUTES.admin.acceptInvite,
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const { useVerifyInviteQuery, useAcceptInviteMutation } = adminAuthApi;
