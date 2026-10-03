import type { User } from "./auth";

/**
 * Shapes for the Users feature (the signed-in person's own profile,
 * credentials and address book) — backs the /account page. Same pattern
 * as cart.ts / orders.ts: plain request/response types for the NestJS
 * backend, consumed by redux/slices/usersApi.ts.
 */

export type UserProfile = User & {
  /** Digits only, no country code. */
  phone: string;
  avatarUrl: string | null;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
  phone: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

/** Response to POST /users/me/avatar (multipart/form-data upload). */
export type UploadAvatarResponse = {
  avatarUrl: string;
};

export type Address = {
  id: string;
  fullName: string;
  address: string;
  region: string;
  /** Digits only, no country code. */
  phone: string;
  /** Digits only, no country code. */
  phone_sec?: string;
};

export type CreateAddressRequest = Omit<Address, "id">;

export type UpdateAddressRequest = Partial<CreateAddressRequest> & {
  id: string;
};
