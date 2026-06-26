// Distance helpers for the "near me" feature. Pure functions, no dependencies.

export interface LatLng {
  lat: number;
  lng: number;
}

const R_KM = 6371; // Earth radius
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in km between two points (haversine). */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(s));
}

/** "4.2 km" under 10 km, "12 km" above (one tidy figure). */
export function formatDistance(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

type Located = { latitude: number | null; longitude: number | null };

/**
 * Attach `distance_km` to each row relative to `near`. When `near` is set the
 * result is sorted nearest-first (rows without coordinates sort last). When a
 * `radiusKm` is given, rows beyond it — and rows without coordinates — are
 * dropped, so "within 10 km" means exactly that.
 */
export function withDistance<T extends Located>(
  rows: T[],
  near: LatLng | null,
  radiusKm?: number | null,
): Array<T & { distance_km: number | null }> {
  if (!near) {
    return rows.map((r) => ({ ...r, distance_km: null }));
  }

  let out = rows.map((r) => ({
    ...r,
    distance_km:
      r.latitude != null && r.longitude != null
        ? distanceKm(near.lat, near.lng, r.latitude, r.longitude)
        : null,
  }));

  if (radiusKm != null) {
    out = out.filter((r) => r.distance_km != null && r.distance_km <= radiusKm);
  }

  return out.sort((a, b) => {
    if (a.distance_km == null) return 1;
    if (b.distance_km == null) return -1;
    return a.distance_km - b.distance_km;
  });
}
