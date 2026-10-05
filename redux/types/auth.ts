/**
 * Auth shapes. The request types mirror the NestJS DTOs one to one
 * (RegisterDto, LoginDto, GoogleDto, CreateStoreDto, ForgotPasswordDto,
 * ResetPasswordDto) so a field renamed on the backend is a one-line change here.
 */

/** Mirrors the backend's SignupAccountType enum. */
export enum SignupAccountType {
  CUSTOMER = "CUSTOMER",
  STORE_OWNER = "STORE_OWNER",
}

/** What POST /stores returns (the store that was just created). */
export type StoreSummary = {
  id: number | string;
  name: string;
  slug?: string;
};

/** One entry in `user.memberships`: a store this user belongs to. */
export type StoreMembership = {
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeLogo: string | null;
  /** e.g. "PENDING" until the store is approved */
  storeStatus: string;
  /** The user's role in that store, e.g. "OWNER" */
  role: string;
};

/** GET /users/me */
export type User = {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  /**
   * "CUSTOMER", "HAS_STORE" (belongs to at least one store), or a platform
   * staff role such as "operations_manager".
   */
  role: string;
  /**
   * Set when the person signed up as a STORE_OWNER but hasn't created their
   * store yet; null once they have a store (or never asked for one).
   */
  pendingAccountType?: SignupAccountType | null;
  emailVerified?: string | null;
  createdAt?: string;
  updatedAt?: string;
  /** Empty until the person has a store */
  memberships?: StoreMembership[];
};

/** RegisterDto */
export type RegisterRequest = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  accountType: SignupAccountType;
};

/** LoginDto: no store context at all */
export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/** GoogleDto: `idToken` is the credential from Google Identity Services */
export type GoogleRequest = {
  idToken: string;
  accountType?: SignupAccountType;
};

/** CreateStoreDto: runs after registration */
export type CreateStoreRequest = {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  latitude: number;
  longitude: number;
  description?: string;
};

/** ForgotPasswordDto */
export type ForgotPasswordRequest = {
  email: string;
};

/** ResetPasswordDto */
export type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

/** What the backend's login / google endpoints return inside `data` */
export type AuthPayload = {
  user: User;
  accessToken: string;
};
