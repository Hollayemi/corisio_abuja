import { SettingsCard } from "./Controls";

/**
 * General Settings (store details, operations, payments) has no design yet,
 * so there is nothing to load or save. It stays in the menu so the page
 * matches the design, and says so instead of showing made-up settings.
 */
export function GeneralTab() {
  return (
    <SettingsCard className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-neutral-900">General Settings</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
        Store, operations and payment settings will appear here once they are set up.
      </p>
    </SettingsCard>
  );
}
