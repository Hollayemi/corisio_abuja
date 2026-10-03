/**
 * Admin Settings: Profile, Security (password, two-factor, sessions, login
 * activity), Notification Settings, and Admin Users & Permissions.
 *
 * Everything on the Settings page comes from these types, nothing is
 * hard-coded in the UI: the role names, notification groups and sound list
 * are all sent by the backend. Adjust field names to match the NestJS DTOs.
 */

/** A choice in a select: roles, notification sounds. */
export type AdminSettingsOption = {
  /** What gets sent back, e.g. "operations_manager" or "chime". */
  value: string;
  /** What people read, e.g. "Operations Manager" or "Chime". */
  label: string;
};

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  /** Photo URL, null shows initials. */
  avatar?: string | null;
  /** The role's value, matches one of the roles from listAdminRoles. */
  role: string;
  roleLabel: string;
  bio?: string | null;
  /** Only some roles (e.g. a Super Admin) can change their own role. */
  canChangeRole: boolean;
};

/** Send only what changed. `avatar` is uploaded as multipart/form-data. */
export type UpdateAdminProfileRequest = {
  name?: string;
  email?: string;
  role?: string;
  bio?: string;
  avatar?: File | null;
};

export type AdminRoleList = {
  items: AdminSettingsOption[];
};

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export type AdminSecurity = {
  /** ISO, null if the password was never changed since the account was created. */
  passwordChangedAt: string | null;
  twoFactorEnabled: boolean;
};

export type ChangeAdminPasswordRequest = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SetAdminTwoFactorRequest = {
  enabled: boolean;
};

/** A device signed into this account. */
export type AdminSession = {
  id: string;
  /** "Chrome on Windows" */
  device: string;
  /** True for the browser making this request: the "THIS DEVICE" tag. */
  isCurrent: boolean;
  /** ISO. */
  signedInAt: string;
  /** ISO. Null or isCurrent shows "Active Now". */
  lastActiveAt: string | null;
};

export type AdminSessionList = {
  items: AdminSession[];
};

/** A sign-in attempt in the Login Activity list. */
export type AdminLoginActivity = {
  id: string;
  device: string;
  /** "Lagos, Nigeria", when the backend can tell. */
  location?: string | null;
  ipAddress?: string | null;
  success: boolean;
  /** ISO. */
  at: string;
};

export type ListAdminLoginActivityParams = {
  /** How many recent attempts to load. */
  limit?: number;
};

export type AdminLoginActivityList = {
  items: AdminLoginActivity[];
};

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type AdminNotificationChannel = "email" | "push";

/** One row: "New orders" with an Email and a Push switch. */
export type AdminNotificationItem = {
  /** Stable id for the event, e.g. "orders.new". */
  key: string;
  label: string;
  email: boolean;
  push: boolean;
};

/** One card: "Orders & deliveries", "Inventory", "Memberships"... */
export type AdminNotificationGroup = {
  id: string;
  title: string;
  description: string;
  items: AdminNotificationItem[];
};

export type AdminQuietHours = {
  enabled: boolean;
  /** "22:00" */
  startTime: string;
  /** "07:00" */
  endTime: string;
};

export type AdminNotificationSettings = {
  quietHours: AdminQuietHours;
  /** The selected sound's value. */
  sound: string;
  soundOptions: AdminSettingsOption[];
  groups: AdminNotificationGroup[];
};

/** Send only what changed. Each switch saves on its own. */
export type UpdateAdminNotificationSettingsRequest = {
  quietHours?: Partial<AdminQuietHours>;
  sound?: string;
  preferences?: { key: string; email?: boolean; push?: boolean }[];
};

/* ------------------------------------------------------------------ */
/* Admin users & permissions                                           */
/* ------------------------------------------------------------------ */

/**
 * active    -> signed in before, can use the portal
 * invited   -> invitation sent, not accepted yet
 * suspended -> blocked by a Super Admin
 */
export type AdminTeamStatus = "active" | "invited" | "suspended";

/** A row in "Users Managements". */
export type AdminTeamMember = {
  id: string;
  fullName: string;
  avatar?: string | null;
  email: string;
  role: string;
  roleLabel: string;
  /** ISO, null when they have never signed in (invited). */
  lastActiveAt: string | null;
  status: AdminTeamStatus;
  /** False for yourself and for people you can't manage: hides the ⋮ menu. */
  canManage: boolean;
};

export type AdminTeamList = {
  items: AdminTeamMember[];
};

export type InviteAdminUserRequest = {
  email: string;
  /** A role value from listAdminRoles. */
  role: string;
};

export type UpdateAdminTeamMemberStatusRequest = {
  id: string;
  status: "active" | "suspended";
};
