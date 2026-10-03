import { toFormData } from "@/app/utils/to-form-data";
import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  InventoryStats,
  ListProductsParams,
  Paginated,
  Product,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from "../types";
import baseApi from "./baseApi";


export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** The four stat cards at the top of the Inventory page. */
    getInventoryStats: builder.query<ApiSuccess<InventoryStats>, void>({
      query: () => ({ url: API_ROUTES.inventory.stats }),
      providesTags: () => [{ type: "InventoryStats" as const }],
    }),

    /** The product table: search, filters, sort and pagination. */
    listProducts: builder.query<ApiSuccess<Paginated<Product>>, ListProductsParams | void>({
      query: (params) => ({ url: API_ROUTES.inventory.products, params: params ?? undefined }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.items.map((p) => ({ type: "Product" as const, id: p.id })),
            { type: "Product" as const, id: "LIST" },
          ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProduct: builder.query<ApiSuccess<Product>, string>({
      query: (id) => ({ url: API_ROUTES.inventory.product(id) }),
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<ApiSuccess<Product>, CreateProductRequest>({
      query: (body) => ({
        url: API_ROUTES.inventory.create,
        method: "POST",
        data: toFormData(body),
        formData: true,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }, "InventoryStats"],
    }),

    updateProduct: builder.mutation<ApiSuccess<Product>, UpdateProductRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.inventory.product(id),
        method: "PATCH",
        data: toFormData(body),
        formData: true
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        "InventoryStats",
      ],
    }),

    deleteProduct: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.inventory.product(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        "InventoryStats",
      ],
    }),

    /** The "Product Categories" list. */
    listCategories: builder.query<ApiSuccess<{items:Category[]}>, void>({
      query: () => ({ url: API_ROUTES.inventory.categories }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.items.map((c) => ({ type: "Category" as const, id: c.id })),
            { type: "Category" as const, id: "LIST" },
          ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    createCategory: builder.mutation<ApiSuccess<Category>, CreateCategoryRequest>({
      query: (body) => ({
        url: API_ROUTES.inventory.categories,
        method: "POST",
        data: toFormData(body),
        formData: true
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation<ApiSuccess<Category>, UpdateCategoryRequest>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.inventory.category(id),
        method: "PATCH",
        data: toFormData(body),
        formData: true
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<ApiSuccess<{ id: string }>, string>({
      query: (id) => ({ url: API_ROUTES.inventory.category(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInventoryStatsQuery,
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = inventoryApi;
