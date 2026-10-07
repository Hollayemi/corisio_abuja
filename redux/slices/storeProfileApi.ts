import { toFormData } from "@/app/utils/to-form-data";
import type { ApiSuccess } from "../types/api";
import type {
  CreateStoreBranchRequest,
  DeleteStoreBranchRequest,
  StoreBranch,
  StoreBranchList,
  StoreLocation,
  StoreMediaKind,
  StoreMediaResult,
  StoreProfile,
  UpdateStoreBranchRequest,
  UpdateStoreLocationRequest,
  UpdateStoreProfileRequest,
  UploadStoreMediaRequest,
} from "../types/storeProfile";
import baseApi from "./baseApi";

/** Endpoints for the store owner's profile (Settings -> Profile). Every path is scoped by store id. */
export const STORE_PROFILE_ROUTES = {
  profile: (storeId: string) => `/stores/${storeId}/profile`,
  location: (storeId: string) => `/stores/${storeId}/location`,
  media: (storeId: string, kind: StoreMediaKind) => `/stores/${storeId}/media/${kind}`,
  branches: (storeId: string) => `/stores/${storeId}/branches`,
  branch: (storeId: string, id: string) => `/stores/${storeId}/branches/${id}`,
} as const;

/**
 * Store profile.
 *
 *  Profile
 *  ── GET    /stores/:storeId/profile                    getStoreProfile
 *  ── PATCH  /stores/:storeId/profile        (JSON)       updateStoreProfile
 *  ── PUT    /stores/:storeId/location       (JSON)       updateStoreLocation
 *
 *  Logo and cover photo
 *  ── POST   /stores/:storeId/media/:kind    (multipart)  uploadStoreMedia   kind = logo | banner
 *  ── DELETE /stores/:storeId/media/:kind                 removeStoreMedia
 *
 *  Branches (StoreAddress)
 *  ── GET    /stores/:storeId/branches                    listStoreBranches
 *  ── POST   /stores/:storeId/branches                    createStoreBranch
 *  ── PATCH  /stores/:storeId/branches/:id                updateStoreBranch
 *  ── DELETE /stores/:storeId/branches/:id                deleteStoreBranch
 *
 * Name and logo also live on `user.memberships` (GET /users/me), so anything that
 * changes them also invalidates the "Auth" tag. That refreshes the store name and logo
 * in the dashboard header without a reload.
 */
const api = baseApi.enhanceEndpoints({
  addTagTypes: ["StoreProfile", "StoreBranches"],
});

export const storeProfileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStoreProfile: builder.query<ApiSuccess<StoreProfile>, string>({
      query: (storeId) => ({ url: STORE_PROFILE_ROUTES.profile(storeId) }),
      providesTags: (_res, _err, storeId) => [{ type: "StoreProfile", id: storeId }],
    }),

    updateStoreProfile: builder.mutation<ApiSuccess<StoreProfile>, UpdateStoreProfileRequest>({
      query: ({ storeId, ...body }) => ({
        url: STORE_PROFILE_ROUTES.profile(storeId),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreProfile", id: storeId }, "Auth"],
    }),

    updateStoreLocation: builder.mutation<ApiSuccess<StoreLocation>, UpdateStoreLocationRequest>({
      query: ({ storeId, ...body }) => ({
        url: STORE_PROFILE_ROUTES.location(storeId),
        method: "PUT",
        data: body,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreProfile", id: storeId }],
    }),

    uploadStoreMedia: builder.mutation<ApiSuccess<StoreMediaResult>, UploadStoreMediaRequest>({
      query: ({ storeId, kind, file }) => ({
        url: STORE_PROFILE_ROUTES.media(storeId, kind),
        method: "POST",
        data: toFormData({ file }),
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreProfile", id: storeId }, "Auth"],
    }),

    removeStoreMedia: builder.mutation<
      ApiSuccess<{ kind: StoreMediaKind }>,
      { storeId: string; kind: StoreMediaKind }
    >({
      query: ({ storeId, kind }) => ({
        url: STORE_PROFILE_ROUTES.media(storeId, kind),
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreProfile", id: storeId }, "Auth"],
    }),

    listStoreBranches: builder.query<ApiSuccess<StoreBranchList>, string>({
      query: (storeId) => ({ url: STORE_PROFILE_ROUTES.branches(storeId) }),
      providesTags: (_res, _err, storeId) => [{ type: "StoreBranches", id: storeId }],
    }),

    createStoreBranch: builder.mutation<ApiSuccess<StoreBranch>, CreateStoreBranchRequest>({
      query: ({ storeId, ...body }) => ({
        url: STORE_PROFILE_ROUTES.branches(storeId),
        method: "POST",
        data: body,
      }),
      // Making a branch the default un-defaults the others, so refetch the whole list
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreBranches", id: storeId }],
    }),

    updateStoreBranch: builder.mutation<ApiSuccess<StoreBranch>, UpdateStoreBranchRequest>({
      query: ({ storeId, id, ...body }) => ({
        url: STORE_PROFILE_ROUTES.branch(storeId, id),
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreBranches", id: storeId }],
    }),

    deleteStoreBranch: builder.mutation<ApiSuccess<{ id: string }>, DeleteStoreBranchRequest>({
      query: ({ storeId, id }) => ({
        url: STORE_PROFILE_ROUTES.branch(storeId, id),
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "StoreBranches", id: storeId }],
    }),
  }),
});

export const {
  useGetStoreProfileQuery,
  useUpdateStoreProfileMutation,
  useUpdateStoreLocationMutation,
  useUploadStoreMediaMutation,
  useRemoveStoreMediaMutation,
  useListStoreBranchesQuery,
  useCreateStoreBranchMutation,
  useUpdateStoreBranchMutation,
  useDeleteStoreBranchMutation,
} = storeProfileApi;
