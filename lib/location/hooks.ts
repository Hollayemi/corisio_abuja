"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearLocation,
  getLocateStatus,
  readLocation,
  requestLocation,
  subscribeLocation,
  type LocateStatus,
  type UserLocation,
} from "./store";

/**
 * The visitor's location.
 *
 *   const { location, status, locate } = useUserLocation();
 *   await locate();   // asks the browser (shows the permission pop-up the first time)
 *
 * `location` is null until it is known. Every API request already carries it, so
 * components never have to pass coordinates around themselves.
 */
export function useUserLocation() {
  const location = useSyncExternalStore<UserLocation | null>(subscribeLocation, readLocation, () => null);
  const status = useSyncExternalStore<LocateStatus>(subscribeLocation, getLocateStatus, () => "idle");

  const locate = useCallback(() => requestLocation(), []);
  const clear = useCallback(() => clearLocation(), []);

  return { location, status, isLocating: status === "locating", locate, clear };
}
