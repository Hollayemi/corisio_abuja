"use client";

import { useId, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { storeMemberships } from "@/lib/auth/staff";
import { isValidEmail, isValidName } from "@/lib/auth/validation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetStoreProfileQuery,
  useUpdateStoreLocationMutation,
  useUpdateStoreProfileMutation,
} from "@/redux/slices/storeProfileApi";
import type { OpeningHours, StoreProfile, StoreSocialLinks, UpdateStoreProfileRequest } from "@/redux/types";
import { SectionError, SectionSkeleton, SettingsCard } from "./Controls";
import {
  btn,
  CardHeading,
  DEFAULT_HOURS,
  inputClass,
  isValidPhone,
  normalizeUrl,
  ORDER_PREFIX_PATTERN,
  Row,
  SaveBar,
  selectClass,
  textareaClass,
} from "./store/fields";
import { EMPTY_LOCATION, LocationFields, locationState, type LocationDraft } from "./store/LocationFields";
import { hoursErrors, OpeningHoursEditor } from "./store/OpeningHoursEditor";
import { StoreBranches } from "./store/StoreBranches";
import { StoreBranding } from "./store/StoreBranding";

/** Store roles that may change the store profile. The backend enforces this too. */
const EDIT_ROLES = new Set(["OWNER", "ADMIN"]);

/**
 * Settings -> Profile, store part: everything about the store except StoreSettings
 * (pickup, delivery, minimum order, returns). Shown to anyone who belongs to a store;
 * only OWNER / ADMIN can change it.
 */
export function StoreProfileSection() {
  const { user } = useAuth();
  const memberships = storeMemberships(user);
  const [pickedId, setPickedId] = useState<string | null>(null);

  if (memberships.length === 0) return null;

  const membership = memberships.find((m) => m.storeId === pickedId) ?? memberships[0];
  const canEdit = EDIT_ROLES.has(membership.role.trim().toUpperCase());

  return (
    <section id="store-profile" className="mt-10 space-y-6" aria-label="Store profile">
      {/* Section header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">Store profile</h2>
          <p className="mt-1 text-sm text-neutral-500">
            How <span className="font-medium text-neutral-700">{membership.storeName}</span> appears to shoppers.
            {!canEdit && " Only a store owner or admin can change these details."}
          </p>
        </div>

        {memberships.length > 1 && (
          <div className="w-full sm:w-auto">
            <label htmlFor="store-picker" className="sr-only">
              Choose a store
            </label>
            <select
              id="store-picker"
              aria-label="Choose a store"
              value={membership.storeId}
              onChange={(e) => setPickedId(e.target.value)}
              className={selectClass + " sm:w-64"}
            >
              {memberships.map((m) => (
                <option key={m.storeId} value={m.storeId}>
                  {m.storeName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* key: switching store starts the forms from scratch */}
      <StoreProfileLoader key={membership.storeId} storeId={membership.storeId} canEdit={canEdit} />
    </section>
  );
}

function StoreProfileLoader({ storeId, canEdit }: { storeId: string; canEdit: boolean }) {
  const profile = useGetStoreProfileQuery(storeId);

  if (profile.isLoading) return <SectionSkeleton rows={6} />;
  if (profile.isError || !profile.data) {
    return <SectionError message={getErrorMessage(profile.error)} onRetry={profile.refetch} />;
  }

  const data = profile.data.data;
  return (
    <div className="space-y-6">
      <StoreBranding profile={data} canEdit={canEdit} />
      <StoreDetailsForm profile={data} canEdit={canEdit} />
      <StoreLocationCard profile={data} canEdit={canEdit} />
      <StoreBranches storeId={storeId} canEdit={canEdit} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details, online presence and opening hours (one Save)               */
/* ------------------------------------------------------------------ */

type Draft = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  orderPrefix: string;
  website: string;
  instagram: string;
  facebook: string;
  x: string;
  hours: OpeningHours;
};

const toDraft = (p: StoreProfile): Draft => ({
  name: p.name,
  legalName: p.legalName ?? "",
  tagline: p.tagline ?? "",
  description: p.description ?? "",
  email: p.email,
  phone: p.phone,
  whatsapp: p.whatsapp ?? "",
  orderPrefix: p.orderPrefix,
  website: p.socialLinks?.website ?? "",
  instagram: p.socialLinks?.instagram ?? "",
  facebook: p.socialLinks?.facebook ?? "",
  x: p.socialLinks?.x ?? "",
  hours: p.openingHours ?? DEFAULT_HOURS,
});

const TEXT_KEYS = ["name", "legalName", "tagline", "description", "email", "phone", "whatsapp", "orderPrefix"] as const;
const LINK_KEYS = ["website", "instagram", "facebook", "x"] as const;

const sameText = (a: string, b: string) => a.trim() === b.trim();

/** Small uppercase legend used to group fields inside a long card. */
function Group({ title, children, first }: { title: string; children: React.ReactNode; first?: boolean }) {
  return (
    <fieldset className={first ? "space-y-6" : "space-y-6 border-t border-neutral-100 pt-8"}>
      <legend className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function StoreDetailsForm({ profile, canEdit }: { profile: StoreProfile; canEdit: boolean }) {
  const [updateProfile, { isLoading: saving }] = useUpdateStoreProfileMutation();
  const ids = {
    name: useId(),
    legal: useId(),
    tagline: useId(),
    description: useId(),
    email: useId(),
    phone: useId(),
    whatsapp: useId(),
    prefix: useId(),
    slug: useId(),
    currency: useId(),
    website: useId(),
    instagram: useId(),
    facebook: useId(),
    x: useId(),
  };

  const [saved, setSaved] = useState<Draft>(() => toDraft(profile));
  const [draft, setDraft] = useState<Draft>(() => saved);
  const [error, setError] = useState("");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError("");
  };

  const dirty =
    TEXT_KEYS.some((k) => !sameText(draft[k], saved[k])) ||
    LINK_KEYS.some((k) => !sameText(draft[k], saved[k])) ||
    JSON.stringify(draft.hours) !== JSON.stringify(saved.hours);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Draft, string>> = {};
    if (!isValidName(draft.name)) e.name = "Enter your store name (at least 2 characters).";
    if (!isValidEmail(draft.email)) e.email = "Enter a valid email address.";
    if (!isValidPhone(draft.phone)) e.phone = "Enter a valid phone number.";
    if (draft.whatsapp.trim() && !isValidPhone(draft.whatsapp)) e.whatsapp = "Enter a valid WhatsApp number.";
    if (!ORDER_PREFIX_PATTERN.test(draft.orderPrefix.trim()))
      e.orderPrefix = "Use 2 to 6 capital letters or numbers, e.g. LX.";
    if (draft.tagline.length > 80) e.tagline = "Keep it under 80 characters.";
    for (const k of LINK_KEYS) if (normalizeUrl(draft[k]) === null) e[k] = "Enter a valid link, e.g. https://example.com";
    return e;
  }, [draft]);

  const hoursProblem = Object.keys(hoursErrors(draft.hours)).length > 0;
  const valid = Object.keys(errors).length === 0 && !hoursProblem;

  async function handleSave() {
    if (!canEdit || !valid || !dirty || saving) return;
    setError("");

    const body: UpdateStoreProfileRequest = { storeId: profile.id };
    for (const k of TEXT_KEYS) {
      if (!sameText(draft[k], saved[k])) body[k] = draft[k].trim();
    }
    if (LINK_KEYS.some((k) => !sameText(draft[k], saved[k]))) {
      const links: StoreSocialLinks = {};
      for (const k of LINK_KEYS) links[k] = normalizeUrl(draft[k]) ?? "";
      body.socialLinks = links;
    }
    if (JSON.stringify(draft.hours) !== JSON.stringify(saved.hours)) body.openingHours = draft.hours;

    try {
      const res = await updateProfile(body).unwrap();
      const next = toDraft(res.data);
      setSaved(next);
      setDraft(next);
      notify.success("Store profile updated", { id: "store-profile" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleDiscard() {
    setDraft(saved);
    setError("");
  }

  const disabled = !canEdit;

  return (
    <div className="space-y-6">
      {/* ----------------------------- Details ----------------------------- */}
      <SettingsCard className="p-2 sm:p-4">
        <CardHeading
          title="Store details"
          description="Your name, contact details and the short text shoppers read first."
        />

        <div className="mt-8 space-y-8">
          <Group title="Identity" first>
            <Row label="Store name" htmlFor={ids.name} error={errors.name}>
              <input
                id={ids.name}
                className={inputClass}
                value={draft.name}
                disabled={disabled}
                autoComplete="organization"
                onChange={(e) => set("name", e.target.value)}
              />
            </Row>

            <Row label="Legal name" htmlFor={ids.legal} hint="Your registered business name, if different. Used on invoices.">
              <input
                id={ids.legal}
                className={inputClass}
                value={draft.legalName}
                disabled={disabled}
                onChange={(e) => set("legalName", e.target.value)}
              />
            </Row>

            <Row
              label="Tagline"
              htmlFor={ids.tagline}
              error={errors.tagline}
              hint={`${draft.tagline.length}/80 · Shown under your name on the map.`}
            >
              <input
                id={ids.tagline}
                className={inputClass}
                value={draft.tagline}
                disabled={disabled}
                placeholder="e.g. Fresh produce and daily essentials"
                onChange={(e) => set("tagline", e.target.value)}
              />
            </Row>

            <Row label="Description" htmlFor={ids.description} hint="What you sell and what makes your store special.">
              <textarea
                id={ids.description}
                rows={5}
                maxLength={1000}
                className={textareaClass}
                value={draft.description}
                disabled={disabled}
                onChange={(e) => set("description", e.target.value)}
              />
            </Row>
          </Group>

          <Group title="Contact">
            <Row label="Store email" htmlFor={ids.email} error={errors.email}>
              <input
                id={ids.email}
                type="email"
                className={inputClass}
                value={draft.email}
                disabled={disabled}
                autoComplete="email"
                onChange={(e) => set("email", e.target.value)}
              />
            </Row>

            <Row label="Store phone" htmlFor={ids.phone} error={errors.phone}>
              <input
                id={ids.phone}
                type="tel"
                inputMode="tel"
                className={inputClass}
                value={draft.phone}
                disabled={disabled}
                autoComplete="tel"
                onChange={(e) => set("phone", e.target.value)}
              />
            </Row>

            <Row
              label="WhatsApp"
              htmlFor={ids.whatsapp}
              error={errors.whatsapp}
              hint="Optional. Lets shoppers message you directly."
            >
              <input
                id={ids.whatsapp}
                type="tel"
                inputMode="tel"
                className={inputClass}
                value={draft.whatsapp}
                disabled={disabled}
                placeholder="+234..."
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Row>
          </Group>

          <Group title="Operations">
            <Row
              label="Order prefix"
              htmlFor={ids.prefix}
              error={errors.orderPrefix}
              hint="Starts your order numbers, e.g. LX-1042. Only new orders use a changed prefix."
            >
              <input
                id={ids.prefix}
                className={`${inputClass} uppercase`}
                maxLength={6}
                value={draft.orderPrefix}
                disabled={disabled}
                onChange={(e) => set("orderPrefix", e.target.value.toUpperCase())}
              />
            </Row>

            <Row
              label="Store link"
              htmlFor={ids.slug}
              hint="Can't be changed here, because shared links would stop working. Contact support to change it."
            >
              <input id={ids.slug} className={inputClass} value={profile.slug} disabled readOnly />
            </Row>

            <Row label="Currency" htmlFor={ids.currency} hint="Fixed once a store has products and orders.">
              <input id={ids.currency} className={inputClass} value={profile.currency} disabled readOnly />
            </Row>
          </Group>
        </div>
      </SettingsCard>

      {/* ------------------------- Online presence ------------------------- */}
      <SettingsCard className="p-6 sm:p-8">
        <CardHeading
          title="Online presence"
          description="Optional links shown on your store page."
        />

        <div className="mt-8 space-y-6">
          <Row label="Website" htmlFor={ids.website} error={errors.website}>
            <input
              id={ids.website}
              className={inputClass}
              value={draft.website}
              disabled={disabled}
              placeholder="https://yourstore.com"
              onChange={(e) => set("website", e.target.value)}
            />
          </Row>

          <Row label="Instagram" htmlFor={ids.instagram} error={errors.instagram}>
            <input
              id={ids.instagram}
              className={inputClass}
              value={draft.instagram}
              disabled={disabled}
              placeholder="https://instagram.com/yourstore"
              onChange={(e) => set("instagram", e.target.value)}
            />
          </Row>

          <Row label="Facebook" htmlFor={ids.facebook} error={errors.facebook}>
            <input
              id={ids.facebook}
              className={inputClass}
              value={draft.facebook}
              disabled={disabled}
              placeholder="https://facebook.com/yourstore"
              onChange={(e) => set("facebook", e.target.value)}
            />
          </Row>

          <Row label="X (Twitter)" htmlFor={ids.x} error={errors.x}>
            <input
              id={ids.x}
              className={inputClass}
              value={draft.x}
              disabled={disabled}
              placeholder="https://x.com/yourstore"
              onChange={(e) => set("x", e.target.value)}
            />
          </Row>
        </div>
      </SettingsCard>

      {/* -------------------------- Opening hours -------------------------- */}
      <SettingsCard className="p-6 sm:p-8">
        <CardHeading
          title="Opening hours"
          description="Powers the Open / Closed badge on the stores map."
        />

        <div className="mt-6">
          <OpeningHoursEditor value={draft.hours} onChange={(h) => set("hours", h)} disabled={disabled} />
        </div>

        {canEdit && (
          <div className="mt-8 border-t border-neutral-200 pt-8">
            <SaveBar
              onSave={handleSave}
              onDiscard={handleDiscard}
              canSave={valid}
              dirty={dirty}
              saving={saving}
              error={error}
            />
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main location                                                       */
/* ------------------------------------------------------------------ */

const toLocationDraft = (p: StoreProfile): LocationDraft =>
  p.location
    ? {
        label: p.location.label,
        address: p.location.address,
        region: p.location.region,
        country: p.location.country,
        phone: p.location.phone ?? "",
        latitude: String(p.location.latitude),
        longitude: String(p.location.longitude),
      }
    : { ...EMPTY_LOCATION };

function StoreLocationCard({ profile, canEdit }: { profile: StoreProfile; canEdit: boolean }) {
  const [updateLocation, { isLoading: saving }] = useUpdateStoreLocationMutation();
  const tzId = useId();

  const [saved, setSaved] = useState(() => ({
    ...toLocationDraft(profile),
    timezone: profile.location?.timezone ?? "Africa/Lagos",
  }));
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState("");

  const timezones = useMemo(() => {
    const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    return all.includes(saved.timezone) ? all : [saved.timezone, ...all];
  }, [saved.timezone]);

  const { lat, lng, valid } = locationState(draft);
  const dirty = (Object.keys(draft) as (keyof typeof draft)[]).some((k) => !sameText(draft[k], saved[k]));

  async function handleSave() {
    if (!canEdit || !valid || !dirty || saving) return;
    setError("");
    try {
      const res = await updateLocation({
        storeId: profile.id,
        label: draft.label.trim(),
        address: draft.address.trim(),
        region: draft.region.trim(),
        country: draft.country.trim(),
        phone: draft.phone.trim() || null,
        latitude: lat,
        longitude: lng,
        timezone: draft.timezone,
      }).unwrap();
      const l = res.data;
      const next = {
        label: l.label,
        address: l.address,
        region: l.region,
        country: l.country,
        phone: l.phone ?? "",
        latitude: String(l.latitude),
        longitude: String(l.longitude),
        timezone: l.timezone,
      };
      setSaved(next);
      setDraft(next);
      notify.success("Store location updated", { id: "store-location" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <SettingsCard className="p-6 sm:p-8">
      <CardHeading
        title="Main location"
        description="Your primary pickup and dispatch point. This is your pin on the stores map."
      />

      <div className="mt-8 space-y-6">
        <LocationFields
          value={draft}
          disabled={!canEdit}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }));
            setError("");
          }}
        />

        <Row
          label="Time zone"
          htmlFor={tzId}
          hint="Used for your opening hours and the Open / Closed badge."
        >
          <select
            id={tzId}
            value={draft.timezone}
            disabled={!canEdit}
            onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
            className={selectClass}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Row>

        {canEdit && (
          <div className="border-t border-neutral-200 pt-8">
            <SaveBar
              onSave={handleSave}
              onDiscard={() => {
                setDraft(saved);
                setError("");
              }}
              canSave={valid}
              dirty={dirty}
              saving={saving}
              error={error}
              saveLabel="Save location"
            />
          </div>
        )}
      </div>
    </SettingsCard>
  );
}