"use client";

import { useId, useState } from "react";
import { parseCoordinate } from "@/lib/auth/validation";
import { LocationPicker } from "./LocationPicker";
import { isValidPhone } from "./fields";

const inputClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:outline-none focus:ring-2 focus:ring-corisio-blue/20 disabled:bg-neutral-50 disabled:text-neutral-500";

/** Text boxes hold strings, so coordinates stay strings until they are saved. */
export type LocationDraft = {
  label: string;
  address: string;
  region: string;
  country: string;
  phone: string;
  latitude: string;
  longitude: string;
};

export const EMPTY_LOCATION: LocationDraft = {
  label: "Main",
  address: "",
  region: "",
  country: "Nigeria",
  phone: "",
  latitude: "",
  longitude: "",
};

/** Everything needed before a location can be saved. */
export function locationState(d: LocationDraft) {
  const lat = parseCoordinate(d.latitude, 90);
  const lng = parseCoordinate(d.longitude, 180);
  const phoneOk = d.phone.trim() === "" || isValidPhone(d.phone);
  const valid =
    d.label.trim() !== "" &&
    d.address.trim() !== "" &&
    d.region.trim() !== "" &&
    d.country.trim() !== "" &&
    phoneOk &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);
  return { lat, lng, phoneOk, valid };
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-neutral-900">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Address, phone and map pin for a store location or a branch. */
export function LocationFields({
  value,
  onChange,
  disabled,
}: {
  value: LocationDraft;
  onChange: (patch: Partial<LocationDraft>) => void;
  disabled?: boolean;
}) {
  const base = useId();
  const id = (n: string) => `${base}-${n}`;
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const { lat, lng, phoneOk } = locationState(value);

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setGeoError("This browser can't share your location. Click the map instead.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setLocating(false);
      },
      () => {
        setGeoError("We couldn't get your location. Allow location access, or click the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Label" htmlFor={id("label")}>
          <input id={id("label")} className={inputClass} value={value.label} disabled={disabled} placeholder="e.g. Main, Ikeja Branch" onChange={(e) => onChange({ label: e.target.value })} />
        </Field>
        <Field label="Phone (optional)" htmlFor={id("phone")} error={!phoneOk ? "Enter a valid phone number." : undefined}>
          <input id={id("phone")} type="tel" className={inputClass} value={value.phone} disabled={disabled} autoComplete="tel" onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
      </div>

      <Field label="Street address" htmlFor={id("address")}>
        <input id={id("address")} className={inputClass} value={value.address} disabled={disabled} autoComplete="street-address" onChange={(e) => onChange({ address: e.target.value })} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Region" htmlFor={id("region")}>
          <input id={id("region")} className={inputClass} value={value.region} disabled={disabled} placeholder="e.g. Gwarinpa, Abuja" onChange={(e) => onChange({ region: e.target.value })} />
        </Field>
        <Field label="Country" htmlFor={id("country")}>
          <input id={id("country")} className={inputClass} value={value.country} disabled={disabled} autoComplete="country-name" onChange={(e) => onChange({ country: e.target.value })} />
        </Field>
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-900">Pin on the map</p>
        <p className="mt-1 text-xs text-neutral-500">
          Click the map or drag the pin to the store&rsquo;s door. This is where shoppers are sent for pickup and directions.
        </p>
        <div className="mt-3">
          <LocationPicker
            latitude={Number.isNaN(lat) ? null : lat}
            longitude={Number.isNaN(lng) ? null : lng}
            disabled={disabled}
            onChange={(la, ln) => onChange({ latitude: la.toFixed(6), longitude: ln.toFixed(6) })}
          />
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Latitude" htmlFor={id("lat")} error={value.latitude && Number.isNaN(lat) ? "Enter a number between -90 and 90" : undefined}>
            <input id={id("lat")} inputMode="decimal" className={inputClass} value={value.latitude} disabled={disabled} placeholder="e.g. 9.0765" onChange={(e) => onChange({ latitude: e.target.value })} />
          </Field>
          <Field label="Longitude" htmlFor={id("lng")} error={value.longitude && Number.isNaN(lng) ? "Enter a number between -180 and 180" : undefined}>
            <input id={id("lng")} inputMode="decimal" className={inputClass} value={value.longitude} disabled={disabled} placeholder="e.g. 7.3986" onChange={(e) => onChange({ longitude: e.target.value })} />
          </Field>
        </div>

        {!disabled && (
          <>
            <button
              type="button"
              onClick={locateMe}
              disabled={locating}
              className="mt-4 inline-flex h-11 items-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
            >
              {locating ? "Finding you..." : "Use my current location"}
            </button>
            {geoError && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {geoError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
