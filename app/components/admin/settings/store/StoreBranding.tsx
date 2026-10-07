"use client";

import { useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { useRemoveStoreMediaMutation, useUploadStoreMediaMutation } from "@/redux/slices/storeProfileApi";
import type { StoreMediaKind, StoreProfile } from "@/redux/types";
import { Avatar, SettingsCard } from "../Controls";
import { CardHeading } from "./fields";

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

  return (
    <SettingsCard className="p-6 sm:p-8">
      <CardHeading title="Logo & cover photo" description="Shoppers see these on the stores map and on your store page." />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={profile.name} src={profile.logo} className="size-24 text-2xl" />
            <div>
              <p className="text-base font-semibold text-neutral-900">Logo</p>
              <p className="mt-1 text-sm text-neutral-500">Square, at least 256 x 256. PNG, JPG or WebP (max 2MB).</p>
              {canEdit && (
                <p className="mt-2 flex items-center gap-4 text-sm">
                  <button type="button" disabled={busy !== null} onClick={() => refs.logo.current?.click()} className={linkButton}>
                    {busy === "logo" ? "Uploading..." : profile.logo ? "Change logo" : "Upload logo"}
                  </button>
                  {profile.logo && (
                    <button type="button" disabled={busy !== null} onClick={() => handleRemove("logo")} className="rounded font-semibold text-red-600 hover:underline disabled:opacity-50">
                      Remove
                    </button>
                  )}
                </p>
              )}
              {errors.logo && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {errors.logo}
                </p>
              )}
            </div>
          </div>

          {/* Cover photo */}
          <div>
            <p className="text-base font-semibold text-neutral-900">Cover photo</p>
            <p className="mt-1 text-sm text-neutral-500">
              Wide photo of your shop front or products, about 1200 x 600. PNG, JPG or WebP (max 5MB).
            </p>
            <div className="mt-3 aspect-[2/1] w-full max-w-[560px] overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
              {profile.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.banner} alt="Store cover" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-neutral-400">No cover photo yet</div>
              )}
            </div>
            {canEdit && (
              <p className="mt-3 flex items-center gap-4 text-sm">
                <button type="button" disabled={busy !== null} onClick={() => refs.banner.current?.click()} className={linkButton}>
                  {busy === "banner" ? "Uploading..." : profile.banner ? "Change cover photo" : "Upload cover photo"}
                </button>
                {profile.banner && (
                  <button type="button" disabled={busy !== null} onClick={() => handleRemove("banner")} className="rounded font-semibold text-red-600 hover:underline disabled:opacity-50">
                    Remove
                  </button>
                )}
              </p>
            )}
            {errors.banner && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.banner}
              </p>
            )}
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

        <MapCardPreview profile={profile} />
      </div>
    </SettingsCard>
  );
}

/** A small copy of the stores map card, so owners can see what their photos and tagline do. */
function MapCardPreview({ profile }: { profile: StoreProfile }) {
  return (
    <div>
      <p className="text-sm font-semibold text-neutral-900">How shoppers see you on the map</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
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
