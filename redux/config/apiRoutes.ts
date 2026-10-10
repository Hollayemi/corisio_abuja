/**
 * Every backend path in one place.
 * These are best guesses: change them to match your NestJS controllers.
 */
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  stores: {
    /** CreateStoreDto: the store setup step after a STORE_OWNER registers */
    create: "/auth/stores",
  },
  admin: {
    verifyInvite: "/admin/invitations/verify",
    acceptInvite: "/admin/invitations/accept",
  },
  /** Public storefront catalog (home, shop, search, product detail pages). */
  catalog: {
    categories: "/catalog/categories",
    products: "/catalog/products",
    product: (slug: string) => `/catalog/products/${slug}`,
    related: (slug: string) => `/catalog/products/${slug}/related`,
    /** Public stores for the map. Nearest first when the request carries X-User-Lat / X-User-Lng. */
    stores: "/catalog/stores",
    store: (slug: string) => `/catalog/stores/${slug}`,
  },
  inventory: {
    create: "/admin/inventory",
    stats: "/admin/inventory/stats",
    products: "/admin/inventory",
    product: (id: string) => `/admin/inventory/products/${id}`,
    categories: "/admin/inventory/categories",
    category: (id: string) => `/admin/inventory/categories/${id}`,
  },
  cart: {
    validatePromo: "/promo-codes/validate",
    deliveryMethods: "/delivery-methods",
    get: "/cart",
    sync: "/cart",
    merge: "/cart/merge",
    validate: "/cart/validate",
  },
  promotions: {
    stats: "/admin/promotions/stats",
    list: "/admin/promotions",
    detail: (id: string) => `/admin/promotions/${id}`,
    pause: (id: string) => `/admin/promotions/${id}/pause`,
    resume: (id: string) => `/admin/promotions/${id}/resume`,
  },
  membership: {
    plans: "/membership/plans",
    plan: (slugOrId: string) => `/membership/plans/${slugOrId}`,
    proteins: "/membership/proteins",
    options: "/membership/options",
    subscribe: "/membership/subscriptions",
    mine: "/membership/subscriptions/me",
    pause: (id: string) => `/membership/subscriptions/${id}/pause`,
    resume: (id: string) => `/membership/subscriptions/${id}/resume`,
    skipDelivery: (id: string) => `/membership/subscriptions/${id}/skip-delivery`,
    changePlan: (id: string) => `/membership/subscriptions/${id}/plan`,
    updateMix: (id: string) => `/membership/subscriptions/${id}/mix`,
    cancel: (id: string) => `/membership/subscriptions/${id}/cancel`,
  },
  adminOrders: {
    stats: "/admin/orders/stats",
    list: "/admin/orders",
    detail: (id: string) => `/admin/orders/${id}`,
    status: (id: string) => `/admin/orders/${id}/status`,
    cancel: (id: string) => `/admin/orders/${id}/cancel`,
  },
  adminCustomers: {
    stats: "/admin/customers/stats",
    list: "/admin/customers",
    detail: (id: string) => `/admin/customers/${id}`,
    status: (id: string) => `/admin/customers/${id}/status`,
  },
  adminOverview: {
    summary: "/admin/overview",
    topProducts: "/admin/overview/top-products",
  },
  orders: {
    create: "/orders",
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    tracking: (id: string) => `/orders/${id}/tracking`,
    rating: (id: string) => `/orders/${id}/rating`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    returnEligibility: (id: string) => `/orders/${id}/return/eligibility`,
    requestReturn: (id: string) => `/orders/${id}/return`,
    reorder: (id: string) => `/orders/${id}/reorder`,
  },

  users: {
    me: "/users/me",
    updateMe: "/users/me",
    avatar: "/users/me/avatar",
    password: "/users/me/password",
    addresses: "/users/me/addresses",
    address: (id: string) => `/users/me/addresses/${id}`,
  },

} as const;