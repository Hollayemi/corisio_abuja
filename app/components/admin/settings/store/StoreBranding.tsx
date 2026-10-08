"use client";

import { useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useRemoveStoreMediaMutation, useUploadStoreMediaMutation } from "@/redux/slices/storeProfileApi";
import type { StoreMediaKind, StoreProfile } from "@/redux/types";
import { Avatar, SettingsCard } from "../Controls";
import { btn, CardHeading } from "./fields";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const LIMITS: Record<StoreMediaKind, { bytes: number; label: string }> = {
  logo: { bytes: 2 * 1024 * 1024, label: "2MB" },
  banner: { bytes: 5 * 1024 * 1024, label: "5MB" },
};

/**
 * Logo (the round pin on the map) and cover photo (the picture at the top of the map card
 * and the store page). Each uploads the moment it is picked, so it never waits on the
 * Save button below.
 */
export function StoreBranding({ profile, canEdit }: { profile: StoreProfile; canEdit: boolean }) {
  const [upload] = useUploadStoreMediaMutation();
  const [remove] = useRemoveStoreMediaMutation();
  const [busy, setBusy] = useState<StoreMediaKind | null>(null);
  const [errors, setErrors] = useState<Partial<Record<StoreMediaKind, string>>>({});
  const refs = { logo: useRef<HTMLInputElement>(null), banner: useRef<HTMLInputElement>(null) };

  const setError = (kind: StoreMediaKind, message: string) => setErrors((e) => ({ ...e, [kind]: message }));

  async function handleFile(kind: StoreMediaKind, file: File | undefined) {
    if (!file || busy) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError(kind, "Use a PNG, JPG or WebP image.");
    if (file.size > LIMITS[kind].bytes) return setError(kind, `That image is over ${LIMITS[kind].label}. Pick a smaller one.`);

    setError(kind, "");
    setBusy(kind);
    try {
      await upload({ storeId: profile.id, kind, file }).unwrap();
      notify.success(kind === "logo" ? "Logo updated" : "Cover photo updated", { id: `store-${kind}` });
    } catch (err) {
      setError(kind, getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove(kind: StoreMediaKind) {
    if (busy) return;
    setError(kind, "");
    setBusy(kind);
    try {
      await remove({ storeId: profile.id, kind }).unwrap();
      notify.success(kind === "logo" ? "Logo removed" : "Cover photo removed", { id: `store-${kind}` });
    } catch (err) {
      setError(kind, getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const linkButton =
    "rounded font-semibold text-corisio-blue hover:underline focus-visible:outline-2 focus-visible:outline-corisio-blue disabled:opacity-50";

  // Inside StoreBranding, replace the return with:

  return (
    <SettingsCard className="p-6 sm:p-8">
      <CardHeading title="Logo & cover photo" description="Shoppers see these on the stores map and on your store page." />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="space-y-8">
          {/* Logo */}
         {/* Logo */}
{/* Logo */}
<div className="flex items-start gap-4 sm:gap-6">
  {/* Avatar doubles as the upload target when editable */}
  <button
    type="button"
    disabled={!canEdit || busy !== null}
    onClick={() => refs.logo.current?.click()}
    className="group relative size-16 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 transition hover:ring-2 hover:ring-corisio-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-default disabled:hover:ring-1 disabled:hover:ring-neutral-200 sm:size-24"
    aria-label={profile.logo ? "Change logo" : "Upload logo"}
  >
    <Avatar
      name={profile.name}
      src={profile.logo}
      className="size-full text-base sm:text-2xl"
    />

    {canEdit && busy !== "logo" && (
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-neutral-900/0 text-[10px] font-semibold text-white opacity-0 transition group-hover:bg-neutral-900/50 group-hover:opacity-100 group-focus-visible:bg-neutral-900/50 group-focus-visible:opacity-100 sm:text-[11px]"
      >
        {profile.logo ? "Change" : "Upload"}
      </span>
    )}

    {busy === "logo" && (
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 text-[10px] font-semibold text-white sm:text-[11px]"
      >
        …
      </span>
    )}
  </button>

  <div className="min-w-0 flex-1">
    <p className="text-sm font-semibold text-neutral-900">Logo</p>

    {canEdit && (
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => refs.logo.current?.click()}
          className={btn.ghost + " text-xs sm:text-sm"}
        >
          {busy === "logo" ? "Uploading…" : profile.logo ? "Change" : "Upload"}
        </button>

        {profile.logo && (
          <>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => handleRemove("logo")}
              className={btn.ghostDanger + " text-xs sm:text-sm"}
            >
              Remove
            </button>
          </>
        )}
      </div>
    )}

    <p className="mt-1.5 text-xs text-neutral-500">
      Square, at least 256 × 256.
      <span className="hidden sm:inline"> PNG, JPG or WebP (max 2MB).</span>
    </p>

    {errors.logo && (
      <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {errors.logo}
      </p>
    )}
  </div>
</div>

          {/* Cover photo */}
          <div>
            <p className="text-base font-semibold text-neutral-900">Cover photo</p>
            <p className="mt-0.5 text-xs text-neutral-500">Wide photo of your shop front or products, about 1200 × 600. PNG, JPG or WebP (max 5MB).</p>
            <div className="mt-3 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
              {profile.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.banner} alt="Store cover" className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 text-sm text-neutral-400">
                  <span>No cover photo yet</span>
                  <span className="text-xs">A good cover shows your shop front or best products.</span>
                </div>
              )}
            </div>
            {canEdit && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <button type="button" disabled={busy !== null} onClick={() => refs.banner.current?.click()} className={btn.ghost}>
                  {busy === "banner" ? "Uploading..." : profile.banner ? "Change cover photo" : "Upload cover photo"}
                </button>
                {profile.banner && (
                  <button type="button" disabled={busy !== null} onClick={() => handleRemove("banner")} className={btn.ghostDanger}>
                    Remove
                  </button>
                )}
              </div>
            )}
            {errors.banner && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{errors.banner}</p>}
          </div>

          {(["logo", "banner"] as const).map((kind) => (
            <input
              key={kind}
              ref={refs[kind]}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                handleFile(kind, e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          ))}
        </div>

        {/* Preview — sticky on desktop */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <MapCardPreview profile={profile} />
        </div>
      </div>
    </SettingsCard>
  );
}

/** A small copy of the stores map card, so owners can see what their photos and tagline do. */
function MapCardPreview({ profile }: { profile: StoreProfile }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-semibold text-neutral-900">Map card preview</p>
      <p className="mt-0.5 text-xs text-neutral-500">How shoppers see you on the stores map.</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="h-28 bg-neutral-100">
          {profile.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner} alt="" className="size-full object-cover" />
          )}
        </div>
        <div className="flex items-start gap-3 p-4">
          <Avatar name={profile.name} src={profile.logo} className="-mt-9 size-14 border-4 border-white text-base shadow" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutral-800">{profile.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{profile.tagline || "Your tagline appears here."}</p>
            {profile.location && <p className="mt-2 truncate text-xs text-neutral-600">📍 {profile.location.address}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}