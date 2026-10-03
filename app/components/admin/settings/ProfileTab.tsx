"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useGetAdminProfileQuery,
  useListAdminRolesQuery,
  useUpdateAdminProfileMutation,
} from "@/redux/slices/adminSettingsApi";
import type { AdminProfile, AdminSettingsOption } from "@/redux/types/adminSettings";
import { Avatar, SectionError, SectionSkeleton, SettingsCard } from "./Controls";
import { EMAIL_PATTERN } from "./formatters";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif"];

const inputClass =
  "h-14 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/20 disabled:bg-neutral-50 disabled:text-neutral-500";

function Row({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-8">
      <label htmlFor={htmlFor} className="pt-0 text-base font-semibold text-neutral-900 sm:pt-4">
        {label}
      </label>
      <div className="max-w-[730px]">
        {children}
        {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    </div>
  );
}

type Draft = {
  name: string;
  email: string;
  role: string;
  bio: string;
};

const toDraft = (p: AdminProfile): Draft => ({
  name: p.name,
  email: p.email,
  role: p.role,
  bio: p.bio ?? "",
});

/** Profile tab: loads the signed-in admin's profile and lets them edit it. */
export function ProfileTab() {
  const profile = useGetAdminProfileQuery();
  const roles = useListAdminRolesQuery();

  if (profile.isLoading) return <SectionSkeleton rows={5} />;
  if (profile.isError || !profile.data) {
    return <SectionError message={getErrorMessage(profile.error)} onRetry={profile.refetch} />;
  }

  return <ProfileForm profile={profile.data.data} roles={roles.data?.data.items ?? []} />;
}

function ProfileForm({ profile, roles }: { profile: AdminProfile; roles: AdminSettingsOption[] }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [updateProfile, { isLoading: saving }] = useUpdateAdminProfileMutation();

  const ids = { first: useId(), last: useId(), email: useId(), role: useId(), bio: useId() };
  const fileRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState<Draft>(() => toDraft(profile));
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  // The picked photo and its preview link, kept together so the link is always cleaned up
  const [avatar, setAvatar] = useState<{ file: File; url: string } | null>(null);
  const avatarFile = avatar?.file ?? null;
  const avatarPreview = avatar?.url ?? null;
  const previewRef = useRef<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [error, setError] = useState("");

  function clearAvatar() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setAvatar(null);
  }

  // Free the preview when the form goes away
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const dirty = !!avatarFile || (Object.keys(draft) as (keyof Draft)[]).some((k) => draft[k].trim() !== saved[k].trim());
  const emailValid = EMAIL_PATTERN.test(draft.email.trim());
  const valid = draft.name.trim() !== "" && emailValid;

  // Make sure the signed-in role still shows if the roles list hasn't loaded
  const roleOptions = roles.some((r) => r.value === profile.role)
    ? roles
    : [{ value: profile.role, label: profile.roleLabel }, ...roles];

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Use a PNG, JPG or GIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is over 4MB. Pick a smaller one.");
      return;
    }
    setAvatarError("");
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setAvatar({ file, url });
  }

  async function handleSave() {
    if (!valid || !dirty || saving) return;
    setError("");

    // Send only what changed
    const body: Parameters<typeof updateProfile>[0] = {};
    (["name", "email", "role", "bio"] as const).forEach((key) => {
      if (draft[key].trim() !== saved[key].trim()) body[key] = draft[key].trim();
    });
    if (avatarFile) body.avatar = avatarFile;

    try {
      const res = await updateProfile(body).unwrap();
      const next = res.data;
      setSaved(toDraft(next));
      setDraft(toDraft(next));
      clearAvatar();
      notify.success("Profile updated", { id: "admin-profile" });

      // Refresh the name and photo in the top bar
      await updateSession({
        name: next.name,
        image: next.avatar ?? null,
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleDiscard() {
    setDraft(saved);
    clearAvatar();
    setAvatarError("");
    setError("");
  }

  return (
    <SettingsCard className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-6 border-b border-neutral-200 pb-8 sm:gap-10">
        <Avatar
          name={profile.name}
          src={avatarPreview ?? profile.avatar}
          className="size-28 text-2xl sm:size-36"
        />
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
            {profile.name}
          </h2>
          <p className="mt-1.5 text-sm">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded font-semibold text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue"
            >
              Choose an image
            </button>{" "}
            <span className="text-neutral-400">PNG, JPG or GIF (Max 4MB)</span>
          </p>
          {avatarFile && (
            <p className="mt-1 text-xs text-neutral-500">
              {avatarFile.name} will be uploaded when you save.
            </p>
          )}
          {avatarError && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {avatarError}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={AVATAR_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <Row label="Name" htmlFor={ids.first}>
          <input id={ids.first} className={inputClass} value={draft.name} autoComplete="name" onChange={(e) => set("name", e.target.value)} />
        </Row>
        <Row label="Email Address" htmlFor={ids.email}>
          <input
            id={ids.email}
            type="email"
            className={inputClass}
            value={draft.email}
            autoComplete="email"
            aria-invalid={!emailValid && draft.email !== ""}
            onChange={(e) => set("email", e.target.value)}
          />
          {!emailValid && draft.email !== "" && (
            <p role="alert" className="mt-1.5 text-xs text-red-600">Enter a valid email address.</p>
          )}
        </Row>
        <Row
          label="Role"
          htmlFor={ids.role}
          hint={profile.canChangeRole ? undefined : "Only a Super Admin can change roles."}
        >
          <div className="relative">
            <select
              id={ids.role}
              className={`${inputClass} appearance-none pr-12`}
              value={draft.role}
              disabled={!profile.canChangeRole}
              onChange={(e) => set("role", e.target.value)}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <AdminIcon name="chevronDown" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-700" />
          </div>
        </Row>
        <Row label="Bio" htmlFor={ids.bio}>
          <textarea
            id={ids.bio}
            rows={5}
            maxLength={500}
            placeholder="Write about yourself"
            value={draft.bio}
            onChange={(e) => set("bio", e.target.value)}
            className="w-full resize-none rounded-xl border border-transparent bg-neutral-100 px-4 py-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-corisio-blue/20"
          />
        </Row>

        <div className="sm:grid sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:gap-8">
          <span aria-hidden="true" className="hidden sm:block" />
          <div className="max-w-[730px]">
            {error && (
              <p role="alert" className="mb-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || !valid || saving}
                className="h-12 rounded-xl bg-[#4a7c3a] px-6 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!dirty || saving}
                className="h-12 rounded-xl border border-neutral-300 px-6 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
