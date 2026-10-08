"use client";

import { useId, useState } from "react";
import { parseCoordinate } from "@/lib/auth/validation";
import { LocationPicker } from "./LocationPicker";
import { btn, inputClass, isValidPhone, Row } from "./fields";

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

  function locateMe() { /* unchanged */ }

  return (
    <div className="space-y-5">
      {/* Row 1: Label + Phone — stacked on mobile, side-by-side on sm+ */}
      <Row label="Label" htmlFor={id("label")} hint="A short name, e.g. Main or Ikeja Branch.">
        <input
          id={id("label")}
          className={inputClass}
          value={value.label}
          disabled={disabled}
          placeholder="Main"
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </Row>

      <Row label="Phone (optional)" htmlFor={id("phone")} error={!phoneOk ? "Enter a valid phone number." : undefined}>
        <input
          id={id("phone")}
          type="tel"
          inputMode="tel"
          className={inputClass}
          value={value.phone}
          disabled={disabled}
          autoComplete="tel"
          placeholder="+234 800 000 0000"
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </Row>

      <Row label="Street address" htmlFor={id("address")}>
        <input
          id={id("address")}
          className={inputClass}
          value={value.address}
          disabled={disabled}
          autoComplete="street-address"
          placeholder="12 Aminu Kano Cres, Wuse 2"
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </Row>

      {/* Region + Country: 1 col on mobile, 2 cols on md+ */}
      <div className="grid gap-5 md:grid-cols-2">
        <Row label="Region" htmlFor={id("region")} hint="Area, district or state.">
          <input id={id("region")} className={inputClass} value={value.region} disabled={disabled} placeholder="Wuse 2, Abuja" onChange={(e) => onChange({ region: e.target.value })} />
        </Row>
        <Row label="Country" htmlFor={id("country")}>
          <input id={id("country")} className={inputClass} value={value.country} disabled={disabled} autoComplete="country-name" onChange={(e) => onChange({ country: e.target.value })} />
        </Row>
      </div>

      {/* Map — full-width section, own visual block */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Pin on the map</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Click the map or drag the pin to your door. Shoppers use this for pickup and directions.
            </p>
          </div>
          {!disabled && (
            <button type="button" onClick={locateMe} disabled={locating} className={btn.secondary + " h-9 px-3 text-xs"}>
              {locating ? "Finding..." : "Use my location"}
            </button>
          )}
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
          <LocationPicker
            latitude={Number.isNaN(lat) ? null : lat}
            longitude={Number.isNaN(lng) ? null : lng}
            disabled={disabled}
            onChange={(la, ln) => onChange({ latitude: la.toFixed(6), longitude: ln.toFixed(6) })}
          />
        </div>

        {/* Coordinates: 2 cols on all sizes, compact */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id("lat")} className="text-xs font-medium text-neutral-600">Latitude</label>
            <input
              id={id("lat")}
              inputMode="decimal"
              className={inputClass + " mt-1 h-10 text-xs"}
              value={value.latitude}
              disabled={disabled}
              placeholder="9.0765"
              onChange={(e) => onChange({ latitude: e.target.value })}
            />
            {value.latitude && Number.isNaN(lat) && (
              <p role="alert" className="mt-1 text-[11px] text-red-600">Between -90 and 90</p>
            )}
          </div>
          <div>
            <label htmlFor={id("lng")} className="text-xs font-medium text-neutral-600">Longitude</label>
            <input
              id={id("lng")}
              inputMode="decimal"
              className={inputClass + " mt-1 h-10 text-xs"}
              value={value.longitude}
              disabled={disabled}
              placeholder="7.3986"
              onChange={(e) => onChange({ longitude: e.target.value })}
            />
            {value.longitude && Number.isNaN(lng) && (
              <p role="alert" className="mt-1 text-[11px] text-red-600">Between -180 and 180</p>
            )}
          </div>
        </div>

        {geoError && (
          <p role="alert" className="mt-2 text-xs text-red-600">{geoError}</p>
        )}
      </div>
    </div>
  );
}