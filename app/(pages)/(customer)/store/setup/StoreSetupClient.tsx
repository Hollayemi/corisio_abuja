"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ErrorText,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/app/components/auth/AuthFields";
import useOpenAuth from "@/app/components/auth/useOpenAuth";
import { useAuth, useCreateStore } from "@/lib/auth/hooks";
import {
  DASHBOARD_PATH,
  firstName,
  hasStore,
  needsStoreSetup,
} from "@/lib/auth/staff";
import { isNotEmpty, isValidEmail, isValidName, parseCoordinate } from "@/lib/auth/validation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import { SignupAccountType } from "@/redux/types";

const container = "mx-auto w-full max-w-[640px] px-4 py-12 sm:px-6";

/**
 * /store/setup — where a new STORE_OWNER lands after registering.
 * Collects the store profile (CreateStoreDto) and then goes to the dashboard.
 */
export default function StoreSetupClient() {
  const router = useRouter();
  const openAuth = useOpenAuth();
  const { user, status } = useAuth();

  const needsSetup = needsStoreSetup(user);
  const alreadySetUp = hasStore(user);

  // Anyone with a store is done; anyone who didn't sign up as a store owner has no business here
  useEffect(() => {
    if (status !== "authenticated") return;
    if (alreadySetUp) router.replace(DASHBOARD_PATH);
    else if (!needsSetup) router.replace("/");
  }, [status, needsSetup, alreadySetUp, router]);

  if (status === "loading" || (status === "authenticated" && !needsSetup)) {
    return (
      <div className={container} aria-busy="true" aria-label="Loading">
        <div className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={`${container} text-center`}>
        <h1 className="text-2xl font-bold text-neutral-900">Set up your store</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
          Sign in or create a store owner account to set up your store.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openAuth("register", { accountType: SignupAccountType.STORE_OWNER })}
            className="inline-flex h-[52px] items-center justify-center rounded-lg bg-corisio-blue px-8 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Create a store owner account
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="inline-flex h-[52px] items-center justify-center rounded-lg border border-neutral-300 px-8 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={container}>
      <h1 className="text-2xl font-bold text-neutral-900">
        Welcome, {firstName(user?.name)}. Let&rsquo;s set up your store.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Tell shoppers who you are and where to find you. You can change any of this later.
      </p>

      <StoreForm defaultEmail={user?.email ?? ""} defaultPhone={user?.phone ?? ""} />
    </div>
  );
}

function StoreForm({
  defaultEmail,
  defaultPhone,
}: {
  defaultEmail: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  const lat = parseCoordinate(latitude, 90);
  const lng = parseCoordinate(longitude, 180);

  const valid =
    isValidName(name) &&
    isValidEmail(email) &&
    isNotEmpty(phone) &&
    isNotEmpty(address) &&
    isNotEmpty(region) &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);

  function touch<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setError("");
    };
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("This browser can't share your location. Enter the coordinates instead.");
      return;
    }

    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError("We couldn't get your location. Allow location access, or enter the coordinates.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || isLoading) return;

    setError("");
    try {
      // On success the user is refreshed, so `user.memberships` is filled in before we leave
      await createStore({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        region: region.trim(),
        latitude: lat,
        longitude: lng,
        description: description.trim() || undefined,
      }).unwrap();

      notify.success("Your store is ready", {
        message: "Taking you to your store dashboard.",
      });
      router.replace(DASHBOARD_PATH);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
      <TextField
        label="Store Name"
        name="storeName"
        autoComplete="organization"
        autoFocus
        value={name}
        onChange={(e) => touch(setName)(e.target.value)}
        placeholder="e.g. Amina's Fresh Market"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Store Email"
          type="email"
          name="storeEmail"
          autoComplete="email"
          value={email}
          onChange={(e) => touch(setEmail)(e.target.value)}
          placeholder="store@example.com"
        />
        <TextField
          label="Store Phone"
          type="tel"
          name="storePhone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => touch(setPhone)(e.target.value)}
          placeholder="Enter the store's phone number"
        />
      </div>

      <TextField
        label="Store Address"
        name="address"
        autoComplete="street-address"
        value={address}
        onChange={(e) => touch(setAddress)(e.target.value)}
        placeholder="Street address"
      />

      <TextField
        label="Region"
        name="region"
        value={region}
        onChange={(e) => touch(setRegion)(e.target.value)}
        placeholder="e.g. Gwarinpa, Abuja"
      />

      <fieldset>
        <legend className="text-sm font-medium text-neutral-900">Map Location</legend>
        <p className="mt-1 text-xs text-neutral-500">
          Shoppers nearby find you with this. Stand in your store and use your current location, or
          type the coordinates.
        </p>

        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <TextField
            label="Latitude"
            name="latitude"
            inputMode="decimal"
            value={latitude}
            onChange={(e) => touch(setLatitude)(e.target.value)}
            placeholder="e.g. 9.0765"
            hint={latitude && Number.isNaN(lat) ? "Enter a number between -90 and 90" : undefined}
          />
          <TextField
            label="Longitude"
            name="longitude"
            inputMode="decimal"
            value={longitude}
            onChange={(e) => touch(setLongitude)(e.target.value)}
            placeholder="e.g. 7.3986"
            hint={longitude && Number.isNaN(lng) ? "Enter a number between -180 and 180" : undefined}
          />
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="mt-4 inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          {locating ? "Finding you..." : "Use my current location"}
        </button>
      </fieldset>

      <TextAreaField
        label="Description (optional)"
        name="description"
        value={description}
        onChange={(e) => touch(setDescription)(e.target.value)}
        placeholder="What do you sell? What makes your store special?"
      />

      {error && <ErrorText>{error}</ErrorText>}

      <SubmitButton
        disabled={!valid}
        loading={isLoading}
        loadingText="Creating your store..."
      >
        Create My Store
      </SubmitButton>
    </form>
  );
}
