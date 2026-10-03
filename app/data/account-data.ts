/**
 * Static config for /account ("Account & Settings"). Profile and address
 * data itself comes from redux/slices/usersApi.ts (GET /users/me, GET
 * /users/me/addresses) — nothing here is user data, just UI scaffolding
 * that has no backend equivalent (the state list, the sidebar's labels).
 */

/** Nigerian states — the "Region" select on the address form. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory",
] as const;

export type AccountTab = "personal" | "address" | "support";

export const ACCOUNT_NAV: { id: AccountTab; label: string }[] = [
  { id: "personal", label: "Personal Information" },
  { id: "address", label: "Manage Address" },
  { id: "support", label: "Support & Help" },
];
