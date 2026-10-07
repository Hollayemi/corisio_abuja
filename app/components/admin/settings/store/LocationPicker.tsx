"use client";

import dynamic from "next/dynamic";

/** Leaflet needs the browser, so the map is only loaded on the client. */
export const LocationPicker = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-neutral-100" />,
});
