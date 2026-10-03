import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  MergeCartRequest,
  OrderResponse,
  PlaceOrderRequest,
  PromoInfo,
  ServerCart,
  SyncCartRequest,
  ValidateCartRequest,
  ValidateCartResponse,
  ValidatePromoRequest,
} from "../types";
import baseApi from "../slices/baseApi";
import { DeliveryMethod } from "../types/checkout";

/**
 * Cart.
 *
 *  Query
 *  ── GET  /delivery-methods    getDeliveryMethods (replaces the static
 *                               DELIVERY_METHODS fallback once this is live)
 *  ── GET  /cart                getServerCart      (signed-in user's saved cart)
 *
 *  Sync
 *  ── PUT  /cart                syncCart   (save the local cart to the account —
 *                               call on meaningful changes, and always before checkout)
 *  ── POST /cart/merge          mergeCart  (fold a guest cart in right after login)
 *
 *  Checkout
 *  ── POST /promo-codes/validate  validatePromo
 *  ── POST /cart/validate         validateCart (re-check stock & current prices
 *                                 immediately before placing the order)
 *  ── POST /orders                placeOrder
 *
 * The cart itself (add/remove/quantity, address/phone/promo fields) stays
 * client-side in redux/slices/cartSlice.ts — only these boundary actions
 * touch the network.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryMethods: builder.query<ApiSuccess<DeliveryMethod[]>, void>({
      query: () => ({
        url: API_ROUTES.cart.deliveryMethods,
        method: "GET",
      }),
      providesTags: ["DeliveryMethods"],
    }),

    getServerCart: builder.query<ApiSuccess<ServerCart>, void>({
      query: () => ({
        url: API_ROUTES.cart.get,
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    syncCart: builder.mutation<ApiSuccess<ServerCart>, SyncCartRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.sync,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Cart"],
    }),

    mergeCart: builder.mutation<ApiSuccess<ServerCart>, MergeCartRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.merge,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Cart"],
    }),

    validatePromo: builder.mutation<ApiSuccess<PromoInfo>, ValidatePromoRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.validatePromo,
        method: "POST",
        data: body,
      }),
    }),

    validateCart: builder.mutation<ApiSuccess<ValidateCartResponse>, ValidateCartRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.validate,
        method: "POST",
        data: body,
      }),
    }),

    placeOrder: builder.mutation<ApiSuccess<OrderResponse>, PlaceOrderRequest>({
      query: (body) => ({
        url: API_ROUTES.orders.create,
        method: "POST",
        data: body,
      }),
      // A placed order empties the account's saved cart too.
      invalidatesTags: ["Orders", "Cart"],
    }),
  }),
});

export const {
  useGetDeliveryMethodsQuery,
  useGetServerCartQuery,
  useSyncCartMutation,
  useMergeCartMutation,
  useValidatePromoMutation,
  useValidateCartMutation,
  usePlaceOrderMutation,
} = cartApi;
