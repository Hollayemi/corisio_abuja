"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/redux/config/errors";
import type { UserProfile } from "@/redux/types";
import {
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/redux/slices/usersApi";
import Avatar from "./Avatar";
import { PasswordField, TextField } from "./fields";
import { FormError, PanelError, PanelSkeleton, SavedNote } from "./PanelState";

const primaryButton =
  "inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-corisio-blue px-6 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:cursor-not-allowed disabled:opacity-60";

export default function PersonalInformationPanel() {
  const { data, isLoading, error, refetch } = useGetMeQuery();
  const profile = data?.data;

  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-900">Personal Information</h2>

      {isLoading && (
        <div className="mt-6">
          <PanelSkeleton />
        </div>
      )}

      {!isLoading && (error || !profile) && (
        <div className="mt-6">
          <PanelError
            message={error ? getErrorMessage(error) : "Couldn't load your profile."}
            onRetry={refetch}
          />
        </div>
      )}

      {/* Keyed by id so a *different* signed-in user gets a fresh, correctly
          re-initialized form instead of stale state from the previous one. */}
      {!isLoading && profile && <ProfileForms key={profile.id} profile={profile} />}
    </div>
  );
}

function ProfileForms({ profile }: { profile: UserProfile }) {
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();

  // Lazily seeded from `profile` on first render only — safe to do here
  // (not in an effect) because remounting via the `key` above is what
  // handles re-seeding when the underlying profile actually changes.
  const [draft, setDraft] = useState(() => ({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  }));
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    try {
      await updateProfile(draft).unwrap();
      setProfileSaved(true);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  }

  async function handleAvatarPick(file: File) {
    setProfileError("");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await uploadAvatar(formData).unwrap();
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setPasswordError("Fill in all three fields.");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      }).unwrap();
      setPasswordSaved(true);
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  }

  return (
    <>
      <form onSubmit={handleProfileSubmit} className="mt-6 max-w-[560px]">
        <Avatar
          name={draft.name}
          src={profile.avatarUrl ?? ""}
          uploading={uploadingAvatar}
          onPick={handleAvatarPick}
        />

        <div className="mt-8 flex flex-col gap-5">
          <TextField
            label="Full Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Email Address"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              required
            />
            <TextField
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={savingProfile} className={primaryButton}>
            {savingProfile ? "Saving…" : "Update Changes"}
          </button>
          <FormError message={profileError} />
          <SavedNote show={profileSaved} />
        </div>
      </form>

      <hr className="my-10 max-w-[560px] border-neutral-200" />

      <form onSubmit={handlePasswordSubmit} className="max-w-[560px]">
        <div className="flex flex-col gap-5">
          <div>
            <PasswordField
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-corisio-blue underline underline-offset-2"
              >
                Forget Password?
              </Link>
            </div>
          </div>

          <PasswordField
            label="New Password"
            placeholder="Enter your new password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
          />

          <PasswordField
            label="Confirm New Password"
            placeholder="Enter your new password again"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          />

          <FormError message={passwordError} />

          <button type="submit" disabled={savingPassword} className={primaryButton}>
            {savingPassword ? "Updating…" : "Update Password"}
          </button>
          <SavedNote show={passwordSaved} />
        </div>
      </form>
    </>
  );
}
