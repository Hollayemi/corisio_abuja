import { API_ROUTES } from "../config/apiRoutes";
import type {
  Address,
  ApiSuccess,
  ChangePasswordRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  UpdateProfileRequest,
  UploadAvatarResponse,
  UserProfile,
} from "../types";
import baseApi from "../slices/baseApi";

/**
 * Users — the signed-in person's own profile, credentials and address
 * book. Backs the /account page (Personal Information + Manage Address).
 *
 *  GET    /users/me                  getMe
 *  PATCH  /users/me                  updateProfile
 *  POST   /users/me/avatar           uploadAvatar   (multipart/form-data)
 *  PATCH  /users/me/password         changePassword
 *  GET    /users/me/addresses        listAddresses
 *  POST   /users/me/addresses        addAddress
 *  PATCH  /users/me/addresses/:id    updateAddress
 *  DELETE /users/me/addresses/:id    deleteAddress
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiSuccess<UserProfile>, void>({
      query: () => ({ url: API_ROUTES.users.me, method: "GET" }),
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<ApiSuccess<UserProfile>, UpdateProfileRequest>({
      query: (body) => ({
        url: API_ROUTES.users.updateMe,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["User"],
    }),

    /** `formData` should hold a single "avatar" file field. */
    uploadAvatar: builder.mutation<ApiSuccess<UploadAvatarResponse>, FormData>({
      query: (formData) => ({
        url: API_ROUTES.users.avatar,
        method: "POST",
        data: formData,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<ApiSuccess<null>, ChangePasswordRequest>({
      query: (body) => ({
        url: API_ROUTES.users.password,
        method: "PATCH",
        data: body,
      }),
    }),

    listAddresses: builder.query<ApiSuccess<Address[]>, void>({
      query: () => ({ url: API_ROUTES.users.addresses, method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((a) => ({ type: "Addresses" as const, id: a.id })),
              { type: "Addresses" as const, id: "LIST" },
            ]
          : [{ type: "Addresses" as const, id: "LIST" }],
    }),

    addAddress: builder.mutation<ApiSuccess<Address>, CreateAddressRequest>({
      query: (body) => ({
        url: API_ROUTES.users.addresses,
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Addresses", id: "LIST" }],
    }),

    updateAddress: builder.mutation<ApiSuccess<Address>, UpdateAddressRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.users.address(id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Addresses", id }],
    }),

    deleteAddress: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.users.address(id), method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useListAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = usersApi;
