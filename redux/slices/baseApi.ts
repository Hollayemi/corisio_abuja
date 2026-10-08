import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "../config/axiosBaseQuery";

/**
 * The single RTK Query API. Feature files (authApi.ts, cartApi.ts, ...) add
 * their endpoints to it with injectEndpoints(), so there is one reducer and
 * one middleware in the store.
 */
const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
    tagTypes: [
    "Orders",
    "Product",
    "Category",
    "InventoryStats",
    "Cart",
    "DeliveryMethods",
    "User",
    "Auth",
    "Addresses",
    "Promotion",
    "PromotionStats",
    "AdminOrder",
    "AdminOrderStats",
    "AdminCustomer",
    "AdminCustomerStats",
    "AdminMembershipStats",
    "AdminMembershipPlan",
    "AdminSubscriber",
    "AdminProtein",
    "MembershipPlan",
    "MembershipProtein",
    "MembershipOptions",
    "MySubscription",
    "AdminDelivery",
    "AdminOverview",
    "AdminTopProducts",
    "Stores"
  ],
  endpoints: () => ({}),
});

export default baseApi;
