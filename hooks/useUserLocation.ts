"use client";

import { useEffect, useState } from "react";

export type GeoCoords = { latitude: number; longitude: number } | null;
export type LocationStatus = "locating" | "resolved" | "denied" | "unsupported" | "error";
type LocationState = { label: string; coords: GeoCoords; status: LocationStatus };

const INITIAL: LocationState = { label: "Finding your location…", coords: null, status: "locating" };

// One lookup per page load, shared by every component that asks. OpenStreetMap's
// geocoder allows about one request per second, so repeated lookups would get blocked.
let lookup: Promise<LocationState> | null = null;
let result: LocationState | null = null;

function lookUpLocation(): Promise<LocationState> {
  if (!("geolocation" in navigator)) {
    return Promise.resolve({ label: "Location not supported", coords: null, status: "unsupported" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const coords = { latitude, longitude };
        try {
          // Place names stay in Indonesian so they match the city names stored on jobs.
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=id`;
          const data = await (await fetch(url, { headers: { Accept: "application/json" } })).json();
          const addr = data?.address || {};
          const city =
            addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.hamlet ||
            (data?.display_name ? String(data.display_name).split(",").slice(0, 2).join(", ") : null);
          resolve({ label: city || "Near you", coords, status: "resolved" });
        } catch {
          resolve({ label: "Near you", coords, status: "error" });
        }
      },
      () => resolve({ label: "Location is off", coords: null, status: "denied" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  });
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>(() => result ?? INITIAL);

  useEffect(() => {
    if (result) return;
    let cancelled = false;
    lookup ??= lookUpLocation().then((r) => (result = r));
    lookup.then((r) => {
      if (!cancelled) setState(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
