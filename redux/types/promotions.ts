/**
 * Promotions: discount deals and coupon codes, and the products/orders they
 * affect. Matches the Promotions page design (stats, table, promotion
 * detail drawer, "Create Promotion" form). Adjust field names here to match
 * the NestJS DTOs once the backend exists — every promotions component
 * reads through these.
 */

/** "Discount Deal" applies automatically; "Coupon Code" needs a code at checkout. */
export type PromotionType = "DISCOUNT_DEAL" | "COUPON_CODE";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY";

export type AppliesTo = "ALL_ORDERS" | "CATEGORY" | "SPECIFIC_PRODUCTS";

export type PromotionStatus =
  | "ACTIVE"
  | "SCHEDULED"
  | "INACTIVE"
  | "EXPIRED"
  | "PAUSED";

/** A product swept into a promotion, shown in the detail drawer's "Products Included" table. */
export type PromotionProduct = {
  id: string;
  name: string;
  category: string;
  image?: string | null;
  unitType: string;
  regularPrice: number;
  promoPrice: number;
  unitsSold: number;
};

/** A row in the Promotions table, and the summary shown at the top of the detail drawer. */
export type Promotion = {
  id: string;
  name: string;
  type: PromotionType;
  discountType: DiscountType;
  /** Percentage points (15) or a naira amount (5000), read together with discountType */
  discountValue: number;
  appliesTo: AppliesTo;
  /** Set when appliesTo is "category" */
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  /** Set when appliesTo is "specific_products" */
  productIds?: string[];
  /** How many products/orders this currently reaches — drives the table's "Applies To" cell */
  affectedCount: number;
  minimumOrderAmount?: number | null;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  limitPerCustomer?: number | null;
  /** Set for coupon_code promotions */
  code?: string | null;
  startAt: string;
  endAt?: string | null;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
};

/** The extra numbers shown only in the promotion detail drawer. */
export type PromotionDetail = Promotion & {
  totalProductsAffected: number;
  totalDiscountGiven: number;
  totalOrdersAffected: number;
  totalSalesMade: number;
  products: PromotionProduct[];
};

export type CreatePromotionRequest = {
  type: PromotionType;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: AppliesTo;
  categoryId?: string;
  productIds?: string[];
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  limitPerCustomer?: number;
  startAt: string;
  /** Omit for "runs until the usage limit is hit" */
  endAt?: string;
};

export type UpdatePromotionRequest = Partial<CreatePromotionRequest> & {
  id: string;
};

export type ListPromotionsParams = {
  /** Matches the "Search using order id......" box (searches name/code) */
  search?: string;
  type?: PromotionType;
  status?: PromotionStatus;
  page?: number;
  perPage?: number;
};

/** The four numbers at the top of the Promotions page. */
export type PromotionStats = {
  activePromotions: { value: number; changePercent?: number };
  scheduled: { value: number; change?: number };
  productsOnPromotion: { value: number; changePercent?: number };
  promotionSales: { value: number; change?: number };
};
