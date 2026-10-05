import { API_ROUTES } from "../config/apiRoutes";
import type {
  ApiSuccess,
  MergeCartRequest,
  OrderResponse,
  PlaceOrderRequest,
  PromoInfo,
  ServerStoreCart,
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
 *  ── GET  /delivery-methods    getDeliveryMethods (?storeId=…; replaces the static
 *                               DELIVERY_METHODS fallback once this is live)
 *  ── GET  /cart                getServerCart      (signed-in user's saved carts, one per store)
 *
 *  Sync (all per store: the body carries a storeId)
 *  ── PUT  /cart                syncCart   (save ONE store's cart to the account —
 *                               on meaningful changes, and always before checkout)
 *  ── POST /cart/merge          mergeCart  (fold a guest cart for one store in after login)
 *
 *  Checkout (one store at a time)
 *  ── POST /promo-codes/validate  validatePromo
 *  ── POST /cart/validate         validateCart (re-check stock & current prices
 *                                 immediately before placing the order)
 *  ── POST /orders                placeOrder   (one order per store)
 *
 * The cart itself (add/remove/quantity, address/phone, per-store delivery
 * method and promo) stays client-side in redux/slices/cartSlice.ts — only
 * these boundary actions touch the network.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Pass the storeId to get the methods that store offers. */
    getDeliveryMethods: builder.query<ApiSuccess<DeliveryMethod[]>, string | void>({
      query: (storeId) => ({
        url: API_ROUTES.cart.deliveryMethods,
        method: "GET",
        params: storeId ? { storeId } : undefined,
      }),
      providesTags: ["DeliveryMethods"],
    }),

    getServerCart: builder.query<ApiSuccess<ServerStoreCart[]>, void>({
      query: () => ({
        url: API_ROUTES.cart.get,
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    syncCart: builder.mutation<ApiSuccess<ServerStoreCart>, SyncCartRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.sync,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["Cart"],
    }),

    mergeCart: builder.mutation<ApiSuccess<ServerStoreCart>, MergeCartRequest>({
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
